const userModel = require('../model/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.createUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body
  try {
    const user = await userModel.findOne({ email: email?.toLowerCase })
    if (user) {
      return res.status(400).json({
        message: 'User Already exists',
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new userModel({ firstName, lastName, email, password: hashedPassword })
    const savedUser = await newUser.save()

    res.status(201).json({
      message: 'User created successfully',
      data: savedUser,
    })

    const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET, {
      expiresIn: '1hr',
    })

    console.log(token)
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating user',
      error: error.message,
    })
  }
}

exports.verifyUser = async (req, res)=>{
  try{
const {token} = req.params
if (!token) {
  return res.status(400).json({
    message: "Token not found"
  })
}
const decoded = jwt.verify(token, process.env.JWT_SECRET)
const user = await userModel.findOne(decoded.id)
if (!user){
  return res.status(400).json({
    message: "User not found"
  })
}
if (user.isVerified){
  return res.status(400).json({
    message: "User already verified, please proceed to login"
  })
}
user.isVerified = true
await user.save()

res.status(200).json({
  message: "User verified successfully"
})
} catch (error){
    if (error instanceof jwt.JsonWebTokenError){
      return res.status(500).json({
        message: "Session expired, please resend verification"
      })
    }
  }
}


exports.getAllUsers = async (req, res) => {
  try {
    const allusers = await userModel.find()

    res.status(200).json({
      message: 'users retrieved successfully',
      data: allusers,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}
exports.getOne = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await userModel.findById(userId)
    if (!user) {
      return res.status(400).json({
        message: 'user does not exist',
      })
    }

    res.status(200).json({
      message: 'Get one user successfully',
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params
    const { firstName, lastName, email, password } = req.body
    const user = await userModel.findById(userId)
    if (!user) {
      return res.status(404).json({
        message: 'user not found',
      })
    }
    const data = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
    }
    const updatedUser = await userModel.findByIdAndUpdate(userId, data, { new: true })

    return res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

exports.loginUser = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await userModel.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(404).json({
        message: 'user not found',
      })
    }

    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) {
      return res.status(400).json({
        message: 'Invalid password',
      })
    }

    // if (user.isVerified === false) {
    //   return res.status(401).json({
    //     message: 'please verify your account before logging in',
    //   })
    // }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '30mins',
    })

    return res.status(200).json({
      message: 'login successfull',
      data: user,
      token: token,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error logging in user',
      error: error.message,
    })
  }
}
exports.changePassword = async (req, res) => {
  try {
    const decodedId = req.user.id
    const { oldPassword, newPassword, confirmPassword } = req.body
    const user = await userModel.findById(decodedId)
    if (!user) {
      return req.status(404).json({
        message: `user not found`,
      })
    }
    const check = await bcrypt.compare(oldPassword, user.password)
    if (!check) {
      return req.status(404).json({
        message: `old password is incorrect`,
      })
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: `password mismatch`,
      })
    }
    const salt = bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    user.password = hashedPassword
    await user.save()
    res.status(200).json({
      message: `change password successfully`,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }
        const deletedUser = await userModel.findByIdAndDelete(id)
        res.status(200).json({
            message: "successfully deleted user",
            data: deletedUser
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};


