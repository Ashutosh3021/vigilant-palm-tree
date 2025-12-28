/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: isProd ? "/vigilant-palm-tree" : "",
  assetPrefix: isProd ? "/vigilant-palm-tree/" : ""
};

export default nextConfig;
