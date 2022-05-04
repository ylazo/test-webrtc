const rooms = {}

const createRoom = (roomId, creatorUserId = '') => {
  if (rooms.hasOwnProperty(roomId)) throw new Error('Room controller: La sala solicitada ya existe')
  rooms[roomId] = {
    creatorUserId,
    peersIds: new Set()
  }
  return getRoom(roomId)
}

const getRoom = (roomId) => {
  if (!rooms.hasOwnProperty(roomId)) throw new Error('Room controller: La sala solicitada no existe')
  return {
    creatorUserId: rooms[roomId].creatorUserId,
    peersIds: Array.from(rooms[roomId].peersIds),
    adminSocketId: rooms[roomId].adminSocketId || ''
  }
}

const addToRoom = (roomId, socketId) => {
  if (!rooms.hasOwnProperty(roomId)) throw new Error('Room controller: La sala solicitada no existe')
  rooms[roomId].peersIds.add(socketId)
}

const deleteFromRoom = (roomId, socketId) => {
  if (!rooms.hasOwnProperty(roomId)) throw new Error('Room controller: La sala solicitada no existe')
  rooms[roomId].peersIds.delete(socketId)
  if (rooms[roomId].adminSocketId === socketId) rooms[roomId].adminSocketId = ''
  // if (!rooms[roomId].peersIds.size) try { deleteRoom(roomId) } catch (e) {}
}

const deleteRoom = (roomId) => {
  if (!rooms.hasOwnProperty(roomId)) throw new Error('Room controller: La sala solicitada no existe')
  delete rooms[roomId]
}

const setAdminSocketId = (roomId, socketId) => {
  if (!rooms.hasOwnProperty(roomId)) throw new Error('Room controller: La sala solicitada no existe')
  rooms[roomId].adminSocketId = socketId
}

const getAdminSocketId = (roomId) => {
  if (!rooms.hasOwnProperty(roomId)) throw new Error('Room controller: La sala solicitada no existe')
  return rooms[roomId].adminSocketId || ''
}

module.exports = {
  rooms,
  createRoom,
  getRoom,
  addToRoom,
  deleteFromRoom,
  deleteRoom,
  setAdminSocketId,
  getAdminSocketId
}