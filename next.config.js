/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      {
        protocol: 'https',
        hostname: 'lestarihijau.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lenteraedukasi.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'digitalinklusif.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sahabatsehat.co.id',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Enable Turbopack for dev (optional but recommended)
  // experimental: {
  //   turbo: true,
  // },
};

export default nextConfig;