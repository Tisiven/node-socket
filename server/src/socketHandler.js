import SocketIO from 'socket.io'

function getChallengeResult (fromCard, toCard) {
  if (fromCard === 'stone') {
    if (toCard === 'stone') {
      return 0
    }

    if (toCard === 'scissors') {
      return 1
    }

    if (toCard === 'paper') {
      return -1
    }
  }

  if (fromCard === 'scissors') {
    if (toCard === 'stone') {
      return -1
    }

    if (toCard === 'scissors') {
      return 0
    }

    if (toCard === 'paper') {
      return 1
    }
  }

  if (fromCard === 'paper') {
    if (toCard === 'stone') {
      return 1
    }

    if (toCard === 'scissors') {
      return -1
    }

    if (toCard === 'paper') {
      return 0
    }
  }

  return 0
}

export default function (server) {
  const io = SocketIO(server)
  const users = {}
  const challengeData = {}

  io.on('connection', socket => {
    const id = socket.id

    socket.emit('connected')

    socket.on('open', name => {
      // 初始化数据
      users[id] = {
        id,
        name,
        star: 3,
        stone: 4,
        scissors: 4,
        paper: 4
      }

      // 通知所有人
      io.emit('update_users', users)
    })

    socket.on('challenge', data => {
      data.fromId = id
      challengeData[id] = data
      io.to(data.toId).emit('accept_challenge', users[id])
    })

    socket.on('cancel_challenge', () => {
      io.to(challengeData[id].toId).emit('cancel_challenge')
      delete challengeData[id]
    })

    socket.on('respond_challenge', data => {
      if (data.accept) {
        let cd = challengeData[data.fromId]
        cd.toCard = data.toCard

        users[cd.fromId][cd.fromCard]--
        users[cd.toId][cd.toCard]--

        let result = getChallengeResult(cd.fromCard, cd.toCard)

        if (result === 1) {
          users[cd.fromId].star++
          users[cd.toId].star--
        } else if (result === -1) {
          users[cd.fromId].star--
          users[cd.toId].star++
        }

        io.to(cd.fromId).emit('result_challenge', result, users)
        io.to(cd.toId).emit('result_challenge', -result, users)
      } else {
        io.to(data.fromId).emit('cancel_challenge')
      }

      delete challengeData[data.fromId]
    })

    socket.on('success_challenge', () => {
      socket.broadcast.emit('success_challenge', users[id])
    })

    // 断开连接
    socket.on('disconnect', () => {
      delete users[id]
      // 广播用户已退出
      socket.broadcast.emit('update_users', users)
    })
  })
}
