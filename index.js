const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pool = require("./db");
const isAuth = require("./util/Auth");

//middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

//ROUTES//
const privateKey = fs.readFileSync("./private.pem", "utf8");

//create
app.post("/register", async (req, res) => {
  try {
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
    const newUser = await pool.query(
      "INSERT INTO public.user (email, secret, address, fname, lname, phone, business_name, role) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email",
      [email, secret, address, fname, lname, phone, businessName, role]
    );
    res.cookie("userData", newUser.rows[0]);
    res.json({ message: `New user with id: ${newUser.rows[0].id} created` });
  } catch (err) {
    console.error(err);
  }
});

//get all
app.get("/users", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM public.user");
    res.json(users.rows);
  } catch (error) {
    console.error(error);
  }
});
//get one user
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query("SELECT * FROM public.user WHERE id = $1", [
      id
    ]);
    res.json(user.rows);
  } catch (err) {
    console.error(err);
  }
});
//update
app.put("/users/:id", async (req, res) => {
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
});
//delete
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  const deleteUser = await pool.query("DELETE FROM public.user WHERE id = $1", [
    id
  ]);
  res.json({ message: "User Deleted" });
});
// decode
app.get("/currentuser", isAuth, async (req, res) => {
  let { id } = req.cookies.userData;
  console.log("ID: ", id);
  const currentUser = await pool.query(
    "SELECT * FROM public.user WHERE id = $1",
    [id]
  );
  // const currentUser = jwt.decode(authToken, privateKey);
  res.json(currentUser.rows);
});
//login?
app.get("/login", isAuth, (req, res) => {
  res.json({ message: "congrats, you logged in" });
});
app.get("/test", (req, res) => {
  let userDetails = req.cookies;
  res.send(userDetails);
});
app.get("/logout", (req, res) => {
  //it will clear the userData cookie
  res.clearCookie("userData");
  res.send("user logout successfully");
});
//get auth token
app.get("/authenticate", (req, res) => {
  let userData = req.cookies;
  let privateKey = fs.readFileSync("./private.pem", "utf8");
  let token = jwt.sign(userData, privateKey, { algorithm: "HS256" });
  res.send({ authorization: token });
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
