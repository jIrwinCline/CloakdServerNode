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
//Function Imports
const {
  registerUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getCurrentUser
} = require("./handlers/user");
//ROUTES//
const privateKey = fs.readFileSync("./private.pem", "utf8");

/**CREATE*/ app.post("/register", registerUser);
/**READ*/ app.get("/users", getAllUsers);
/**READ*/ app.get("/users/:id", getUser);
/**UPDATE*/ app.put("/users/:id", updateUser);
/**DELETE*/ app.delete("/users/:id", deleteUser);

// decode
app.get("/currentuser", isAuth, getCurrentUser);
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
