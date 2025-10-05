const jwt = require('jsonwebtoken')
const userModel = require('../model/userModel')

exports.authentication = async (req, res, next) => {
  try {
    const auth = req.headers.authorization

    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided or token format invalid',
      })
    }
    const token = auth.split(' ')[1]
    console.log(token)

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await userModel.findById(decoded.id)
    if (!user) {
      res.status(404).json({
        message: 'Authentication failed, user not found',
      })
    }

    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(500).json({
        message: 'Session expired, please login to your account',
      })
    }
    return res.status(500).json({
      message: 'Error with authentication',
      error: error.message,
    })
  }
}
