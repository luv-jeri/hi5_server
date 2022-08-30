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

      next();
    } catch (err) {
      console.log(err);
    }
  }
});

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
  socket_user_map[user._id] = socket.id;

  socket.user = user; // #mongodb data

  if (!user) {
    return next(new Error('You are registered.', 401)); //* socket.emit("error" ,  error)
  }

  next();
});

io.on('connection', (socket) => {
  socket.on('disconnect', (reason) => {
    const { user, decoded } = socket;

    socket_user_map.delete(socket.id);

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

    const to_socket = socket_user_map[to];

    if (to_socket) {
      socket.to(to_socket).emit('get-chat', { by: socket.decoded.id, text });
    } else {
      const friend = await User.findById(to);

      const { push_token } = friend;

      const payload = {
        notification: {
          title: 'New Message',
          body: text,
          icon: 'https://i.imgur.com/7k7GQeQ.png',
        },
      };
      admin.messaging().sendToDevice(push_token, payload);
    }

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
