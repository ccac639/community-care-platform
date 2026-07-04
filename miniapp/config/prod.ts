export default {
  env: {
    NODE_ENV: '"production"',
  },
  defineConstants: {},
  mini: {},
  h5: {
    publicPath: "/community-care-platform/",
    output: {
      filename: "js/[name].[hash:8].js",
      chunkFilename: "js/[name].[chunkhash:8].js",
    },
    miniCssExtractPluginOption: {
      ignoreOrder: true,
      filename: "css/[name].[hash].css",
      chunkFilename: "css/[name].[chunkhash].css",
    },
  },
};
