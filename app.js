const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const User = require('./database/models/user.model');
const { createServer } = require('http');
const { Server } = require('socket.io');
const app = express();
const server = createServer(app);
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const socket_user_map = {}; //*  socket ids aur mongo ids map

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

io.use(async (socket, next) => {
  const { token } = socket.handshake.auth || '';

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error('You are logged out.', 401));
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error('You are registered.', 401)); //* socket.emit("error" ,  error)
    }

    console.log(socket.id);

    socket_user_map[user._id] = socket.id; // # socket id aur mongo id map

    socket.user = user;

    next();
  } catch (err) {
    // console.log(err);
  }
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('send_msg', (data) => {
    console.log(data);
    console.log('socket_user_map', socket_user_map);
    const to = socket_user_map[data.to]; // # sokcet id from mongo id

    io.to(to).emit('msg', {
      msg: data.msg,
      name: data.name,
    });
  });

  socket.on('disconnect', (socket) => {
    console.log('user disconnected', socket.id);
  });
});

app.use(
  cors({
    origin: process.env.origin,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/', require('./routes/index.routes'));

// # Global Error Handling Middleware
app.use((err, req, res, next) => {
  const errStatus = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  const status = err.status || 'error';
  res.status(errStatus).json({ message, status });
});

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Not found',
  });
});

module.exports = server;
