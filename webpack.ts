//

import * as electronReload from "electron-reload-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as path from "path";


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
  }
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
  devServer: {
    port: 3000,
    historyApiFallback: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./renderer/public/index.html",
      title: "Rajka"
    }),
    electronReload({
      path: path.join(__dirname, "dist", "index.js"),
      logLevel: 0
    })()
  ]
};


export default [main, renderer];