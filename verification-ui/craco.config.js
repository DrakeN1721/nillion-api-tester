const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        util: require.resolve('util'),
        assert: require.resolve('assert'),
        url: require.resolve('url'),
        os: require.resolve('os-browserify/browser'),
        https: require.resolve('https-browserify'),
        http: require.resolve('stream-http'),
        path: require.resolve('path-browserify'),
        'process/browser': require.resolve('process/browser'),
        fs: false,
        net: false,
        tls: false
      };

      // Fix ESM module resolution issues
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': require.resolve('process/browser.js')
      };

      // Provide global polyfills
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser.js'
        })
      );

      // Define process.env for browser
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env),
          'process.browser': true,
          'process.version': JSON.stringify(process.version)
        })
      );

      return webpackConfig;
    }
  }
};