# Add License Bot

[![Travis](https://img.shields.io/travis/TiagoDanin/Add-License-Bot.svg?branch=master&style=flat-square)](https://travis-ci.org/TiagoDanin/Add-License-Bot) [![Downloads](https://img.shields.io/npm/dt/add-license-bot.svg?style=flat-square)](https://npmjs.org/package/add-license-bot) [![Node](https://img.shields.io/node/v/add-license-bot.svg?style=flat-square)](https://npmjs.org/package/add-license-bot) [![Version](https://img.shields.io/npm/v/add-license-bot.svg?style=flat-square)](https://npmjs.org/package/add-license-bot) [![XO code style](https://img.shields.io/badge/code%20style-XO-red.svg?style=flat-square)](https://github.com/xojs/xo)


![image](https://user-images.githubusercontent.com/5731176/48219879-8dd01e80-e36c-11e8-9d5f-d0c386343cf7.png)

## Summary
If your repository does not have a file with name:
- LICENSE
- LICENSE.md
- license
- license.md

A license file will be generated from package.json.

## Permission
- **Read** access to code.
- **Read** and **write** access to single file ("LICENSE").

## Notification
The bot will mention you in a comment.

## Public App
- [github.com/apps/Add-License](https://github.com/apps/Add-License)

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Tests

To run the test suite, first install the dependencies, then run `test`:

```sh
# NPM
npm test
# Or Using Yarn
yarn test
```

## Dependencies

- [choosealicense-list](https://ghub.io/choosealicense-list): List of licenses from choosealicense.com
- [probot](https://ghub.io/probot): 🤖 A framework for building GitHub Apps to automate and improve your workflow

## Dev Dependencies

- [jest](https://ghub.io/jest): Delightful JavaScript Testing.
- [nodemon](https://ghub.io/nodemon): Simple monitor script for use during development of a node.js app.
- [smee-client](https://ghub.io/smee-client): Client to proxy webhooks to local host
- [xo](https://ghub.io/xo): JavaScript happiness style linter ❤️

## Contributing

If you have suggestions for how Add-License-Bot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## Thanks

- [@wmhilton](https://github.com/wmhilton) - [zeke/package-json-to-readme/issues/32#issuecomment-421673622](https://github.com/zeke/package-json-to-readme/issues/32#issuecomment-421673622)

## License

[MIT](LICENSE) © 2018 TiagoDanin <TiagoDanin@outlook.com> (http://tiagodanin.github.io/Add-License-Bot)
