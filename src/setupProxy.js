const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api': '/api' },
      onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests for debugging
        console.log('Proxying:', req.method, req.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Proxy error: ' + err.message);
      }
    })
  );
};
