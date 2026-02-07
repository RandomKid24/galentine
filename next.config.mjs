/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['api.qrserver.com', 'images.unsplash.com'],
        dangerouslyAllowSVG: true,
    },
};

export default nextConfig;
