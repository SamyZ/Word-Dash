const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const uuid = require('uuid/v4');
const { find } = require('ramda');

const app = express();
const server = http.Server(app);
const io = socketio(server);

app.use(express.static(__dirname + '/public'));

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const randomLetter = () => LETTERS[Math.floor(Math.random() * LETTERS.length)];

const createGame = (uid1, uid2) => {
  const letters = [];
  for (let i = 0; i < 36; i++) {
    letters.push(randomLetter());
  }

  return {
    id: uuid(),
    letters,
    scores: { [uid1]: 0, [uid2]: 0 },
  };
};

const availablePlayers = [];

const users = [];
const games = [];

const findOrCreateUser = userId => {
  let user = find(whereEq({ id: userId }), users);
  if (!user) {
    users.push({
      id: userId,
      currentGame: null,
    });
  }
  return user;
};

const findGame = id => {
  return find(whereEq({ id }), games);
};

// The event will be called when a client is connected.
io.on('connection', socket => {
  console.log('A client just joined on', socket.id);

  let user = null;
  let game = null;

  socket.on('message', ({ userId }) => {
    console.log('message', data);

    user = findOrCreateUser(userId);
    if (user.currentGame) {
      socket.emit('game:started', findGame(user.currentGame));
    }
  });

  socket.on('game:start', data => {
    console.log('gameStart', data);
    if (availablePlayers.length > 0) {
      game = createGame(user.id, availablePlayers.pop());
      socket.emit('game:started', game);
    } else {
      availablePlayers.push(user.id);
    }
  });

  socket.on('game:end', data => {
    console.log('game:end', data);
  });

  socket.on('game:word', data => {
    socket.broad;
  });

  socket.on('disconnect', () => {
    console.log('disconnected :(');
  });
});

server.listen(3000, () => console.log('listening on *:3000'));
