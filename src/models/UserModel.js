const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { slug } = require("../utils/functions");
const knex = require("../config/connection");

const database = knex("users");

require("dotenv").config();

class UserModel {
  create(email, password, name, username) {
    if (!email || !password || !name || !username) {
      throw new Error("Missing params.");
    }

    const hash = bcrypt.hashSync(password, 10);

    return new Promise((resolve, reject) => {
      database
        .insert({
          email,
          password: hash,
          name,
          username: slug(username),
        })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err.sqlMessage);
        });
    });
  }

  signIn(email, password) {
    if (!email || !password) {
      throw new Error("Missing params.");
    }

    return new Promise((resolve, reject) => {
      this.findByEmail(email, true)
        .then((data) => {
          if (data[0]) {
            const user = data[0];

            if (bcrypt.compareSync(password, user.password)) {
              delete user.password;
              delete user.passwordResetToken;
              delete user.passwordResetTokenExpires;

              const token = jwt.sign({ user }, process.env.JWT_PRIVATE_KEY, {
                expiresIn: "7d",
              });

              resolve({ accessToken: token });
            } else {
              reject("Invalid password.");
            }
          } else {
            reject("User not found.");
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  authenticate(accessToken) {
    if (!accessToken) {
      throw new Error("No token");
    }

    return new Promise((resolve, reject) => {
      jwt.verify(accessToken, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  }

  async forgotPassword(email) {
    if (!email) {
      throw new Error("No email provided.");
    }

    return new Promise((resolve, reject) => {
      this.findByEmail(email)
        .then((data) => {
          if (data[0]) {
            const token = crypto.randomBytes(20).toString("hex");
            const now = new Date();

            now.setHours(now.getHours() + 1);

            database
              .update({
                passwordResetToken: token,
                passwordResetTokenExpires: now,
              })
              .where({ email })
              .then(() => {
                resolve({ token, tokenExpires: now });
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            reject("User not found.");
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async resetPassword(email, token, newPassword) {
    if (!email || !token || !newPassword) {
      throw new Error("Missing params.");
    }

    return new Promise((resolve, reject) => {
      this.findByEmail(email, true)
        .then((data) => {
          if (data[0]) {
            const user = data[0];

            if (token !== user.passwordResetToken) {
              reject("Invalid token provided.");
            }

            const now = new Date();

            if (now > user.passwordResetTokenExpires) {
              reject("Token expired.");
            }

            const hash = bcrypt.hashSync(newPassword, 10);

            database
              .update({
                password: hash,
                passwordResetToken: null,
                passwordResetTokenExpires: null,
              })
              .where({ email })
              .then(() => {
                resolve("Password reset successful.");
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            reject("User not found.");
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  findByEmail(email, showPassword = false) {
    if (!email) {
      throw new Error("No email provided.");
    }

    const options = ["id", "email", "name", "username", "role", "verified"];

    if (showPassword) {
      options.push("password");
      options.push("passwordResetToken");
      options.push("passwordResetTokenExpires");
    }

    return new Promise((resolve, reject) => {
      database
        .select(options)
        .where({ email })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = new UserModel();
