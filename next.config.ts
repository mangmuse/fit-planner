import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: true,
      },
    ];
  },
};

export default withPWA(nextConfig);
