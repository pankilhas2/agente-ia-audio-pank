/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  serverExternalPackages: ['@tensorflow/tfjs-node'],
  webpack: (config, { isServer }) => {
    // Configuração para suportar Web Workers
    config.module.rules.push({
      test: /\.worker\.js$/,
      loader: 'worker-loader',
      options: {
        filename: 'static/[hash].worker.js',
        publicPath: '/_next/',
      },
    });

    // Configuração para suportar arquivos de áudio
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[hash].[ext]',
          publicPath: '/_next/static/media/',
          outputPath: 'static/media/',
        },
      },
    });

    // Evitar erros de importação de módulos do lado do servidor
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }

    return config;
  },
};

export default nextConfig;
