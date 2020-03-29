const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const session = require("express-session");
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
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
  })
);
//Function Imports
const {
  registerUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getCurrentUser
} = require("./handlers/user");
const { login } = require("./handlers/session");
//ROUTES//
const privateKey = fs.readFileSync("./private.pem", "utf8");
/**USERS */
/**CREATE*/ app.post("/register", registerUser);
/**READ*/ app.get("/users", getAllUsers);
/**READ*/ app.get("/users/:id", getUser);
/**UPDATE*/ app.put("/users/:id", updateUser);
/**DELETE*/ app.delete("/users/:id", deleteUser);
/**READ*/ app.get("/currentuser", isAuth, getCurrentUser);

/**SESSIONS */
/**CREATE*/ app.post("/login", login);
/**DELETE*/ app.get("/logout", logout);

//test
app.get("/test", (req, res) => {
  let userDetails = req.session;
  res.send(userDetails);
});
//get auth token
app.get("/authenticate", (req, res) => {
  let userData = req.session.userData;
  let privateKey = fs.readFileSync("./private.pem", "utf8");
  let token = jwt.sign(userData, privateKey, { algorithm: "HS256" });
  res.send({ authorization: token });
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
