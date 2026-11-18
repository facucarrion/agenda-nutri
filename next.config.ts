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
  // Home page photos: 90 for the fruit cards and screenshots, 80 for the big
  // closing photo (95 weighed about 2.2x more with no visible gain). Rest: 75.
  images: { qualities: [75, 80, 90] },
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
