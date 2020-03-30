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
const roleAuth = role => {
  return (req, res, next) => {
    if (!req.session.userData) res.json({ error: "Not Signed in" });
    if (
      req.session.userData.role === role ||
      req.session.userData.role === "admin"
    )
      next();
    else res.json({ error: "Not Authorized by Role" });
  };
};

module.exports = {
  jwtAuth,
  roleAuth
};
