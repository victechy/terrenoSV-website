import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: builds to /out as plain HTML/CSS/JS, deployable straight
  // to IONOS hosting via FTP. Dropping `output: 'export'` later (and
  // deploying to Vercel/Netlify instead) upgrades to full server rendering
  // without touching any route code.
  output: "export",
  images: {
    // next/image's optimization API needs a server; static export has none.
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
