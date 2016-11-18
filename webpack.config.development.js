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
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/app/app.html', to: './' }
    ])
  ]
};
