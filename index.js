const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();
const cors = require("cors");
const pool = require("./db");
const isAuth = require("./util/Auth");

//middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

//ROUTES//
//USERS

//create
app.post("/registerc", async (req, res) => {
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
      "INSERT INTO public.user (email, secret, address, fname, lname, phone, business_name, role) VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
      [email, secret, address, fname, lname, phone, businessName, role]
    );
    console.log(newUser);
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
  }
});

app.get("/login", isAuth, (req, res) => {
  res.json({ message: "congrats, you logged in" });
});

app.get("/authenticate", (req, res) => {
  let privateKey = fs.readFileSync("./private.pem", "utf8");
  let token = jwt.sign({ body: "stuff" }, privateKey, { algorithm: "HS256" });
  res.send(token);
});

////////////////
//server port///
////////////////
app.listen(5000, () => {
  console.log("server has started on port 5000");
});
