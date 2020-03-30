const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const pool = require("../db");
const { sha512 } = require("../util/Salt");

exports.login = async (req, res) => {
  try {
    const { password, email } = req.body;
    const user = await pool.query(
      "SELECT * FROM public.user WHERE email = $1",
      [email]
    );
    if (typeof user.rows[0] === "undefined")
      res.json({ error: "No user by the email" });
    const secret = sha512(password, user.rows[0].password_salt);
    if (secret.passwordHash === user.rows[0].password_hash) {
      req.session.userData = { id: user.rows[0].id, email: user.rows[0].email };
      res.json({ message: `Logged in as ${req.session.userData.email}` });
    } else {
      res.json({ error: "Wrong password credentials" });
    }
  } catch (err) {
    console.log(err);
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
