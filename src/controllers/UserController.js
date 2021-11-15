const User = require("../models/UserModel");

class UserController {
  async create(req, res) {
    const { email, password, name, username } = req.body;

    if (!email || !password || !name || !username) {
      return res.status(400).send("Missing params.");
    }

    User.create(email, password, name, username)
      .then((id) => {
        return res.status(201).send(id);
      })
      .catch((err) => {
        return res.status(400).send(err);
      });
  }

  async signIn(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Missing params.");
    }

    User.signIn(email, password)
      .then((data) => {
        return res.send(data);
      })
      .catch((err) => {
        return res.status(400).send(err);
      });
  }

  async authenticate(req, res) {
    const { token } = req.body;

    if (!token) {
      return res.status(400).send("No token provided.");
    }

    User.authenticate(token)
      .then((data) => {
        return res.send(data);
      })
      .catch((err) => {
        return res.status(400).send(err);
      });
  }

  async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send("No email provided.");
    }

    User.forgotPassword(email)
      .then((data) => {
        return res.send(data);
      })
      .catch((err) => {
        return res.status(400).send(err);
      });
  }

  async resetPassword(req, res) {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).send("Missing params.");
    }

    User.resetPassword(email, token, password)
      .then((data) => {
        return res.send(data);
      })
      .catch((err) => {
        return res.status(400).send(err);
      });
  }
}

module.exports = new UserController();
