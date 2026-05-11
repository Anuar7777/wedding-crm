/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS config
const path = require('path')

function backendInternalBase() {
	const raw = process.env.BACKEND_INTERNAL_URL?.trim()
	return raw ? raw.replace(/\/$/, '') : ''
}

module.exports = {
	outputFileTracingRoot: path.join(__dirname, '..'),
	async rewrites() {
		const base = backendInternalBase()
		if (!base) return []
		return [
			{
				source: '/api/:path*',
				destination: `${base}/api/:path*`,
			},
		]
	},
	webpack: (config) => {
		config.resolve.modules = [
			path.join(__dirname, 'node_modules'),
			path.join(__dirname, '..', 'node_modules'),
			...(config.resolve.modules || []),
		]
		return config
	},
}
