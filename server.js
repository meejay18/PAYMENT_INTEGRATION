const express = require("express");
require("./config/database");
const PORT = process.env.PORT;
const app = express();
app.use(express.json());

const userRouter = require("./router/userRouter");
app.use(userRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
