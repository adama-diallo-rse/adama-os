import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@adama/ui", "@adama/db"],
};

export default nextConfig;
