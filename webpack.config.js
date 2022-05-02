const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = async () => {
  return {
    mode: "development",
    entry: "./src/main.ts",
    output: {
      path: `${__dirname}/dist`,
      filename: "main.js"
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.glb/,
          use: "file-loader",
        },
      ],
    },
    resolve: {
      extensions: [
        ".ts", ".js",
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "src/index.html"),
        filename: "index.html",
      })
    ],
    devServer: {
      compress: false,
      port: 3000,
    },
  }
}