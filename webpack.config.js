const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    mode: isDevelopment ? 'development' : 'production',
    entry: './src/main.ts',
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              allowTsInNodeModules: false,
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@js': path.resolve(__dirname, 'js'),
      }
    },

    output: {
      filename: 'bundle.[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },

    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './index.html',
        inject: 'body',
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'css', to: 'css' },
          { from: 'sprites', to: 'sprites' },
          { from: 'backgrounds', to: 'backgrounds' },
          {
            from: 'js',
            to: 'js',
            globOptions: {
              ignore: ['**/*.backup.js']
            }
          },
        ],
      }),
    ],

    devServer: {
      static: [
        {
          directory: path.join(__dirname, 'dist'),
        },
        {
          directory: path.join(__dirname, 'js'),
          publicPath: '/js',
        }
      ],
      compress: true,
      port: 8080,
      hot: true,
      open: true,
      historyApiFallback: true,
      proxy: [
        {
          context: ['/socket.io', '/api'],
          target: 'http://localhost:3000',
          ws: true,
          changeOrigin: true,
        }
      ],
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },

    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
  };
};
