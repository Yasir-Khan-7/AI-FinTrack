/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // Remove the rewrites since we're using Next.js API routes directly
    // This can sometimes cause issues with how paths are handled

    // Enable webpack function to properly handle Node.js modules
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        };
        return config;
    },
};

module.exports = nextConfig; 