const path = require('path');

module.exports = {
  plugins: [
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
          enableImportsFromExternalPaths(webpackConfig, [
            // Add the paths here
            path.resolve(__dirname, 'styled-system'),
          ]);
          return webpackConfig;
        },
      },
    },
  ],
  webpack: {
    alias: {
      'styled-system': path.resolve(__dirname, 'styled-system'),
      '~/lib': path.resolve(__dirname, './src/lib'),
      '~/types': path.resolve(__dirname, './src/types'),
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

/**
 *
 * Functions to enable imports from outside of the src folder
 *
 */
const findWebpackPlugin = (webpackConfig, pluginName) =>
  webpackConfig.resolve.plugins.find(
    ({constructor}) => constructor && constructor.name === pluginName,
 );

/**
 *
 * Enable imports of .tsx files from outside the src folder
 *
 */
const enableTypescriptImportsFromExternalPaths = (webpackConfig, newIncludePaths) => {
  const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf);
  if (oneOfRule) {
    const tsxRule = oneOfRule.oneOf.find(rule => rule.test && rule.test.toString().includes('tsx'));

    if (tsxRule) {
      tsxRule.include = Array.isArray(tsxRule.include)
        ? [...tsxRule.include, ...newIncludePaths]
        : [tsxRule.include, ...newIncludePaths];
    }
  }
};

/*
 *
 * Add path to ModuleScopePlugin
 *
 */
const addPathsToModuleScopePlugin = (webpackConfig, paths) => {
  const moduleScopePlugin = findWebpackPlugin(webpackConfig, 'ModuleScopePlugin');
  if (!moduleScopePlugin) {
    throw new Error(`Expected to find plugin "ModuleScopePlugin", but didn't.`);
  }
  moduleScopePlugin.appSrcs = [...moduleScopePlugin.appSrcs, ...paths];
};

const enableImportsFromExternalPaths = (webpackConfig, paths) => {
  enableTypescriptImportsFromExternalPaths(webpackConfig, paths);
  addPathsToModuleScopePlugin(webpackConfig, paths);
};