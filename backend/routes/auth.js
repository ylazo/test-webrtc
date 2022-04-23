var express = require('express');
var router = express.Router();
const { signAccessToken, verifyAccessToken } = require('../Controllers/jwt.controller.js')
const { findOne } = require('../Controllers/users.controller.js')

router.post("/login", async (req, res, next) => {
  try {
    const user = await findOne(req.body)
    const accessToken = 'Bearer ' + await signAccessToken(user)
    res.send({ accessToken, expire: process.env.EXPIRE_TIME })
  } catch (e) {
    res.status(401).send(e)
  }
});

router.get("/verify", async (req, res, next) => {
  try {
    res.send(await verifyAccessToken(req.headers['authorization']))
  } catch (e) {
    res.status(401).send(e)
  }
})

module.exports = router;
