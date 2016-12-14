import path from 'path';

export default {
  devtool: 'cheap-module-source-map',
  entry: path.resolve(__dirname, '../src/beaker/protocols/safe_auth.js'),
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'protocol.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: {
    fs: 'fs',
    electron: 'electron',
    'pauls-electron-rpc': 'pauls-electron-rpc'
  }
};
