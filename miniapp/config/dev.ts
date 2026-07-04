export default {
  env: {
    NODE_ENV: '"development"',
  },
  defineConstants: {},
  mini: {},
  h5: {
    publicPath: "/",
    devServer: {
      port: 10086,
      host: "0.0.0.0",
      historyApiFallback: true,
    },
  },
};
