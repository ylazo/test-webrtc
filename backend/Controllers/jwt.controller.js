const JWT = require('jsonwebtoken')

const signAccessToken = ({ username, userId }) => {
  return new Promise((resolve, reject) => {
    const payload = { username }
    const secret = process.env.ACCESS_TOKEN_SECRET
    const options = {
      expiresIn: process.env.EXPIRE_TIME,
      audience: userId
    }

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        reject(err)
      } else {
        resolve(token)
      }
    })
  })
}

const verifyAccessToken = (token) => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
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
  verifyAccessToken
}
