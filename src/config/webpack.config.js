const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

const dest = {
  img: '../../assets/images',
  fonts: '../../assets/fonts',
  js: '../../assets/js',
  css: '../../assets/css',
  php: '../..',
}

module.exports = env => {

  const mode = process.env.NODE_ENV

  return {
    entry: {
      app: './src/js/app.js',
      editor: './src/js/editor.js',
    },
    output: {
      filename: `${dest.js}/[name].min.js`,
      path: path.resolve(__dirname)
    },

    devtool: 'source-map',

    mode,

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader',
          ]
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          loader: 'file-loader',
          options: {
            context: './src/images',
            name: `${dest.img}/[path][name].[ext]`,
          }
        },
        {
          test: /\.(woff2?)$/i,
          loader: 'file-loader',
          options: {
            context: './src/fonts',
            name: `${dest.fonts}/[path][name].[ext]`,
          }
        },
      ]
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: `${dest.css}/[name].min.css`
      }),
      new BrowserSyncPlugin({
        host: 'localhost',
        port: 3000,
        proxy: 'http://wpstarter.test',
        injectCss: true,
        files: [ '**/*.php' ],
      }),
      new ImageMinimizerPlugin({
        minimizerOptions: {
          plugins: [
            ['gifsicle', { interlaced: true }],
            ['mozjpeg', { progressive: true, quality: 85 }],
            ['optipng', { optimizationLevel: 5 }],
            [
              'svgo',
              {
                plugins: [{ removeViewBox: false }],
              },
            ],
          ],
        },
      }),
    ],
  }
}