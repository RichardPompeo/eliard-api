const express = require("express");
const cors = require("cors");
const app = express();

const UserController = require("./controllers/UserController");

require("./config/connection");

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/create", UserController.create);
app.post("/signin", UserController.signIn);
app.post("/authenticate", UserController.authenticate);
app.post("/forgot-password", UserController.forgotPassword);
app.post("/reset-password", UserController.resetPassword);

app.listen("3000", (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Server running: http://localhost:3000");
  }
});
