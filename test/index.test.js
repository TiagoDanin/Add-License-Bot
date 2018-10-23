const { Application } = require('probot')
const myProbotApp = require('..')

const payload = require('./fixtures/installation.json')

describe('Add License Bot', () => {
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
			},
			gitdata: {
				getReference: jest.fn().mockReturnValue(Promise.resolve({
					data: {
						object: {
							sha: '1234567890'
						}
					}
				})),
				createReference: jest.fn().mockReturnValue(Promise.resolve({
					data: {}
				})),
			},
			pullRequests: {
				create: jest.fn().mockReturnValue(Promise.resolve({}))
			}
		}
		app.auth = () => Promise.resolve(github)
	})

	test('installation', async () => {
		await app.receive({
			name: 'installation',
			payload: payload
		})
		expect(github.pullRequests.create).toHaveBeenCalled()
	})
})
