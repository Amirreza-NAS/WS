const http = require('http');
const httpProxy = require('http-proxy');

const LOCAL_PORT = 8080; // Local port to listen on
const DESTINATION_URL = 'https://home-and-kitchen.bluemoonsell.com'; // Your target

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({
  target: DESTINATION_URL,
  changeOrigin: true, // Updates Host header to match target
  preserveHeaderKeyCase: true, // Keeps header casing as-is
});

// Optional: handle proxy errors gracefully
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
  }
  res.end('Bad Gateway');
});

// Create HTTP server that uses the proxy
http.createServer((req, res) => {
  proxy.web(req, res);
}).listen(LOCAL_PORT, () => {
  console.log(`Server running on http://0.0.0.0:${LOCAL_PORT}`);
});
