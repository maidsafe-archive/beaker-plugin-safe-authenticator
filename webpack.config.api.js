import path from 'path';
import os from 'os';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const SAFE_CORE = {
  win32: '*.dll',
  darwin: '*.dylib',
  linux: '*.so'
};

export default {
  devtool: 'cheap-module-source-map',
  entry: path.resolve(__dirname, 'src/api/index.js'),
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, 'dist'),
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
  target: 'node',
  node: {
    fs: 'empty',
    __dirname: false,
    __filename: false,
  },
  externals: {
    ffi: 'ffi',
    ref: 'ref'
  },
  plugins: [
    new CopyWebpackPlugin([
      { context: 'src/ffi', from: SAFE_CORE[os.platform()], flatten: true }
    ])
  ]
};
