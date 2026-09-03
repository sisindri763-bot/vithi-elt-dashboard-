import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://40.192.71.150:8002/api/v1/:path*",
      },
      {
        source: "/v1/:path*",
        destination: "http://40.192.71.150:8002/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
