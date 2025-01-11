/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "builders.mypinata.cloud",
      },
      {
        protocol: "https",
        hostname: "ipfs.near.social",
      },
    ],
  },
};

module.exports = nextConfig;
