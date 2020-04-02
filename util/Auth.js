const fs = require("fs");
const jwt = require("jsonwebtoken");

const jwtAuth = (req, res, next) => {
  if (typeof req.headers.authorization !== "undefined") {
    let token = req.headers.authorization.split(" ")[1];
    let privateKey = fs.readFileSync("./private.pem", "utf8");

    jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, decoded) => {
      if (err) {
        res.status(500).json({ error: "Not Authorized" });
      }
      console.log(decoded);
      return next();
    });
  } else {
    res.status(500).json({ error: "No Token Found" });
  }
};
const roleAuth = roles => {
  return (req, res, next) => {
    // temporary work around for testing: further explore - https://stackoverflow.com/questions/21040811/testing-route-with-fake-session-in-node-js
    // if (process.env.NODE_ENV === "test") {
    //   next();
    //   return null;
    // }
    //
    try {
      if (!req.session.userData || typeof req.session.userData === "undefined")
        res.status(401).json({ error: "Not Signed in" });
      if (req.session.userData.role === "admin" || roles[0] === "all") next();
      //current user is admin or All user roles are permitted
      else {
        switch (roles.length) {
          case 1:
            if (req.session.userData.role === roles[0]) next();
            else res.status(401).json({ error: "Not Authorized by Role" });
            break;
          case 2:
            if (
              req.session.userData.role === roles[0] ||
              req.session.userData.role === roles[1]
            )
              next();
            else res.status(401).json({ error: "Not Authorized by Role" });
            break;
          default:
            res.json({ error: "Internal Role Assignment error" });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
};

module.exports = {
  jwtAuth,
  roleAuth
};
