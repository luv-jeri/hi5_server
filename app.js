const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const User = require('./database/models/user.model');
const { createServer } = require('http');
const { Server } = require('socket.io');

const upload = require('express-fileupload');

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
    origin: [
      'https://localhost:3000/',
      'http://localhost:3000/',
      'https://localhost:3000',
      'http://localhost:3000',
    ],
  },
});

// # Authenticate Middleware for socket
io.use(async (socket, next) => {
  const { token } = socket.handshake.auth || '';

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error('You are logged out.', 401));
    }

    socket.decoded = decoded;

    next();
  } catch (err) {
    console.log(err);
  }
});

// //# last seen and socket io set
io.use(async (socket, next) => {
  const { decoded } = socket;

  const user = await User.findByIdAndUpdate(
    decoded.id,
    {
      online: true,
    },
    {
      new: true,
    }
  );

  //~ MAP socket id and user id
  socket_user_map[socket.id] = user._id;

  socket.user = user; // #mongodb data

  if (!user) {
    return next(new Error('You are registered.', 401)); //* socket.emit("error" ,  error)
  }

  next();
});

io.on('connection', (socket) => {
  socket.on('disconnect', (reason) => {
    const { user, decoded } = socket;

    User.findByIdAndUpdate(user._id, {
      online: false,
      lastSeen: Date.now(),
    }).then(() => {
      console.log(`${user.name} is offline`);
    });
  });

  console.log('a user connected', socket.id);

  const fs = require('fs');

  socket.on('file', (data, cb) => {
    console.log('File', data);

    fs.appendFileSync(data.fileName, data.chunk);

    cb();
  });

  socket.on('send_msg', async (data) => {
    console.log(data);
    console.log('socket_user_map', socket_user_map);

    // const to_ = await User.findById(data.to);
    // console.log(to_.socket_id);

    const to = socket_user_map[data.to]; // # sokcet id from mongo id

    io.to(to).emit('msg', {
      msg: data.msg,
      name: data.name,
    });
  });
});

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

module.exports = server;
