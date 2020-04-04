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
});
