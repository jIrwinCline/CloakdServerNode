// const jwt = require("jsonwebtoken");

const pool = require("../db");

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
