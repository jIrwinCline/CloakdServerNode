const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

const app = express();
const cors = require("cors");
const pool = require("./db");

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
app.post("/register", (req, res) => {});

app.get("/authenticate", (req, res) => {
  let privateKey = fs.readFileSunc("./private.pem", "utf8");
});

////////////////
//server port///
////////////////
app.listen(5000, () => {
  console.log("server has started on port 5000");
});
