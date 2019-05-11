const trust = [
	'got',
	'axios',
	'request',
	'request-promise-native',
	'debug',
	'telegraf',
	'telegraf-test',
	'meow',
	'update-notifier',
	'xo',
	'ava',
	'choosealicense-list',
	'enquirer',
	'is-online',
	'lodash',
	'minimist',
	'handlebars',
	'express',
	'vue',
	'cross-env',
	'nuxt',
	'uikit',
	'nodemon',
	'node-fetch'
]

const noPin = deps => {
	Object.keys(deps).map(dep => {
		if (trust.includes(dep)) {
			if (!deps[dep].startsWith('^')) {
				deps[dep] = `^${deps[dep]}`
			}
		}
	})
	return deps
}

module.exports = ctx => {
	if (!ctx.data.dependencies) {
		return false
	}

	ctx.data.dependencies = noPin(ctx.data.dependencies)
	ctx.data.devDependencies = noPin(ctx.data.devDependencies)
	return ctx.data
}
