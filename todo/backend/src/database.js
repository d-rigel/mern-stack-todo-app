const { MongoClient } = require("mongodb");

const database = module.exports;

database.connect = async function connect() {
  // database.client = new MongoClient("mongodb://root:1234@database:27017/");
  database.client = new MongoClient("mongodb://localhost/filestageTodo");
  await database.client.connect();
};
