/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS config
const path = require('path')

module.exports = {
	outputFileTracingRoot: path.join(__dirname, '..'),
	webpack: (config) => {
		config.resolve.modules = [
			path.join(__dirname, 'node_modules'),
			path.join(__dirname, '..', 'node_modules'),
			...(config.resolve.modules || []),
		]
		return config
	},
}
