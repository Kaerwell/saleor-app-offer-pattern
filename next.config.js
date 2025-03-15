/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    esmExternals: false,
    serverActions: true,
  },
  images: {
    domains: ["localhost", "kaerwell.saleor.cloud"],
  },
};
