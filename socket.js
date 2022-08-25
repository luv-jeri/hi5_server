const { Server } = require('socket.io');
const User = require('./database/models/user.model');

const intiSocket = (server) => {
  global.socket_user_map = {}; //*  socket ids aur mongo ids map

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
  });
};

// socket.on('send_msg', async (data) => {
//   console.log(data);
//   console.log('socket_user_map', socket_user_map);

//   const to = socket_user_map[data.to]; // # sokcet id from mongo id

//   io.to(to).emit('msg', {
//     msg: data.msg,
//     name: data.name,
//   });
// });
