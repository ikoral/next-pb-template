import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/oauth2-redirect",
        destination: "http://127.0.0.1:8090/api/oauth2-redirect",
      },
    ];
  },
};

export default nextConfig;
