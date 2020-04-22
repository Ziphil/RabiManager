//

import * as CopyWebpackPlugin from "copy-webpack-plugin";
import * as path from "path";


let main = {
  mode: "development",
  target: "electron-main",
  entry: path.join(__dirname, "source", "index"),
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist")
  },
  node: {
    __dirname: false,
    __filename: false
  },
  module: {
    rules: [
      {
        test: /.tsx?$/,
        include: [path.resolve(__dirname, "source")],
        exclude: [path.resolve(__dirname, "node_modules")],
        loader: "ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
  plugins: [
    new CopyWebpackPlugin(
      [
        {
          context: "source",
          from: "**/*.html",
          to: path.resolve(__dirname, "dist")
        }
      ]
    )
  ]
};

let renderer = {
  mode: "development",
  target: "electron-renderer",
  entry: path.join(__dirname, "source", "renderer", "index"),
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist", "script")
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [path.resolve(__dirname, "source"), path.resolve(__dirname, "node_modules")],
        loader: "ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [".json", ".js", ".jsx", ".css", ".ts", ".tsx"]
  }
};

export default [main, renderer];