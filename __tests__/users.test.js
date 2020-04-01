process.env.NODE_ENV = "test";

const pool = require("../db");

const request = require("supertest");
const app = require("../app");
const { createUserTable, createJobTable } = require("../databaseCreation");
const { sha512, saltHashPassword } = require("../util/Salt");

beforeAll(async () => {
  //   await pool.connect();
  try {
    await pool.query(createUserTable);
    await pool.query(createJobTable);
  } catch (error) {
    console.log(error);
  }
});

beforeEach(async () => {
  const secret = saltHashPassword("password");
  const user1 = await pool.query(
    `INSERT INTO public.user 
        (email, address, fname, lname, phone, business_name, role, password_hash, password_salt) VALUES('customer@gmail.com', '159 SW Dartmouth St', 'Josh', 'Notperson', '555-555-5555', 'Oregon Historical Society', 'customer', $1, $2) RETURNING *`,
    [secret.passwordHash, secret.salt]
  );
  const user2 = await pool.query(
    `INSERT INTO public.user 
        (email, address, fname, lname, phone, role, password_hash, password_salt) VALUES('officer@gmail.com', '123 NE Park ave', 'Josh', 'Person', '555-555-5555', 'officer', $1, $2) RETURNING *`,
    [secret.passwordHash, secret.salt]
  );
});

afterEach(async () => {
  await pool.query("DELETE FROM public.user");
  await pool.query("DELETE FROM public.job");
});

afterAll(async () => {
  await pool.query("DROP TABLE public.user, public.job");
  pool.end();
});

describe("user routes", () => {
  it("creates a user", async () => {
    return request(app)
      .post("/register")
      .send({
        email: "customer@gmail.com",
        password: "ibanez12",
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
          email: "customer@gmail.com",
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
    let response = await request(app).get("/users");
    //   console.log(response);
    // response = response;
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("role");
    expect(response.statusCode).toBe(200);
  });
  it("gets one specific user", async () => {
    let response = await request(app).get("/users/6"); //at this point in testing, the 6th and 7th users are the only ones in the db
    expect(response.body).toHaveProperty("id");
    expect(response.statusCode).toBe(200);
  });
  it("Updates specific user info", async () => {
    let user = await request(app).get("/users/8");
    const response = await request(app)
      .put("/users/8")
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
    user = await request(app).get("/users/8");
    expect(response.statusCode).toBe(200);
    console.log(user);
    expect(user.body.lname).toEqual("Still not a person");
  });
});
