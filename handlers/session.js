const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const session = require("express-session");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pool = require("../db");
const isAuth = require("../util/Auth");

exports.login = async (req, res) => {
  try {
    const { secret, email } = req.body;
    console.log(email, secret);
    const user = await pool.query(
      "SELECT * FROM public.user WHERE email = $1 AND secret = $2",
      [email, secret]
    );
    req.session.userData = { id: user.rows[0].id, email: user.rows[0].email };
    res.json({ message: `Logged in as ${req.session.userData.email}` });
  } catch (err) {
    console.error(err);
  }
};
exports.logout = (req, res) => {
  try {
    if (req.session.userData) {
      req.session.destroy();
      res.send({ message: "User logout successful" });
    } else {
      res.send({ error: "No user Logged in" });
    }
  } catch (err) {
    console.error(err);
  }
};
