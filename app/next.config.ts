import type { NextConfig } from "next";
import { validateEnv } from "./src/lib/env-validator";

// Validate environment variables at build/startup time
validateEnv();

const nextConfig: NextConfig = {
  env: {
    PROTECTION_KEY: process.env.PROTECTION_KEY,
    API_KEY: process.env.API_KEY,
  },
  logging: false,
  devIndicators: false,
};

export default nextConfig;
