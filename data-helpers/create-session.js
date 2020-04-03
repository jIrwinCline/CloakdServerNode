const app = require("../app");
const { login } = require("../handlers/session");

exports.createSession = async (email, agent, port) => {
  let session = await agent.get(`http://localhost:${port}/logout`);
  session = await agent
    .post(`http://localhost:${port}/login`)
    .send({ email: email, password: "password" });
  return session;
};

// exports.endSession = async (agent) => {

// }
