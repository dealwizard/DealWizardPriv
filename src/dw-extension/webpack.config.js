const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const environment = isProduction ? 'production' : 'development';
  console.log(`Building for ${environment} environment`);

  // Read the appropriate config file

  return {
    mode: environment === 'production' ? 'production' : 'development',
    devtool: environment === 'production' ? false : 'source-map',
    entry: {
      background: './src/background.ts',
      popup: './src/popup.ts',
      content: './src/content.ts',
      content_home: './src/content_home.ts',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@config': path.resolve(__dirname, `src/config/config.${environment}.ts`)
      }
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'src/manifest.json', to: 'manifest.json' },
          { from: 'src/popup.html', to: 'popup.html' },
          { from: 'src/assets', to: 'assets', noErrorOnMissing: true },
          { from: 'src/styles', to: 'styles'},
        ],
      }),
      // Inject configuration into the build
      new webpack.NormalModuleReplacementPlugin(
        /src\/config\/config\.development/,
        `./config.${environment}.ts`
      ),
    ],
  };
};
