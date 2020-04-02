const app = require("../../app");
const { login } = require("../../handlers/session");
const request = require("supertest");
// it("logs a user in", () => {
exports.createSession = async email => {
  const session = await request
    .agent(app)
    .post("/login")
    .send({ email: email, password: "password" });
  console.log(session.session);
  //   expect(session.status).toEqual(200);
  //   console.log(session);
  // .then(res => {
  //   const cookie = res.headers["set-cookie"][0]
  //     .split(",")
  //     .map(item => item.split(";")[0]);
  //   agent.jar.setCookies(cookie);
  // });
};
// });
