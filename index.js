const spdxLicenseList = require('spdx-license-list/full')
module.exports = app => {
	app.log('Yay, the app was loaded!')
	const files = [
		'LICENSE',
		'LICENSE.md',
		'license',
		'license.md'
	]

	const createFile = async (github, params, licenseRaw) => {
		const refMaster = await github.gitdata.getReference({
			...params,
			ref: 'heads/master'
		}).catch((e) => e)
		if (refMaster && refMaster.data) {
			var refAddLicense = await github.gitdata.createReference({
				...params,
				ref: 'refs/heads/add-license',
				sha: refMaster.data.object.sha
			}).catch((e) => e)

			if (!refAddLicense || !refAddLicense.data) {
				app.log('Pull request already exists', params)
				return 'Pull request already exists'
			}

			app.log('Create file & pull request', params)
			await github.repos.createFile({
				...params,
				branch: 'add-license',
				path: 'LICENSE',
				message: 'feat: add missing LICENSE',
				content: Buffer.from(licenseRaw).toString('base64')
			}).catch((e) => e)

			return await github.pullRequests.create({
				...params,
				title: 'Add missing LICENSE',
				head: 'add-license',
				base: 'master',
				body: `**Summary**

- Add missing LICENSE

Via [github.com/apps/Add-License-Bot](https://github.com/apps/Add-License-Bot).
				`,
				maintainer_can_modify: true
			}).catch((e) => e)
		}
		return 'Not found master'
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
				var licenseType = (content.license || '').toString().toLocaleLowerCase()
				var author = (content.author || params.owner).toString()
				app.log('Package.json', licenseType, author)
				for (var license in spdxLicenseList) {
					if (license.toLocaleLowerCase() == licenseType) {
						var licenseRaw = spdxLicenseList[license].licenseText.replace(
							'<year>', new Date().getFullYear()
						).replace(
							'<copyright holders>', author
						)
						return await createFile(
							github,
							{
								owner: params.owner,
								repo: params.repo
							},
							licenseRaw
						)
					}
				}
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
