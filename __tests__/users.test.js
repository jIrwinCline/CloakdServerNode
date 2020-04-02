process.env.NODE_ENV = "test";

const pool = require("../db");

const request = require("supertest");
const app = require("../app");
const { createUserTable, createJobTable } = require("../databaseCreation");
const { sha512, saltHashPassword } = require("../util/Salt");
const { createSession } = require("./test-helpers/create-session");

var session = require("supertest-session");
var testSession = null;

let agent = request.agent(app);

beforeAll(async () => {
  //   await pool.connect();
  await pool.query(createUserTable);
  await pool.query(createJobTable);
  const secret = saltHashPassword("password");
  const userCustomer = await pool.query(
    `INSERT INTO public.user 
        (email, address, fname, lname, phone, business_name, role, password_hash, password_salt) VALUES('customer@gmail.com', '159 SW Dartmouth St', 'Josh', 'Notperson', '555-555-5555', 'Oregon Historical Society', 'customer', $1, $2) RETURNING *`,
    [secret.passwordHash, secret.salt]
  );
  // console.log(userCustomer.rows[0]);
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
});

beforeEach(async () => {
  // const response = await createSession("admin@gmail.com");
  // console.log(response);
  // testSession = session(app);
});

afterEach(async () => {
  // testSession.end();
});

afterAll(async () => {
  await pool.query("DELETE FROM public.user");
  await pool.query("DELETE FROM public.job");
  await pool.query("DROP TABLE public.user, public.job");
  pool.end();
});

describe("user routes", () => {
  it("logs admin in", async () => {
    let response = await request(app)
      .post("/login")
      .send({ email: "admin@gmail.com", password: "password" });
    expect(response.statusCode).toBe(200);
  });
  // it("logs admin in", async done => {
  //   testSession
  //     .post("/login")
  //     .send({ email: "admin@gmail.com", password: "password" })
  //     .expect(200)
  //     .end(done);
  // });

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
  it("retrieves array of users", async () => {
    // const login = await createSession("admin@gmail.com");
    let login = await request(app)
      .post("/login")
      .send({ email: "admin@gmail.com", password: "password" });
    expect(login.statusCode).toBe(200);
    // let login = await request(app)
    //   .post("/login")
    //   .send({ email: "admin@gmail.com", password: "password" });
    // expect(login.statusCode).toBe(200);
    let response = await request(app).get("/users");
    //   console.log(response);
    // response = response;
    expect(response.body.length).toBe(5);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("role");
    expect(response.statusCode).toBe(200);
  });
  it("gets one specific user", async () => {
    let response = await request(app).get("/users/1");
    expect(response.body).toHaveProperty("id");
    expect(response.statusCode).toBe(200);
  });
  it("Updates specific user info", async () => {
    let user = await request(app).get("/users/1");
    const response = await request(app)
      .put("/users/1")
      .send({
        email: "customer@gmail.com",
        password: "ibanez12",
        address: "839 SW Broadway Drive APT 74",
        fname: "Josh",
        lname: "Still not a person",
        phone: "5037105277",
        businessName: "Oregon Historical Society",
        role: "customer"
      });
    user = await request(app).get("/users/1");
    expect(response.statusCode).toBe(200);
    // console.log(user);
    expect(user.body.lname).toEqual("Still not a person");
  });
  // it("deletes a specific")
});
