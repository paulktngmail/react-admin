const path = require('path');
const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add fallbacks for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
    zlib: require.resolve('browserify-zlib'),
    path: require.resolve('path-browserify'),
    fs: false,
    buffer: require.resolve('buffer'),
  };
  
  // Add buffer plugin
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ];
  
  // Only use the mock implementation during production build
  if (env === 'production') {
    console.log('Using mock Solana API for production build');
    
    // Add an alias to use the build version of solanaApi during build time
    config.resolve.alias = {
      ...config.resolve.alias,
      './services/solanaApi': path.resolve(__dirname, 'src/services/solanaApi.build.js')
    };
  }
  
  return config;
};
