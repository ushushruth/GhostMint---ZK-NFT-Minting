import type { NextConfig } from "next";
import webpack from "webpack";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {

  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {

    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve("buffer/"),
      };

      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        })
      );
    }
    return config;
  },
} satisfies any;

export default nextConfig;
