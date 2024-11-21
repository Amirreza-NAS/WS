const WebSocket = require('ws');

// Define the server port and destination WebSocket URL
const WS_PORT = 8080;
const DESTINATION_WS_URL = 'ws://46.101.144.136:8008';

// Create a WebSocket server that listens on 0.0.0.0
const wss = new WebSocket.Server({  port: WS_PORT }, () => {
  //console.log(`WebSocket server is listening on ws://0.0.0.0:${WS_PORT}`);
});

// Handle WebSocket connections
wss.on('connection', (clientWs, req) => {
  //console.log('WebSocket connection established with a client.');

  // Extract fake path and host from the client's request headers or URL
  const fakePath = req.url || '/fakepath';
  const fakeHost = req.headers['host'] || 'fakehost.com';

  //console.log(`Fake Path: ${fakePath}, Fake Host: ${fakeHost}`);

  // Customize headers for the destination connection
  const options = {
    headers: {
      Host: fakeHost,
      // No need to include Path in the headers; the path is part of the URL
    }
  };

  // Establish a WebSocket connection to the destination server with custom headers
  const destinationWs = new WebSocket(DESTINATION_WS_URL + fakePath, options);

  // Event handler when destination WebSocket connection is open
  destinationWs.on('open', () => {
    //console.log('Connected to the destination WebSocket server.');
  });

  // Forward messages from the client to the destination server
  clientWs.on('message', (message) => {
    //console.log(`Client WS => Destination WS: ${message}`);
    if (destinationWs.readyState === WebSocket.OPEN) {
      destinationWs.send(message);
    }
  });

  // Forward messages from the destination server back to the client
  destinationWs.on('message', (data) => {
    //console.log(`Destination WS => Client WS: ${data}`);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data);
    }
  });

  // Handle unexpected server responses during handshake
  destinationWs.on('unexpected-response', (req, res) => {
    //console.error(`Unexpected server response: ${res.statusCode}`);
    if (res.statusCode === 404) {
      //console.error('The server did not recognize the requested path.');
    }
    clientWs.close();
  });

  // Handle client WebSocket close event
  clientWs.on('close', () => {
    //console.log('Client WebSocket connection closed.');
    if (destinationWs.readyState === WebSocket.OPEN) {
      destinationWs.close();
    }
  });

  // Handle destination WebSocket close event
  destinationWs.on('close', () => {
    //console.log('Destination WebSocket connection closed.');
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close();
    }
  });

  // Handle client WebSocket errors
  clientWs.on('error', (err) => {
    //console.error('Client WebSocket error:', err.message);
    if (destinationWs.readyState === WebSocket.OPEN) {
      destinationWs.close();
    }
  });

  // Handle destination WebSocket errors
  destinationWs.on('error', (err) => {
    //console.error('Destination WebSocket error:', err.message);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close();
    }
  });
});
