const app = require("../app");
const { login } = require("../handlers/session");
// const request = require("supertest");

// let createSession;

// it("Should login and return status code 200", () => {
exports.createSession = async (email, agent, port) => {
  const session = await agent
    .post(`http://localhost:${port}/login`)
    .send({ email: email, password: "password" });
  return session;
};
// });
