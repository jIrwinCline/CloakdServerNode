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

exports.getCurrentUser = async (req, res) => {
  let { id } = req.session.userData;
  const currentUser = await pool.query(
    "SELECT * FROM public.user WHERE id = $1",
    [id]
  );
  // const currentUser = jwt.decode(authToken, privateKey);
  res.json(currentUser.rows);
};
