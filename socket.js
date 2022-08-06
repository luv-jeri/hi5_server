const { Server } = require('socket.io');

class Socket {
  constructor() {
    this.io = new Server();
  }
}

module.exports = Socket;
