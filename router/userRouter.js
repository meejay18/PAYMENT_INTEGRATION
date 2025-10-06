const express = require('express')
const { authentication } = require('../middleware/authentication')
const { createUser, getAllUsers, getOne, updateUser, deleteUser } = require('../controller/userController')

const router = express.Router()

router.post('/user', createUser)
router.get('/user',   getAllUsers)
router.get('/user/:userId', getOne)
router.put('/user/:userId', updateUser)
router.delete('/users/:id', deleteUser)

module.exports = router
