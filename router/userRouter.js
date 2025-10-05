const express = require('express')
const { authentication } = require('../middleware/authentication')
const { createUser } = require('../controller/userController')

const router = express.Router()

router.post('/user', createUser)

module.exports = router
