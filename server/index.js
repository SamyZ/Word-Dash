const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const uuid = require('uuid/v4');
//https://github.com/S0c5/node-check-word
const words = require('check-word')('en');
const { find, isNil, whereEq } = require('ramda');

const app = express();
const server = http.Server(app);
const io = socketio(server);

app.use(express.static(__dirname + '/public'));

// persistence? https://www.npmjs.com/package/node-persist

const GAME_DURATION = 2 * 60 * 1000; // 2 minutes

const isValidWord = word => words.check(word);
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const randomLetter = () => LETTERS[Math.floor(Math.random() * LETTERS.length)];

const addWord = (word, uid) => {};

const createGame = (uid1, uid2) => {
  const letters = [];
  for (let i = 0; i < 36; i++) {
    letters.push(randomLetter());
  }

  return {
    createdAt: Date.now(),
    ended: false,
    players: [uid1, uid2],
    letters,
    scores: { [uid1]: 0, [uid2]: 0 },
    words: [],
  };
};

const availablePlayers = [];

const users = {};
const games = [];

const updateOrCreateUser = (userId, socketId) => {
  if (!users[userId]) {
    users[userId] = { id: userId, gameId: null };
  }
  users[userId].socketId = socketId;
  return users[userId];
};

const sendToGame = (game, event, data) => {
  console.log('sendToGame', event, data);
  io.to(users[game.players[0]].socketId).to(users[game.players[1]].socketId).emit(event, data);
};

const endGame = game => {
  game.ended = true;

  sendToGame(game, 'game:over', game.scores);

  game.players.forEach(pid => {
    users[pid].gameId = null;
  });
};

const endGames = () => {
  for (let i = games.length - 1, game = null; i > -1; i--) {
    game = games[i];
    // if this is finished, all previous ones (started earlier) are finished.
    if (game.ended) {
      return;
    }

    if (Date.now() - game.createAt > GAME_DURATION) {
      console.log('ending game', idx);
      endGame(game);
    }
  }
};

setInterval(endGames, 100);

// The event will be called when a client is connected.
io.on('connection', socket => {
  let user = null;

  // This is needed for auth.
  socket.on('message', userId => {
    if (user) {
      console.log('WEIRD: another login from: ' + userId);
    }
    if (users[userId]) {
      console.log('Existing user connected: ', userId);
    } else {
      console.log('New user connected: ', userId);
    }

    user = updateOrCreateUser(userId, socket.id);

    if (!isNil(user.gameId)) {
      const game = games[user.gameId];
      socket.emit('game:started', {
        letters: game.letters,
        scores: game.scores,
        startTime: game.createdAt,
        endTime: game.createdAt + GAME_DURATION,
      });
    }
  });

  socket.on('game:ready', () => {
    console.log('game:ready', user, availablePlayers.length);
    if (!user) {
      return;
    }
    if (!isNil(user.gameId)) {
      return;
    }

    // not enough players :(
    if (!availablePlayers.length) {
      return availablePlayers.push(user.id);
    }

    // we have 2 players, let the game begin...
    const opponent = availablePlayers.shift();

    const game = createGame(user.id, opponent);
    const gameId = games.push(game);
    users[user.id].gameId = gameId;
    users[opponent].gameId = gameId;

    sendToGame(game, 'game:started', {
      letters: game.letters,
      scores: game.scores,
      startTime: game.createdAt,
      endTime: game.createdAt + GAME_DURATION,
    });
  });

  socket.on('game:word', (word, fn) => {
    console.log('game:word', word);
    if (!user) {
      return;
    }
    if (isNil(user.gameId)) {
      return;
    }

    console.log(user);
    const game = games[user.gameId];

    if (game.words.indexOf(word) > -1) {
      console.log('taken');
      fn('TAKEN');
    } else if (!isValidWord(word)) {
      console.log('invalid');
      fn('INVALID');
    } else {
      console.log('ok');
      game.words.push(word);
      game.scores[user.id] += word.length;
      fn('OK');
      sendToGame(game, 'game:score', game.scores);
    }
  });

  socket.on('disconnect', () => {
    console.log('disconnected :(');
    user = null;
  });
});

server.listen(3000, () => console.log('listening on *:3000'));
