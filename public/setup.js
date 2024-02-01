const ws = new WebSocket('ws://localhost:3001'); // match port above
console.log('setup.js: ws =', ws);
ws.addEventListener('close', event => {
  console.log('setup.js: event =', event);
  // This assumes the server will restart and create a new WebSocket server.
  setTimeout(() => {
    console.log('setup.js: reloading');
    window.location.reload();
  }, 500); // gives the server time to restart
});
