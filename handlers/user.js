// const jwt = require("jsonwebtoken");
const { saltHashPassword } = require("../util/Salt");

const pool = require("../db");
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
    res.json(newUser.rows[0]);
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
    user.rows[0]
      ? res.json(user.rows[0])
      : res.status(404).json({ error: "No user Found" });
  } catch (err) {
    console.error(err);
  }
};
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
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
    const secret = saltHashPassword(password);
    const updateUser = await pool.query(
      "UPDATE public.user SET email = $2, password_hash = $3, password_salt = $9, address = $4, fname = $5, lname = $6, phone = $7, business_name = $8 WHERE id = $1",
      //prettier-ignore
      [id, email, secret.passwordHash, address, fname, lname, phone, businessName, secret.salt]
    );

    res.json({ message: "User Updated" });
  } catch (err) {
    console.error(err);
  }
};
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const currentUser = req.session.userData;
  if (currentUser.id == id || currentUser.role == "admin") {
    const deleteUser = await pool.query(
      "DELETE FROM public.user WHERE id = $1",
      [id]
    );
    res.json({ message: "User Deleted" });
  } else {
    res
      .status(401)
      .json({ error: "You can't delete an account you don't own" });
  }
};
