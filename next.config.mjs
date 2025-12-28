/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: "/vigilant-palm-tree",
  assetPrefix: "/vigilant-palm-tree/"
};

export default nextConfig;
