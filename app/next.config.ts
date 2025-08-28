import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PROTECTION_KEY: process.env.PROTECTION_KEY,
  },
};

export default nextConfig;
