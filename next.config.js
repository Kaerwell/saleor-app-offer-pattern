/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    esmExternals: false,
  },
  images: {
    domains: ["localhost", "kaerwell.saleor.cloud"],
  },
};
