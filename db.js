const Pool = require("pg").Pool;
const db = process.env.NODE_ENV === "test" ? "cloakddb_test" : "cloakddb";

const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  database: db
});

module.exports = pool;
