const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const fs = require("fs");

const app = express();
const cors = require("cors");
const pool = require("./db");
const isAuth = require("./util/Auth");

//middleware
app.use(cors());
app.use(express.json());
const jwtMW = expressJwt({
  secret: "keyboard cat 4 ever"
});
app.use(bodyParser.json());

//ROUTES//

//USERS

//create
app.get("/register", (req, res) => {
  res.json({ message: "registering..." });
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
