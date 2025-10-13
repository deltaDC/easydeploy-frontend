/*** Next.js config (ESM) ***/
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		serverActions: {
			bodySizeLimit: '2mb',
		},
	},
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: '**' },
		],
	},
};

export default nextConfig;
