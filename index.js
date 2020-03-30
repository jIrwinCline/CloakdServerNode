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
//ROUTES//
const privateKey = fs.readFileSync("./private.pem", "utf8");
/**USERS */
/**CREATE*/ app.post("/register", registerUser);
/**READ*/ app.get("/users", getAllUsers);
/**READ*/ app.get("/users/:id", getUser);
/**UPDATE*/ app.put("/users/:id", updateUser);
/**DELETE*/ app.delete("/users/:id", deleteUser);

/**SESSIONS */
/**CREATE*/ app.post("/login", login);
/**READ*/ app.get("/currentuser", jwtAuth, getCurrentUser);
/**DELETE*/ app.get("/logout", logout);

/**JOBS */
/**CREATE */ app.post("/jobs", roleAuth("business"), async (req, res) => {
  try {
    let {
      contactFName,
      contactLName,
      contactPhone,
      description,
      duties,
      location,
      hours,
      startDate,
      endDate
    } = req.body;
    startDate = new Date(startDate).toISOString();
    endDate = new Date(endDate).toISOString();
    const customerId = req.session.userData.id;
    console.log(startDate, customerId);
    const job = await pool.query(
      "INSERT INTO public.job (contact_fname, contact_lname, contact_phone, description, duties, location, start_date, end_date, customer_id, is_completed, created_on) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, 'false', current_timestamp) RETURNING *",
      [
        contactFName,
        contactLName,
        contactPhone,
        description,
        duties,
        location,
        startDate,
        endDate,
        customerId
      ]
    );
    res.json(job.rows[0]);
  } catch (err) {
    console.log(err);
  }
});

//test
app.get("/test", (req, res) => {
  let userDetails = req.session;
  res.send(userDetails);
});
//test
app.get("/admin", roleAuth("admin"), (req, res) => {
  let userDetails = req.session.userData;
  res.send(userDetails.role);
});
//test
app.get("/customer", roleAuth("customer"), (req, res) => {
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

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
