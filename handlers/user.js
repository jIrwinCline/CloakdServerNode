const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pool = require("../db");
const isAuth = require("../util/Auth");
const { sha512, saltHashPassword } = require("../util/Salt");

exports.registerUser = async (req, res) => {
  try {
    const {
      email,
      password,
      address,
      fname,
      lname,
      phone,
      businessName,
      role
    } = req.body;
    let secret = saltHashPassword(password);
    const newUser = await pool.query(
      "INSERT INTO public.user (email, address, fname, lname, phone, business_name, role, password_hash, password_salt) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, email",
      [
        email,
        address,
        fname,
        lname,
        phone,
        businessName,
        role,
        secret.passwordHash,
        secret.salt
      ]
    );
    req.session.userData = newUser.rows[0];
    res.json({ message: `New user with id: ${newUser.rows[0].id} created` });
  } catch (err) {
    console.error(err);
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM public.user");
    res.json(users.rows);
  } catch (error) {
    console.error(error);
  }
};
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query("SELECT * FROM public.user WHERE id = $1", [
      id
    ]);
    res.json(user.rows);
  } catch (err) {
    console.error(err);
  }
};
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      secret,
      address,
      fname,
      lname,
      phone,
      businessName,
      role
    } = req.body;
    const updateUser = await pool.query(
      "UPDATE public.user SET email = $2, secret = $3, address = $4, fname = $5, lname = $6, phone = $7, business_name = $8 WHERE id = $1",
      [id, email, secret, address, fname, lname, phone, businessName]
    );

    res.json({ message: "User Updated" });
  } catch (err) {
    console.error(err);
  }
};
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const deleteUser = await pool.query("DELETE FROM public.user WHERE id = $1", [
    id
  ]);
  res.json({ message: "User Deleted" });
};
exports.getCurrentUser = async (req, res) => {
  let { id } = req.session.userData;
  const currentUser = await pool.query(
    "SELECT * FROM public.user WHERE id = $1",
    [id]
  );
  // const currentUser = jwt.decode(authToken, privateKey);
  res.json(currentUser.rows);
};
