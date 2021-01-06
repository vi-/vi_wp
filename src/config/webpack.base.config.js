const path = require('path');
const webpack = require('webpack');
// const autoprefixer = require("autoprefixer");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    app: './src/js/app.js'
  },
  output: {
    filename: '../../js/[name].min.js',
    path: path.resolve(__dirname)
  },
  devtool: 'source-map',

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
      }
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '../../css/[name].min.css'
    })
  ]
}