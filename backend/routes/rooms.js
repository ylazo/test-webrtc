const { verifyAccessToken, roomAccessToken, verifyRoomAccessToken } = require('../Controllers/jwt.controller.js')

var express = require('express');
var router = express.Router();
const {
  // rooms,
  createRoom,
  getRoom
  // deleteRoom,
  // addToRoom,
  // deleteFromRoom
} = require('../Controllers/rooms.controller.js')


router.post('/', async (req, res, next) => {
  try {
    const { roomId } = req.body
    const { aud: userId } = await verifyAccessToken(req.headers['authorization'])
    const token = await roomAccessToken({ roomId, userId, creatorUserId: userId })
    res.status(201).send({ room: createRoom(roomId, userId), token })
  } catch (e) {
    const { message } = e
    res.status(400).send({ message: message.replace('Room controller: ','') })
  }
});

router.get('/',
  /* async (req, res, next) => {
    try {
      const auth = req.headers['room-authorization']
      const {
        roomId: roomIdAuth,
        userId: userIdAuth
      } = await verifyRoomAccessToken(auth)

      const { roomId } = req.query

      if (!(roomIdAuth === roomId)) throw 'Usuario no autorizado'
      next()
    } catch (e) {
      res.status(403).send(e)
    }  
  },
  */
  (req, res, next) => {
    try {
      const { roomId } = req.query
      res.status(200).send({ room: getRoom(roomId) })
    } catch (e) {
      const { message } = e
      res.status(400).send({ message: message.replace('Room controller: ','') })
    }
  }
)

module.exports = router;
