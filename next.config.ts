import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Lets a phone on the same Wi-Fi open the dev server by the computer's
  // address (http://192.168.x.x:3000). Without it Next blocks its dev scripts
  // for any host other than localhost and the page never becomes interactive.
  // Development only: it has no effect in production.
  allowedDevOrigins: ["192.168.*.*"],
  // The home page photos use 90-95 for sharper fruit; everything else keeps 75.
  images: { qualities: [75, 90, 95] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
