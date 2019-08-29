let io = null;
const SocketEvents = require('../config/socket-event');

var numUsers = 0;

const onConnectFn = (socket) => {
  let addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
};

const init = (ioInput) => {
  if (ioInput) {
    io = ioInput;
    io.set('origins', '*:*');
    io.on('connection', onConnectFn);
  }
};

const pushToUser = (userId, content) => {
  if (!io) {
    return;
  }

  io.in(userId).emit(SocketEvents.NOTIFY, JSON.stringify(content));
};

const broadcast = (type, content) => {
  if (!io) {
    return;
  }

  type = type.toString().toUpperCase();
  io.emit(type, JSON.stringify(content));
};

module.exports = {
  init,
  broadcast,
  pushToUser
};
