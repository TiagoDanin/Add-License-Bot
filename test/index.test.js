/* eslint-disable no-undef */
const {Application} = require('probot')
const payload = require('./fixtures/installation.json')
const myProbotApp = require('..')

describe('Add License Bot', () => {
	let app
	let github
	beforeEach(() => {
		app = new Application()
		app.load(myProbotApp)
		github = {
			repos: {
				getContent: jest.fn()
					.mockImplementationOnce(() => Promise.resolve({}))
					.mockImplementationOnce(() => Promise.resolve({}))
					.mockImplementationOnce(() => Promise.resolve({}))
					.mockImplementationOnce(() => Promise.resolve({}))
					.mockImplementationOnce(() => {
						return Promise.resolve({
							data: {
								content: Buffer.from(`{
								"author": "TiagoDanin <TiagoDanin@outlook.com>",
								"license": "MIT"
							}`).toString('base64'),
								sha: '000000'
							}
						})
					}),
				createFile: jest.fn().mockReturnValue(Promise.resolve({
					data: {
						commit: {
							sha: {
								sha: '1234567890'
							}
						}
					}
				})),
				createCommitComment: jest.fn().mockReturnValue(Promise.resolve({}))
			}
		}
		app.auth = () => Promise.resolve(github)
	})

	test('installation', async () => {
		await app.receive({
			name: 'installation',
			payload
		})
		expect(github.repos.createCommitComment).toHaveBeenCalled()
	})
})
