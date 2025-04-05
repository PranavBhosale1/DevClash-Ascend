let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wqewzenlruhorfotbreb.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        has: [
          {
            type: "cookie",
            key: "sb-access-token",
          },
        ],
        permanent: false,
        destination: "/dashboard",
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // If you deploy a Python/Flask server for Streamlit integration
        // Uncomment these lines to enable API proxying
        // {
        //   source: '/api/streamlit/:path*',
        //   destination: 'http://localhost:5000/api/:path*',
        // }
      ]
    };
  },
  transpilePackages: ["lucide-react"],
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
