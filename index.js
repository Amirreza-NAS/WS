const http = require('http');
const https = require('https');
const { URL } = require('url');

const LOCAL_PORT = 8080; // Local port to listen on
const DESTINATION_URL = 'https://home-and-kitchen.bluemoonsell.com'; // Your Xray-core HTTP destination

// Create an HTTP server
const server = http.createServer((clientReq, clientRes) => {
  const targetUrl = new URL(DESTINATION_URL);

  // Preserve the client path
  const options = {
    protocol: targetUrl.protocol,
    hostname: targetUrl.hostname,
    port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
    method: clientReq.method,
    path: clientReq.url, // forward client's path
    headers: {
      ...clientReq.headers,
      host: targetUrl.hostname // Override Host header if needed
    }
  };

  // Use http or https based on destination
  const proxyReq = (targetUrl.protocol === 'https:' ? https : http).request(options, (proxyRes) => {
    // Forward response status and headers
    clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
    // Pipe data
    proxyRes.pipe(clientRes, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy request error:', err);
    clientRes.writeHead(502);
    clientRes.end('Bad Gateway');
  });

  // Pipe client request body to proxy
  clientReq.pipe(proxyReq, { end: true });
});

// Start the HTTP proxy server
server.listen(LOCAL_PORT, () => {
  console.log(`HTTP proxy server listening on http://0.0.0.0:${LOCAL_PORT}`);
});
