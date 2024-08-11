/** @type {import('next').NextConfig} */
const nextConfig = {
	images:{
		remotePatterns:[
			{
				protocol:'https',
				hostname:'images.unsplash.com'
			}
		]
	},
	experimental: {
		serverComponentsExternalPackages: ["@node-rs/argon2"]
	}
};

export default nextConfig;
