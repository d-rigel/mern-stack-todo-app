const express = require("express");
const { v4: generateId } = require("uuid");
const database = require("./database");

const app = express();

function requestLogger(req, res, next) {
  res.once("finish", () => {
    const log = [req.method, req.path];
    if (req.body && Object.keys(req.body).length > 0) {
      log.push(JSON.stringify(req.body));
    }
    if (req.query && Object.keys(req.query).length > 0) {
      log.push(JSON.stringify(req.query));
    }
    log.push("->", res.statusCode);
    // eslint-disable-next-line no-console
    console.log(log.join(" "));
  });
  next();
}

app.use(requestLogger);
app.use(require("cors")());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  const todos = database.client.db("todos").collection("todos");

  // implementing pagination and infinite scroll
  const skip = req.query.skip ? Number(req.query.skip) : 0;
  const DEFAULT_LIMIT = 20;
  try {
    const response = await todos
      .find({})
      .sort({ index: 1 })
      .skip(skip)
      .limit(DEFAULT_LIMIT)
      .toArray();
    res.status(200);
    res.json(response);
  } catch (error) {
    res.status(400).json({
      error: `Error getting todos ${error.message}`,
    });
  }
});

app.post("/", async (req, res) => {
  const { text } = req.body;

  if (typeof text !== "string") {
    res.status(400);
    res.json({ message: "invalid 'text' expected string" });
    return;
  }

  const maxTodo = database.client
    .db("todos")
    .collection("todos")
    .find()
    .limit(1)
    .sort({ index: -1 });
  let maxIndex = undefined;
  if (maxTodo[0]) {
    maxIndex = maxTodo[0].index;
  } else {
    maxIndex = 0;
  }

  const todo = {
    id: generateId(),
    text,
    completed: false,
    index: maxIndex + 1,
  };
  await database.client.db("todos").collection("todos").insertOne(todo);
  res.status(201);
  res.json(todo);
});

app.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { completed, index } = req.body;

  // if (typeof completed !== "boolean") {
  //   res.status(400);
  //   res.json({ message: "invalid 'completed' expected boolean" });
  //   return;
  // }

  let patch = {};

  if (typeof completed == "boolean") {
    patch.completed = { completed: { $eq: [false, "$completed"] } };
  }

  if (typeof index == "number") {
    patch.index = index;
  }

  // implementing data persist after referesh @>>bug fix
  await database.client
    .db("todos")
    .collection("todos")
    .updateOne({ id }, [{ $set: patch }], () => {
      res.status(200);
      res.end();
    });
});

app.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await database.client.db("todos").collection("todos").deleteOne({ id });
  res.status(203);
  res.end();
});

module.exports = app;
