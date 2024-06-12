// this script tests the database
// launch with node src/databaseTester.js

const DatabaseController = require("./sqlite.controller.js");
const dbController = new DatabaseController();

dbController.addEmergency(
  1,
  "1,2,3",
  "code1",
  "2022-01-01 12:00:00",
  "Milano",
  JSON.stringify({ test: "test" })
);

dbController.addUser("user1", "test");

// dbController.deleteUser(1);
