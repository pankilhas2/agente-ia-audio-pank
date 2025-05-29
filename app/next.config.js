const withSVGR = require('next-svgr');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
  experimental: {
    optimizeCss: true,
    optimizeFonts: true
  }
};

module.exports = withSVGR(nextConfig);
