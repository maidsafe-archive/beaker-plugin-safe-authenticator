import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';

export default {
  devtool: 'cheap-module-source-map',
  entry: path.resolve(__dirname, 'src/app/index.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader?sourceMap', 'resolve-url', 'sass-loader?sourceMap']
      },
      { test: /\.(png|woff|woff2|eot|ttf|svg|gif)$/, loader: 'url-loader?limit=500000' },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/app/app.html', to: './' },
      { from: 'src/app/favicon.png', to: './' }
    ])
  ]
};
