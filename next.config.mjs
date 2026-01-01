/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: "/vigilant-palm-tree",
  assetPrefix: "/vigilant-palm-tree/",
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('CopyManifest', (compilation) => {
            const fs = require('fs');
            const path = require('path');
            
            // Copy manifest.json to the out directory during build
            const manifestPath = path.join(__dirname, 'public', 'manifest.json');
            const outDir = path.join(__dirname, 'out');
            
            // Copy to root of out directory so it's accessible at /vigilant-palm-tree/manifest.json when served from GitHub Pages
            const outManifestPath = path.join(outDir, 'manifest.json');
            
            if (fs.existsSync(manifestPath)) {
              fs.copyFileSync(manifestPath, outManifestPath);
            }
          });
        }
      });
    }
    return config;
  },
  // Turbopack configuration
  turbopack: {}
};

export default nextConfig;
