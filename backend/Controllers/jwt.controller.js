const JWT = require('jsonwebtoken')

const signAccessToken = ({ username, userId }) => {
  return new Promise((resolve, reject) => {
    const payload = { username }
    const secret = process.env.ACCESS_TOKEN_SECRET
    const options = {
      expiresIn: process.env.ACCESS_EXPIRE_TIME,
      audience: userId
    }

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        reject(err)
      } else {
        resolve(formatToken(token))
      }
    })
  })
}

const unformatToken = (auth) => {
  return auth.replace('Bearer ','')
}

const formatToken = (token) => {
  return 'Bearer ' + token
}

const verifyAccessToken = (auth) => {
  return new Promise((resolve, reject) => {
    const token = unformatToken(auth || '')

    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        reject(err)
      } else {
        resolve(payload)
      }
    })
  })
}


const roomAccessToken = ({ roomId, userId, creatorUserId }) => {
  return new Promise((resolve, reject) => {
    const payload = { roomId, userId, creatorUserId }
    const secret = process.env.ROOMS_ACCESS_TOKEN_SECRET
    const options = { expiresIn: process.env.ROOMS_ACCESS_EXPIRE_TIME }

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        reject(err)
      } else {
        resolve(formatToken(token))
      }
    })
  })
}

const verifyRoomAccessToken = (auth = '') => {
  return new Promise((resolve, reject) => {
    const options = { expiresIn: process.env.ROOMS_ACCESS_EXPIRE_TIME }
    const token = unformatToken(auth)

    JWT.verify(token, process.env.ROOMS_ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        reject(err)
      } else {
        resolve(payload)
      }
    })
  })
}


module.exports = {
  signAccessToken,
  verifyAccessToken,
  roomAccessToken,
  verifyRoomAccessToken
}
