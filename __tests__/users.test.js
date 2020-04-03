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

describe("users and sessions", () => {
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
  it("should return 401 status code, because you're not an admin", () => {
    return agent.get(`${url}/users`).catch(err => {
      expect(err.response.status).toEqual(401);
    });
  });

  it("should sign in with admin, return 200 status, and access /users route correctly as admin", () => {
    return createSession("admin@gmail.com", agent, port)
      .then(res => {
        expect(res.status).toEqual(200);
      })
      .then(() => agent.get(`${url}/users`))
      .then(res => {
        expect(res.status).toEqual(200);
        expect(res.body.length).toBe(5);
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0]).toHaveProperty("role");
        expect(res.statusCode).toBe(200);
      });
    // agent.end();
  });
  it("creates a user", async () => {
    return request(app)
      .post("/register")
      .send({
        email: "test@gmail.com",
        password: "password",
        address: "839 SW Broadway Drive APT 74",
        fname: "Jake",
        lname: "Irwin",
        phone: "5037105277",
        businessName: "Oregon Historical Society",
        role: "customer"
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(Number),
          email: "test@gmail.com",
          password_hash: expect.any(String),
          password_salt: expect.any(String),
          address: "839 SW Broadway Drive APT 74",
          fname: "Jake",
          lname: "Irwin",
          phone: "5037105277",
          business_name: "Oregon Historical Society",
          role: "customer",
          unarmed: null,
          unarmed_exp: null,
          armed: null,
          armed_exp: null,
          business_id: null,
          business_name: "Oregon Historical Society",
          county: null,
          dpsst: null
        });
      });
  });
  it("gets one specific user", async () => {
    return createSession("admin@gmail.com", agent, port)
      .then(res => {
        expect(res.status).toEqual(200);
      })
      .then(() => {
        agent.get(`${url}/users/1`).then(res => {
          expect(res.body).toHaveProperty("id");
          expect(res.statusCode).toBe(200);
        });
      });
  });
  it("Updates specific user info", async () => {
    return createSession("admin@gmail.com", agent, port).then(async () => {
      let user = await agent.get(`${url}/users/1`);
      const response = await agent.put(`${url}/users/1`).send({
        email: "customer@gmail.com",
        password: "ibanez12",
        address: "839 SW Broadway Drive APT 74",
        fname: "Josh",
        lname: "Still not a person",
        phone: "5037105277",
        businessName: "Oregon Historical Society",
        role: "customer"
      });
      user = await agent.get(`${url}/users/1`);
      expect(response.statusCode).toBe(200);
      expect(user.body.lname).toEqual("Still not a person");
    });
  });
  it("Deletes a user", () => {
    return createSession("test@gmail.com", agent, port).then(async () => {
      const user = await agent.get(`${url}/users/5`);
      expect(user.body).toHaveProperty("id");
      const response = await agent.delete(`${url}/users/5`);
      expect(response.body.message).toEqual("User Deleted");
    });
  });
});
