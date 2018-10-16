const { Application } = require('probot')
const myProbotApp = require('..')

const payload = require('./fixtures/installation.json')

describe('Hacktoberfest Auto Label Bot', () => {
	let app, github
	beforeEach(() => {
		app = new Application()
		app.load(myProbotApp)
		github = {
			repos : {
				getContent: jest.fn()
				.mockImplementationOnce(() => Promise.resolve({}) )
				.mockImplementationOnce(() => Promise.resolve({}) )
				.mockImplementationOnce(() => Promise.resolve({}) )
				.mockImplementationOnce(() => Promise.resolve({}) )
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
				createFile: jest.fn().mockReturnValue(Promise.resolve({}))
			}
		}
		app.auth = () => Promise.resolve(github)
	})

	test('An issue is opened', async () => {
		await app.receive({
			name: 'installation',
			payload: payload
		})
		expect(github.repos.createFile).toHaveBeenCalled()
	})
})
