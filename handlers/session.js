const session = require("express-session");
const cookieParser = require("cookie-parser");
const pool = require("../db");
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
      "INSERT INTO public.user (email, address, fname, lname, phone, business_name, role, password_hash, password_salt) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
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
      req.session.userData = user.rows[0];
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
