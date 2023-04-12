const bcrypt = require("bcrypt");
const supertest = require("supertest");
const User = require("../models/user");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
describe("POST /api/users", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash("sekert", 10);
    const user = new User({ username: "root", passwordHash });
    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("creation invalid user that username length <3", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "ml",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api.post("/api/users").send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test("creation invalid user that password is null", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "ml123",
      name: "ml123",
      password: "",
    };

    const result = await api.post("/api/users").send(newUser).expect(400);
    expect(result.body.error).toContain("password can not be null");
    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test("creation invalid user that name is null", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "ml123",
      name: "",
      password: "",
    };

    const result = await api.post("/api/users").send(newUser).expect(400);
    expect(result.body.error).toContain("password can not be null");
    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "root",
      password: "root123",
    };
    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("username must be unique");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  }, 50000);
});

describe("GET /api/users", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    for (let initialUser of helper.initialUsers) {
      const passwordHash = await bcrypt.hash(initialUser.password, 10);
      const user = new User({
        username: initialUser.username,
        name: initialUser.name,
        passwordHash,
      });
      await user.save();
    }
  });
  test("get all user", async () => {
    const response = await api.get("/api/users");
    expect(response.body).toHaveLength(helper.initialUsers.length);
  });
});
