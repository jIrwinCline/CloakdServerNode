process.env.NODE_ENV = "test";

const pool = require("../db");

const request = require("supertest");
const app = require("../app");

const { sha512, saltHashPassword } = require("../util/Salt");

beforeAll(async () => {
  //   await pool.query(
  //     "IF NOT EXISTS CREATE TABLE students (id SERIAL PRIMARY KEY, name TEXT)"
  //   );
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
});

afterAll(async () => {
  //   await pool.query("DROP TABLE public.user");
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
});
