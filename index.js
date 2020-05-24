const choosealicense = require('choosealicense-list')

module.exports = app => {
	app.log('Yay, the app was loaded!')
	const files = [
		'LICENSE',
		'LICENSE.md',
		'license',
		'license.md'
	]

	const createFile = async (github, parameters, license, author) => {
		const licenseRaw = license.body
			.replace(/\[year]/gi, new Date().getFullYear())
			.replace(/\[fullname]/gi, author)
			.replace(/\[login]/gi, author)
			.replace(/\s\(\[email]\)/gi, '')
			.replace(/\[project]/gi, parameters.repo)
			.replace(/\[description]/gi, '')
			.replace(/\[projecturl]/gi, `https://github.com/${parameters.owner}/${parameters.repo}`)

		app.log('License:', licenseRaw)
		app.log('Create file', parameters)
		return github.repos.createOrUpdateFile({
			...parameters,
			path: 'LICENSE',
			message: 'feat: add missing LICENSE',
			content: Buffer.from(licenseRaw).toString('base64')
		}).then(async response => {
			if (response && response.data) {
				app.log('Create commit comment', parameters)
				return github.repos.createCommitComment({
					...parameters,
					sha: response.data.commit.sha,
					body: `**License Info.**
Author: \`${author}\`
License type: ${license.title}
Repository owner: @${parameters.owner}
					`,
					position: 1,
					path: 'LICENSE'
				}).catch(error => error)
			}

			return 'Falid create file'
		}).catch(error => error)
	}

	const checkFiles = async (github, parameters) => {
		app.log('Analyzed', parameters)
		for (const filename of files) {
			parameters.path = filename
			const response = await github.repos.getContents(parameters).catch(() => false)
			if (response && response.data) {
				app.log('Found license file', parameters)
				return response
			}
		}

		parameters.path = 'package.json'
		return github.repos.getContents(parameters).then(async response => {
			if (response && response.data && response.data.sha) {
				app.log('Found package.json', parameters)
				let content = Buffer.from(response.data.content, 'base64').toString()
				try {
					content = JSON.parse(content)
				} catch (error) {
					app.log('Invalid package.json', parameters)
					return error
				}

				const licenseType = (content.license || '').toString()
				let author = parameters.owner
				if (typeof content.author === 'object' && content.author.name) {
					author = content.author.name
					if (content.author.email) {
						author += ` <${content.author.email}>`
					}
				} else if (typeof content.author === 'string') {
					author = content.author
				}

				app.log('Package.json', licenseType, author)

				// eslint-disable-next-line unicorn/no-fn-reference-in-iterator
				const license = choosealicense.find(licenseType)
				if (license) {
					return createFile(
						github,
						{
							owner: parameters.owner,
							repo: parameters.repo
						},
						license,
						author
					)
				}

				return 'Not found license'
			}
		}).catch(error => error)
	}

	app.on([
		'installation',
		'installation_repositories',
		'integration_installation_repositories'
	], async ctx => {
		let repositories = []
		if (ctx.payload) {
			if (ctx.payload.repositories) {
				repositories = ctx.payload.repositories
			} else if (ctx.payload.repositories_added) {
				repositories = ctx.payload.repositories_added
			}
		}

		for (const repo of repositories) {
			await checkFiles(ctx.github, {
				owner: repo.full_name.replace(`/${repo.name}`, ''),
				repo: repo.name
			})
		}
	})

	app.on('push', async ctx => {
		return checkFiles(ctx.github, ctx.repo({}))
	})
}
