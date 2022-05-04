const { verifyAccessToken } = require('../Controllers/jwt.controller.js')

const requireAuth = async (req, res, next) => {
  try {
    await verifyAccessToken(req.headers['authorization'])
    next()
  } catch (e) {
    res.status(401).send(e)
  }
};

module.exports = { requireAuth };
