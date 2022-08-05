// const { Server } = require('socket.io');
// const server = require('./app');
// const jwt = require('jsonwebtoken');
// const { promisify } = require('util');
// const User = require('./database/models/user.model');

// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000/',
//   },
// });

io.use(async (next) => {
  console.log('Authenticating...');


  const { authentication } = socket.handshake

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  if (!decoded) {
    return next(new Error('You are logged out.', 401));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new Error('You are registered.', 401));
  }

  socket.user = user;

  next();
});

// io.on('connection', (socket) => {
//   console.log('a user connected', socket.id);

//   socket.on('disconnect', (socket) => {
//     console.log('user disconnected', socket.id);
//   });
// });

// module.exports = io;
