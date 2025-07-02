import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // ...existing domains...
      {
        protocol: "https",
        hostname: "readdy.ai",
      },
    ],
  },
};

export default withPayload(nextConfig);
