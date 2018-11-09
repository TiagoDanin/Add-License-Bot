const choosealicense = require('choosealicense-list')
module.exports = app => {
	app.log('Yay, the app was loaded!')
	const files = [
		'LICENSE',
		'LICENSE.md',
		'license',
		'license.md'
	]

	const createFile = async (github, params, license, author) => {
		var licenseRaw = license.body.replace(
			/\[year\]/gi, new Date().getFullYear()
		).replace(
			/\[fullname\]/gi, author
		).replace(
			/\[login\]/gi, author
		).replace(
			/\s\(\[email\]\)/gi, ''
		).replace(
			/\[project\]/gi, params.repo
		).replace(
			/\[description\]/gi, ''
		).replace(
			/\[projecturl\]/gi, `https://github.com/${params.owner}/${params.repo}`
		)
		app.log('License:', licenseRaw)
		app.log('Create file', params)
		return await github.repos.createFile({
			...params,
			path: 'LICENSE',
			message: 'feat: add missing LICENSE',
			content: Buffer.from(licenseRaw).toString('base64')
		}).then(async (res) => {
			if (res && res.data) {
				app.log('Create commit comment', params)
				return github.repos.createCommitComment({
					...params,
					sha: res.data.commit.sha,
					body: `**License Info.**
Author: \`${author}\`
License type: ${license.title}
Repository owner: @${params.owner}
					`,
					path: 'LICENSE',
				}).catch((e) => e)
			}
			return 'Falid create file'
		}).catch((e) => e)
	}

	const checkFiles = async (github, params) => {
		app.log('Analyzed', params)
		for (var filename of files) {
			params.path = filename
			var res = await github.repos.getContent(params).catch((e) => e)
			if (res && res.data) {
				app.log('Found license file', params)
				return res
			}
		}
		params.path = 'package.json'
		return github.repos.getContent(params).then(async (res) => {
			if (res && res.data && res.data.sha) {
				app.log('Found package.json', params)
				var content = Buffer.from(res.data.content, 'base64').toString()
				try {
					content = JSON.parse(content)
				} catch (e) {
					app.log('Invalid package.json', params)
					return e
				}
				var licenseType = (content.license || '').toString()
				var author = params.owner
				if (typeof content.author == 'object' && content.author.name) {
					author = content.author.name
					if (content.author.email) {
						author += ` <${content.author.email}>`
					}
				} else if (typeof content.author == 'string') {
					author = content.author
				}
				app.log('Package.json', licenseType, author)

				var license = choosealicense.find(licenseType)
				if (license) {
					return await createFile(
						github,
						{
							owner: params.owner,
							repo: params.repo
						},
						license,
						author
					)
				}
				return 'Not found license'
			}
		}).catch((e) => e)
	}

	app.on([
		'installation',
		'installation_repositories',
		'integration_installation_repositories'
	], async (ctx) => {
		var repositories = []
		if (ctx.payload) {
			if (ctx.payload.repositories) {
				repositories = ctx.payload.repositories
			} else if (ctx.payload.repositories_added) {
				repositories = ctx.payload.repositories_added
			}
		}
		for (var repo of repositories) {
			await checkFiles(ctx.github, {
				owner: repo.full_name.replace(`/${repo.name}`, ''),
				repo: repo.name
			})
		}
		return
	})

	app.on('push', async (ctx) => {
		return await checkFiles(ctx.github, ctx.repo({}))
	})
}
