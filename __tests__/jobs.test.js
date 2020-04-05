process.env.NODE_ENV = "test";

const pool = require("../db");

const request = require("supertest");
const superagent = require("superagent");
const app = require("../app");
const { createUserTable, createJobTable } = require("../databaseCreation");
const { sha512, saltHashPassword } = require("../util/Salt");
const { createSession } = require("../data-helpers/create-session");

var session = require("supertest-session");
var testSession = null;

describe("Full crud functionality for jobs", () => {
  let server;
  const port = 4001;
  const url = `http://localhost:${port}`;
  const agent = superagent.agent();
  beforeAll(done => {
    server = app.listen(port, async () => {
      await pool.query(createUserTable);
      await pool.query(createJobTable);
      const secret = saltHashPassword("password");
      const userCustomer = await pool.query(
        `INSERT INTO public.user
        (email, address, fname, lname, phone, business_name, role, password_hash, password_salt) VALUES('customer@gmail.com', '159 SW Dartmouth St', 'Josh', 'Notperson', '555-555-5555', 'Oregon Historical Society', 'customer', $1, $2) RETURNING *`,
        [secret.passwordHash, secret.salt]
      );
      const userOfficer = await pool.query(
        `INSERT INTO public.user
        (email, address, fname, lname, phone, role, password_hash, password_salt) VALUES('officer@gmail.com', '123 NE Park ave', 'Josh', 'Person', '555-555-5555', 'officer', $1, $2) RETURNING *`,
        [secret.passwordHash, secret.salt]
      );
      const userAdmin = await pool.query(
        `INSERT INTO public.user
        (email, address, fname, lname, phone, role, password_hash, password_salt) VALUES('admin@gmail.com', '123 NE Park ave', 'Josh', 'Admin', '555-555-5555', 'admin', $1, $2) RETURNING *`,
        [secret.passwordHash, secret.salt]
      );
      const userBusiness = await pool.query(
        `INSERT INTO public.user
        (email, address, fname, lname, phone, role, password_hash, password_salt) VALUES('admin@gmail.com', '123 NE Park ave', 'Josh', 'business', '555-555-5555', 'business', $1, $2) RETURNING *`,
        [secret.passwordHash, secret.salt]
      );
      const userTest = await pool.query(
        `INSERT INTO public.user
        (email, address, fname, lname, phone, role, password_hash, password_salt) VALUES('test@gmail.com', '123 NE Park ave', 'Josh', 'test', '555-555-5555', 'business', $1, $2) RETURNING *`,
        [secret.passwordHash, secret.salt]
      );
      console.info(`HTTP server is listening on ${url}`);
      done();
    });
  });
  afterAll(async done => {
    await pool.query("DROP TABLE public.user, public.job");
    server.close(done);
    pool.end();
  });
});
