const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: "./dist",
    hot: true,
    port: 3000,
    historyApiFallback: true,
    /*
    proxy: {
        "/figgie-ws": {
            target: "ws://localhost:8080",
            ws: true,
            changeOrigin: true,
            secure: false,
            logLevel: "debug"
        }
    }
    */
},
});
