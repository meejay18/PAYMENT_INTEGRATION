const express = require("express");
const { authentication } = require("../middleware/authentication");
const { createUser, verifyUser } = require("../controller/userController");

const router = express.Router();

router.post("/user", createUser);
router.get("/user/:token", verifyUser);

module.exports = router;
