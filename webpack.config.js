const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    content: "./src/content.js",
    injectedScript: "./src/injectedScript.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  devtool: "source-map",
};
