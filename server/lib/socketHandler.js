"use strict";

exports.__esModule = true;
exports.default = _default;

var _socket = _interopRequireDefault(require("socket.io"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getCompareResult(fromCard, toCard) {
  if (fromCard === 'stone') {
    if (toCard === 'stone') {
      return 0;
    }

    if (toCard === 'scissors') {
      return 1;
    }

    if (toCard === 'paper') {
      return -1;
    }
  }

  if (fromCard === 'scissors') {
    if (toCard === 'stone') {
      return -1;
    }

    if (toCard === 'scissors') {
      return 0;
    }

    if (toCard === 'paper') {
      return 1;
    }
  }

  if (fromCard === 'paper') {
    if (toCard === 'stone') {
      return 1;
    }

    if (toCard === 'scissors') {
      return -1;
    }

    if (toCard === 'paper') {
      return 0;
    }
  }

  return 0;
}

function _default(server) {
  const io = (0, _socket.default)(server);
  const users = {};
  const compares = [];
  io.on('connection', socket => {
    const id = socket.id;
    users[socket.id] = {
      id,
      star: 3,
      stone: 4,
      scissors: 4,
      paper: 4
    };
    socket.emit('open', id, users);
    socket.on('disconnect', () => {
      delete users[id];
      socket.broadcast.emit('close', users);
    });
    socket.on('message', obj => {
      if (obj.type === 'addUser') {
        users[id].name = obj.name;
      } else if (obj.type === 'compare') {
        compares.push(obj);
        socket.broadcast.emit('isAccept', {
          from: users[obj.fromId],
          to: users[obj.toId]
        }, compares.length - 1);
      } else if (obj.type === 'accept') {
        if (obj.confirm) {
          let item = compares[obj.index];
          item.toCard = obj.card;
          let result = getCompareResult(item.fromCard, obj.card);
          users[item.fromId][item.fromCard]--;
          users[item.toId][item.toCard]--;
          item.result = result;

          if (result === 1) {
            users[item.fromId].star++;
            users[item.toId].star--;
          } else if (result === -1) {
            users[item.fromId].star--;
            users[item.toId].star++;
          }

          socket.broadcast.emit('result', item, users);
        } else {
          socket.broadcast.emit('refuse', users[id]);
        }
      }
    });
  });
}