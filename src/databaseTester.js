// this script tests the database
// launch with node src/databaseTester.js

const DatabaseController = require("./sqlite3.controller.js");
const dbController = new DatabaseController();

dbController.createTables();

dbController.addUser("user1", "test");

// dbController.deleteUser(1);
