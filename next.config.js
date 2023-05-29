/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["firebasestorage.googleapis.com", "ipfs.thirdwebcdn.com"],
  },
};

module.exports = nextConfig;
