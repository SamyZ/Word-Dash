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

const err = msg => console.error(msg);
const warn = msg => console.warn(msg);
const log = msg => console.log(msg);
const info = msg => console.info(msg);

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

// persistence? https://www.npmjs.com/package/node-persist

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
  info(`sendToGame: ${event} ${JSON.stringify(data)}`);
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

    if (Date.now() - game.createdAt > GAME_DURATION) {
      info(`ending game ${i}`);
      endGame(game);
    }
  }
};

setInterval(endGames, 100);

// The event will be called when a client is connected.
io.on('connection', socket => {
  let user = null;

  // This is needed for auth.
  socket.on('message', ({ userId }) => {
    if (user) {
      warn(`Connection while user exists ${userId}`);
    }
    if (!userId) {
      err(`Empty user id`);
      return;
    }
    info(`${users[userId] ? 'Existing' : 'New'} user connected ${userId}`);

    user = updateOrCreateUser(userId, socket.id);

    if (!isNil(user.gameId)) {
      const game = games[user.gameId];
      socket.emit('game:started', {
        endTime: game.createdAt + GAME_DURATION,
        letters: game.letters,
        scores: game.scores,
        startTime: game.createdAt,
      });
    }
  });

  socket.on('game:ready', () => {
    if (!user) {
      warn('game:ready without a user');
      return;
    }
    if (!isNil(user.gameId)) {
      warn(`game:ready and user ${user.id} has no game`);
      return;
    }
    info(`game:ready by ${user.id}, available players: ${availablePlayers.length}`);

    const playerId = user.id;

    // not enough players :(
    if (!availablePlayers.length) {
      return availablePlayers.push(playerId);
    }

    // we have 2 players, let the game begin...
    const opponentId = availablePlayers.shift();

    const game = createGame(playerId, opponentId);
    const gameId = games.push(game) - 1;
    users[playerId].gameId = gameId;
    users[opponentId].gameId = gameId;

    sendToGame(game, 'game:started', {
      endTime: game.createdAt + GAME_DURATION,
      letters: game.letters,
      players: game.players,
      scores: game.scores,
      startTime: game.createdAt,
    });
  });

  socket.on('game:word', (word, fn) => {
    if (!user) {
      warn('game:word without user');
      return;
    }
    if (isNil(user.gameId)) {
      warn(`game:word without game from ${user.id}`);
      return;
    }
    const playerId = user.id;
    info(`game:word ${word} from ${playerId}`);

    const game = games[user.gameId];

    if (game.words.indexOf(word) > -1) {
      fn('TAKEN');
    } else if (!isValidWord(word)) {
      fn('INVALID');
    } else {
      game.words.push(word);
      game.scores[user.id] += word.length;
      fn('OK');
      sendToGame(game, 'game:score', game.scores);
    }
  });

  socket.on('disconnect', () => {
    info(`disconnected ${user.id}`);
    user = null;
  });
});

server.listen(3000, () => info('listening on *:3000'));
