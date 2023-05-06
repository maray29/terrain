# Three.js starter template.

## Features

Adapted from [Francesco Michelini's threejs starter](https://github.com/kekkorider/threejs-starter).
Added changeset and github actions to publish to npm.

## Installation

Install dependencies:

`pnpm install`

Compile the code and start a local server:

`pnpm dev`

## How to use with Webflow

To use with Webflow add the following script before `</body>`:

`<script type="module" src="http://127.0.0.1:5173/src/index.js"></script>`

Create the build:

`pnpm build`

Deploy through Github, npm and jsdlvr.

Read more about the workflow: [Finsweet guide](https://github.com/finsweet/developer-starter#cicd).

## Credits

Three.js repository template from Francesco Michelini, workflow adapted from [Finsweet developer starter](https://github.com/finsweet/developer-starter)

## License

[MIT](./LICENSE)

Made by [maray](https://maray.ai)
