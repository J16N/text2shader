import type { NextConfig } from "next";
import { config } from "dotenv";

const { parsed: myEnv } = config();

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      config.plugins.push(new webpack.EnvironmentPlugin(myEnv));
    }

    return config;
  },
};

export default nextConfig;