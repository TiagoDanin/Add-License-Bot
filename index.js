const spdxLicenseList = require('spdx-license-list/full')
module.exports = app => {
	app.log('Yay, the app was loaded!')
	const files = [
		'LICENSE',
		'LICENSE.md',
		'license',
		'license.md'
	]
	const createFile = async (github, params) => {
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
		return github.repos.getContent(params).then((res) => {
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
				app.log(licenseType)
				app.log(author)
				for (var license in spdxLicenseList) {
					if (license.toLocaleLowerCase() == licenseType) {
						var licenseRaw = spdxLicenseList[license].licenseText.replace(
							'<year>', new Date().getFullYear()
						).replace(
							'<copyright holders>', author
						)
						params.path = 'LICENSE'
						params.message = 'feat: add missing LICENSE'
						params.content = Buffer.from(licenseRaw).toString('base64')
						app.log('Create file', params)
						return github.repos.createFile(params)
					}
				}
			}
		}).catch((e) => e)
	}

	app.on(['installation', 'installation_repositories'], async (ctx) => {
		if (ctx.payload && ctx.payload.repositories) {
			for (var repo of ctx.payload.repositories) {
				await createFile(ctx.github, {
					owner: repo.full_name.replace(`/${repo.name}`, ''),
					repo: repo.name
				})
			}
		}
		return
	})

	app.on('push', async (ctx) => {
		await createFile(ctx.github, ctx.repo({}))
		return
	})
}
