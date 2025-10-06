const userModel = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await userModel.findOne({ email: email?.toLowerCase });
    if (user) {
      return res.status(400).json({
        message: "User Already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      data: savedUser,
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1hr",
      }
    );

    console.log(token);
  } catch (error) {
    return res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(
        (400).json({
          message: "User already verified, please proceed to login",
        })
      );
    }

    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      message: "Verification successful",
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(500).json({
        message: "Time out, resend verification",
      });
    }
    return res.status(500).json({
      message: error.message,
    });
  }
};
