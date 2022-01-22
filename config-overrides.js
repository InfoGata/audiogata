const { fixBabelImports, override } = require("customize-cra");
const rewireReactHotLoader = require("react-app-rewire-hot-loader");

module.exports = override(
  (config, env) => {
    if (env === "development") {
      config.resolve.alias["react-dom"] = "@hot-loader/react-dom";
    }
    config = rewireReactHotLoader(config, env);
    return config;
  },
  fixBabelImports("@mui/material", {
    libraryDirectory: "",
    camel2DashComponentName: false,
  }),
  fixBabelImports("@mui/icons-material", {
    libraryDirectory: "",
    camel2DashComponentName: false,
  })
);
