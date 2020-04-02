const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const session = require("express-session");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pool = require("./db");
const { jwtAuth, roleAuth } = require("./util/Auth");

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
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  registerUser
} = require("./handlers/user");
const { getCurrentUser, login, logout } = require("./handlers/session");
const {
  createJob,
  getAllJobs,
  getJob,
  updateJob,
  deleteJob,
  fillJob
} = require("./handlers/job");
//ROUTES//
const privateKey = fs.readFileSync("./private.pem", "utf8");
/**USERS */
/**CREATE*/ app.post("/register", registerUser);
/**READ*/ app.get("/users", roleAuth(["admin"]), getAllUsers);
/**READ*/ app.get("/users/:id", getUser);
/**UPDATE*/ app.put("/users/:id", updateUser);
/**DELETE*/ app.delete("/users/:id", deleteUser);

/**SESSIONS */
/**CREATE*/ app.post("/login", login);
/**READ*/ app.get("/currentuser", jwtAuth, getCurrentUser);
/**DELETE*/ app.get("/logout", logout);

/**JOBS */
/**CREATE */ app.post("/jobs/post", roleAuth(["customer"]), createJob);
/**READ */ app.get("/jobs", getAllJobs);
/**READ */ app.get("/jobs/:id", getJob);
/**UPDATE */ app.put("/jobs/:id/update", roleAuth(["customer"]), updateJob);
//prettier-ignore
/**UPDATE */ app.patch("/jobs/:id/fill", roleAuth(["business", "officer"]), fillJob);
/**DELETE */ app.delete("/jobs/:id", roleAuth(["customer"]), deleteJob);

//test
app.get("/test", (req, res) => {
  let userDetails = req.cookies;
  res.send(userDetails);
});
//test
app.get("/admin", roleAuth(["admin"]), (req, res) => {
  let userDetails = req.session.userData;
  res.send(userDetails.role);
});
//test
app.get("/customer", roleAuth(["customer"]), (req, res) => {
  let userDetails = req.session.userData;
  res.send(userDetails.role);
});
//get auth token
app.get("/authenticate", (req, res) => {
  let userData = req.session.userData;
  let privateKey = fs.readFileSync("./private.pem", "utf8");
  let token = jwt.sign(userData, privateKey, { algorithm: "HS256" });
  res.send({ authorization: token });
});

module.exports = app;
