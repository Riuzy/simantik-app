const nextConfig = {
  reactCompiler: false,
  transpilePackages: ['@mantine/core', '@mantine/hooks', '@mantine/notifications', '@mantine/modals', '@mantine/nprogress'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
