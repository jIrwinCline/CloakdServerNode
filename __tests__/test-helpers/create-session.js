const app = require("../../app");
const { login } = require("../../handlers/session");
const request = require("supertest");

exports.createSession = async (email, agent, port) => {
  const session = await agent
    .post(`http://localhost:${port}/login`)
    .send({ email: email, password: "password" })
    .then(res => {
      expect(res.status).toEqual(200);
    });
  return session;
  // agent
  //   .post(`http://localhost:${port}/login`)
  //   .send({ email: "admin@gmail.com", password: "password" })
  //   .then(res => {
  //     expect(res.status).toEqual(200);
  //   });
};
