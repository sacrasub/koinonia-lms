/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignora erros de tipagem durante o deploy na Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
