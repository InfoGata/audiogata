const { fixBabelImports, override } = require("customize-cra");

module.exports = override(
  fixBabelImports("@mui/material", {
    libraryDirectory: "",
    camel2DashComponentName: false,
  }),
  fixBabelImports("@mui/icons-material", {
    libraryDirectory: "",
    camel2DashComponentName: false,
  }),
  (config) => {
    return {
      ...config,
      ignoreWarnings: [
        {
          module: /node_modules\/@datapunt\/matomo-tracker-react/,
        },
        {
          module: /node_modules\/@datapunt\/matomo-tracker-js/,
        },
      ],
    };
  }
);
