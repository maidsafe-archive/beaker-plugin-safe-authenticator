import path from 'path';

export default {
  devtool: 'cheap-module-source-map',
  entry: path.resolve(__dirname, '../src/beaker/api/index.js'),
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, './/dist'),
    filename: 'api.js'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  node: {
    fs: 'empty'
  }
};
