const path = require('path');

module.exports = {
  webpack: {
    alias: {
      'styled-system': path.resolve(__dirname, 'styled-system'),
    },
    configure: (webpackConfig) => {
      console.log("configuring webpack");
      webpackConfig.resolve.modules = [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'styled-system'), // Add your custom directory here
        'node_modules',
      ];
      return webpackConfig;
    },
  }
};
