/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.geojson$/,
      type: "json",
    });
    return config;
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL
  }
};

export default nextConfig;
