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
        use: [
          {
            loader: "ts-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};

let renderer = {
  mode: "development",
  target: "electron-renderer",
  entry: path.join(__dirname, "source", "renderer", "index"),
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist", "script")
  },
  node: {
    __dirname: false,
    __filename: false
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [path.resolve(__dirname, "source"), path.resolve(__dirname, "node_modules")],
        use: [
          {
            loader: "ts-loader"
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => {
                return [require("precss"), require("autoprefixer")];
              }
            }
          },
          {
            loader: "sass-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".scss", ".css"]
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

export default [main, renderer];