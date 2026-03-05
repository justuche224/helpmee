import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // the project has type errors.
		// this will be removed in the future
        // !! WARN !!
        ignoreBuildErrors: true,
      },
};

export default nextConfig;
