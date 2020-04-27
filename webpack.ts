//

import * as electronReload from "electron-reload-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as path from "path";


let electronReloadPlugin = electronReload({
  path: path.join(__dirname, "dist", "index.js"),
  stopOnClose: true,
  logLevel: 0
})();

let main = {
  mode: "development",
  target: "electron-main",
  entry: ["./main/index.ts"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js"
  },
  node: {
    __dirname: false,
    __filename: false
  },
  module: {
    rules: [
      {
        test: /.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  plugins: [
    electronReloadPlugin
  ]
};

let renderer = {
  mode: "development",
  target: "electron-renderer",
  entry: ["./renderer/index.tsx"],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "./script/index.bundle.js"
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {url: false}
          },
          {
            loader: "sass-loader"
          }
        ]
      },
      {
        test: /\.css/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {url: false}
          }
        ]
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: {
          loader: "source-map-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".scss"]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./renderer/public/index.html",
      title: "Rajka"
    }),
    electronReloadPlugin
  ]
};


export default [main, renderer];