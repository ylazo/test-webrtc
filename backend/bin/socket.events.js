const { verifyAccessToken, roomAccessToken } = require('../Controllers/jwt.controller.js')
const { getRoom } = require('../Controllers/rooms.controller.js')

const setAdminEvents = (socket, io) => {
  socket.on('joinResponse', async ({ requesterId, roomId }) => {
    try {
      const { aud: creatorUserId } = await verifyAccessToken(socket.handshake.auth.token)

      const room = getRoom(roomId)

      if (!(room.creatorUserId === creatorUserId)) throw new Error('Usuario no autorizado')

      const requestSocket = io.sockets.sockets.get(requesterId)

      if (!requestSocket) throw new Error(`socketId: ${requesterId}, no existe`)

      const { aud: userId } = await verifyAccessToken(requestSocket.handshake.auth.token)

      const token = await roomAccessToken({ roomId, userId, creatorUserId })

      requestSocket.emit('joinResponse', { token, room })
      console.log('respuesta enviada!')
    } catch (e) {
      console.log(e)
      io.to('socket#' + requesterId).emit('joinResponse_error', e)
      socket.emit('joinResponse_error', e)
    }
  })
}

const setClientEvents = (socket, io) => {
  socket.on('joinRequest', async ({ roomId }) => {
    try {
      const { username, aud: userId } = await verifyAccessToken(socket.handshake.auth.token)
      const room = getRoom(roomId)
      const requesterId = socket.id

      if (room.adminSocketId) {
        io.sockets.sockets.get(room.adminSocketId).emit('joinRequest', { username, requesterId })
        console.log('solicitud enviada!')
      } else {
        const token = await roomAccessToken({ roomId, userId, creatorUserId: room.creatorUserId })
        socket.emit('joinResponse', { token, room })
      }
    } catch (e) {
      console.log(e)
      socket.emit('joinRequest_error', e)
    }
  })
}

module.exports = { setAdminEvents, setClientEvents }
