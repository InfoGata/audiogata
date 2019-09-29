const { fixBabelImports, override } = require('customize-cra')
const rewireReactHotLoader = require('react-app-rewire-hot-loader');

module.exports = override(
  (config, env) => {
    if (env === "development") {
      config.resolve.alias["react-dom"] = "@hot-loader/react-dom";
    }
    config = rewireReactHotLoader(config, env)
    return config;
  },
  fixBabelImports('@material-ui/core', {
    'libraryDirectory': 'esm',
    'camel2DashComponentName': false
  }),
  fixBabelImports('@material-ui/icons', {
    'libraryDirectory': 'esm',
    'camel2DashComponentName': false
  }),
)
