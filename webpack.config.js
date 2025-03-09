const path = require('path');

module.exports = {
  resolve: {
    alias: {
      // Use the build version of solanaApi during build time
      './services/solanaApi': path.resolve(__dirname, 'src/services/solanaApi.build.js')
    }
  }
};
