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
      const userCustomer1 = await pool.query(
        `INSERT INTO public.user
        (email, address, fname, lname, phone, business_name, role, password_hash, password_salt) VALUES('customer1@gmail.com', '159 SW Dartmouth St', 'Josh', 'Notperson', '555-555-5555', 'Oregon Historical Society', 'customer', $1, $2) RETURNING *`,
        [secret.passwordHash, secret.salt]
      );
      const userCustomer2 = await pool.query(
        `INSERT INTO public.user
        (email, address, fname, lname, phone, business_name, role, password_hash, password_salt) VALUES('customer2@gmail.com', '159 SW Dartmouth St', 'Josh', 'Notperson', '555-555-5555', 'Oregon Historical Society', 'customer', $1, $2) RETURNING *`,
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
  /////////////////begin tests//////////////////////////
  it("should return unauthorized when trying to create a job while not signed in and you are signed in as a officer", async () => {
    try {
      await agent.post(`${url}/jobs/post`).send({
        randomStuff: "Should be real job info"
      });
    } catch (err) {
      expect(err.response.status).toEqual(401);
    }
    return createSession("officer@gmail.com", agent, port).then(async () => {
      try {
        await agent.post(`${url}/jobs/post`).send({
          contactFName: "Harry",
          contactLName: "Truman",
          contactPhone: "1234567890",
          description: "Protect the President",
          duties: "safety of the president",
          location: "123 Presidential st",
          startDate: "4/5/2020 3:30pm",
          endDate: "4/5/2020 10:30pm"
        });
      } catch (err) {
        expect(err.response.status).toEqual(401);
      }
    });
  });
  it("Should create a job as a customer", () => {
    return createSession("customer1@gmail.com", agent, port).then(async () => {
      const response = await agent.post(`${url}/jobs/post`).send({
        contactFName: "Harry",
        contactLName: "Truman",
        contactPhone: "1234567890",
        description: "Protect the President",
        duties: "safety of the president",
        location: "123 Presidential st",
        startDate: new Date("April 30 2020 12:30"),
        endDate: new Date("April 30 2020 18:30")
      });
      expect(response.statusCode).toEqual(200);
    });
  });
  it("should get the made job", async () => {
    const response = await agent.get(`${url}/jobs/1`);
    // console.log(response.body);
    expect(response.statusCode).toEqual(200);
  });
  it("should fill a job as an officer", () => {
    return createSession("officer@gmail.com", agent, port).then(async () => {
      try {
        const response = await agent.patch(`${url}/jobs/1/fill`);
        // console.log(response);
        expect(response.statusCode).toEqual(200);
      } catch (err) {
        console.log(err);
      }
    });
  });
  it("should deny access to delete a job as a customer who did not post it", () => {
    return createSession("customer2@gmail.com", agent, port).then(async () => {
      try {
        const response = await agent.delete(`${url}/jobs/1`);
      } catch (err) {
        expect(err.response.status).toEqual(401);
      }
    });
  });
  it("should delete a job as a customer who posted it", () => {
    return createSession("customer1@gmail.com", agent, port).then(async () => {
      try {
        const response = await agent.delete(`${url}/jobs/1`);
        expect(response.statusCode).toEqual(200);
        const job = await agent.get(`${url}/jobs/1`);
        // expect(job).toBe(false);
      } catch (err) {
        expect(err.response.status).toEqual(404);
      }
    });
  });
});
