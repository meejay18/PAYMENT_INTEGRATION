const express = require('express')
const { authentication } = require('../middleware/authentication')
const { createUser, getAllUsers, getOne, updateUser } = require('../controller/userController')

const router = express.Router()

router.post('/user', createUser)
router.post("/user/verify/:token", verifyUser)
router.get('/user', getAllUsers)
router.get('/user/:userId', getOne)
router.put('/user/:userId', updateUser)
router.post('/user/login', loginUser)
router.delete('/users/:id', deleteUser)

module.exports = router
