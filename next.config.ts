
import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  webpack: (config, { isDev, buildId, dev, config: nextConfig, options }) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },


  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http', // Sandbox images can sometimes be http
        hostname: 'i.ebayimg.sandbox.ebay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', // Also allow https for sandbox
        hostname: 'i.ebayimg.sandbox.ebay.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
        "https://9004-firebase-studio-1748905971598.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev",
        "https://9004-firebase-studio-1748905971598.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev:9004",
        "https://6000-firebase-studio-1748905971598.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
