const VueLoaderPlugin = require("vue-loader/lib/plugin");
const webpack = require('webpack')
const path = require('path')

module.exports = (env, argv) => ({
  entry: {
    main:[
      "./src/client/bootstrap.js",
      (argv.mode !== 'production' ? "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000" : false)
    ].filter(Boolean)
  },
  mode: 'development',
  output: {
    path: path.resolve(__dirname, "dist", "public"),
    filename: "[name].js",
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.vue$/, loaders: "vue-loader"
      },
      { test: /\.js$/, loaders: "babel-loader" },
      { test: /\.css$/, loaders: ["style-loader", "css-loader"] },
      { test: /\.scss$/, loaders: ["style-loader", "css-loader", "sass-loader"]}
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    (argv.mode !== 'production' ? new webpack.HotModuleReplacementPlugin() : false)
  ].filter(Boolean)
})