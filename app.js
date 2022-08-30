const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const User = require('./database/models/user.model');
const Message = require('./database/models/message.model');
const { createServer } = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');

const upload = require('express-fileupload');

const app = express();
const server = createServer(app);
const { promisify } = require('util');
const jwt = require('jsonwebtoken');



if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  cors({
    origin: [
      'https://localhost:3000/',
      'http://localhost:3000/',
      'https://localhost:3000',
      'http://localhost:3000',
    ],
    credentials: true,
  })
);

app.use(upload());
app.use(express.json());
app.use(cookieParser());

app.use()

app.use(express.static('public'));

app.use('/api/v1/', require('./routes/index.routes'));

app.use('/api/v1/upload', (req, res) => {
  const { file } = req.files;

  const { name } = file;

  const fileName = `${Date.now()}_${name}`;

  file.mv(`${__dirname}/public/upload/${fileName}`, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    res.send({
      status: 'success',
      message: `${fileName} uploaded successfully`,
      data: fileName,
    });
  });
});

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

const io = new Server(server, {
  cors: {
    origin: [
      'https://localhost:3000/',
      'http://localhost:3000/',
      'https://localhost:3000',
      'http://localhost:3000',
    ],
  },
});

io.use(async (socket, next) => {
  const { token } = socket.handshake.auth || '';
  if (token) {
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      if (!decoded) {
        return next(new Error('You are logged out.', 401));
      }

      socket.decoded = decoded;
      socket_user_map[decoded.id] = socket.id;

      next();
    } catch (err) {
      console.log(err);
    }
  }
});
const socket_user_map = {};

io.use(async (socket, next) => {
  const { decoded } = socket;

  const user = await User.findByIdAndUpdate(
    decoded.id,
    {
      online: true,
      socket_id: socket.id,
    },
    {
      new: true,
    }
  );

  //~ MAP socket id and user id
  // socket_user_map[socket.id] = user._id;

  socket.user = user; // #mongodb data

  if (!user) {
    return next(new Error('You are registered.', 401)); //* socket.emit("error" ,  error)
  }

  next();
});

io.on('connection', (socket) => {
  socket.on('disconnect', (reason) => {
    const { user, decoded } = socket;

    // socket_user_map.delete(socket.id);

    User.findByIdAndUpdate(user._id, {
      online: false,
      lastSeen: Date.now(),
    }).then(() => {
      console.log(`${user.name} is offline`);
    });
  });

  //# all the socket code for chatting
  console.log(
    'NEW USER',
    'socket id : ',
    socket.user.socket_id,
    'User id : ',
    socket.user._id
  );

  socket.on('set-chat', async (data, cb) => {
    const { to, text } = data;

    console.log('to', to);
    console.log('text', text);
    console.log('me', socket.decoded.id);
    const to_socket = socket_user_map[to];
    console.log('to_socket', to_socket);
    console.log('my_socket', socket.id);

    if (to_socket) {
      socket.to(to_socket).emit('get-chat', { from: socket.decoded.id, text });
    }

    const friend = await User.findById(to);

    const { push_token } = friend;

    const payload = {
      notification: {
        title: 'New Message',
        body: text,
        icon: 'https://i.imgur.com/7k7GQeQ.png',
      },
    };

    // admin
    //   .messaging()
    //   .sendToDevice([push_token], payload)
    //   .then(() => {
    //     console.log('notificaotin send');
    //   })
    //   .catch((e) => {
    //     console.log(e);
    //   });

    Message.create({
      from: socket.decoded.id,
      to: to,
      text,
      time: Date.now(),
      type: 'text',
    });

    cb(null, 'Message sent');
  });

  socket.on('get-msgs', async (data, cb) => {
    const { friend, limit } = data;

    const messages = await Message.find({
      $or: [
        { to: friend, by: socket.decoded.id },
        { to: socket.decoded.id, by: friend },
      ],
    }).limit(limit);

    if (!messages) {
      socket.emit('e', new Error('something went wrong'));
    }

    cb(null, messages);
  });
});

module.exports = server;
