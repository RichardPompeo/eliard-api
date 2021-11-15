require("dotenv").config();

const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "eliard",
  },
});

module.exports = knex;
