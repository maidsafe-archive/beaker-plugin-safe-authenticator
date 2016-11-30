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
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/app/app.html', to: './' }
    ])
  ]
};
