// USAGE EXAMPLE
// const DatabaseController = require('./path_to/DatabaseController');
// const dbController = new DatabaseController();

// After your operations
// dbController.close();

const Database = require("better-sqlite3");
const path = require("path");

class DatabaseController {
  constructor() {
    this.db = new Database(path.resolve(__dirname, "../db/118er_v2.db"));
    console.log("Connected to the 118er database.");
  }

  createTables() {
    const createUsers = `
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY,
        username TEXT,
        chatId TEXT
      )`;
    const createSubscriptions = `
      CREATE TABLE IF NOT EXISTS subscription (
        id INTEGER PRIMARY KEY,
        chatId TEXT,
        username TEXT,
        vehicleCode TEXT
      )`;
    const createEmergencies = `
      CREATE TABLE IF NOT EXISTS emergency (
        id INTEGER PRIMARY KEY,
        emergencyId INTEGER,
        vehicles TEXT,
        codex TEXT,
        timeStart DATETIME,
        localityMunicipality TEXT,
        jsonEmergency TEXT
      )`;

    this.db.exec(createUsers);
    this.db.exec(createSubscriptions);
    this.db.exec(createEmergencies);
    console.log("Tables created or already exist.");
  }

  /**
   * Clears all emergencies from the database by deleting all records in the "emergency" table.
   *
   * @return {void} This function does not return anything.
   */
  clearEmergencies() {
    console.log("[sqlite3.controller.js] clearEmergencies()");
    const stmt = this.db.prepare("DELETE FROM emergency");
    stmt.run();
  }

  addEmergency(
    emergencyId,
    vehicles,
    codex,
    timeStart,
    localityMunicipality,
    jsonEmergency
  ) {
    // make a select to see if emergency is already added
    const stmt = this.db.prepare(
      "SELECT * FROM emergency WHERE emergencyId = ?"
    );
    const result = stmt.get(emergencyId);
    if (result) {
      return false;
    } else {
      // if no, add emergency
      const stmtAdd = this.db.prepare(
        "INSERT INTO emergency (emergencyId, vehicles, codex, timeStart, localityMunicipality, jsonEmergency) VALUES (?, ?, ?, ?, ?, ?)"
      );
      stmtAdd.run(
        emergencyId,
        vehicles,
        codex,
        timeStart,
        localityMunicipality,
        jsonEmergency
      );
      return true;
    }
  }

  getEmergencies() {
    const stmt = this.db.prepare("SELECT * FROM emergency");
    return stmt.all();
  }

  updateEmergency(
    emergencyId,
    vehicles,
    codex,
    timeStart,
    localityMunicipality,
    jsonEmergency
  ) {
    const stmt = this.db.prepare(
      "UPDATE emergency SET vehicles = ?, codex = ?, timeStart = ?, localityMunicipality = ?, jsonEmergency = ? WHERE emergencyId = ?"
    );
    stmt.run(
      vehicles,
      codex,
      timeStart,
      localityMunicipality,
      jsonEmergency,
      emergencyId
    );
    console.log("Emergency updated.");
  }

  getEmergencyById(emergencyId) {
    const stmt = this.db.prepare(
      "SELECT * FROM emergency WHERE emergencyId = ?"
    );
    return stmt.get(emergencyId);
  }

  getIfEmergencyExists(emergencyId) {
    const stmt = this.db.prepare(
      "SELECT * FROM emergency WHERE emergencyId = ?"
    );
    const result = stmt.get(emergencyId);
    return result;
  }

  deleteEmergency(emergencyId) {
    const stmt = this.db.prepare("DELETE FROM emergency WHERE emergencyId = ?");
    stmt.run(emergencyId);
    console.log("Emergency deleted.");
  }

  addUser(username, chatId) {
    const stmt = this.db.prepare(
      "INSERT INTO user (username, chatId) VALUES (?, ?)"
    );
    stmt.run(username, chatId);
    console.log("User added.");
  }

  deleteUser(username) {
    const stmt = this.db.prepare("DELETE FROM user WHERE username = ?");
    stmt.run(username);
    console.log("User deleted.");
  }

  removeUser(chatId) {
    const stmt = this.db.prepare("DELETE FROM user WHERE chatId = ?");
    stmt.run(chatId);
    console.log("User removed.");
  }

  addSubscription(chatId, username, vehicleCode) {
    const stmt = this.db.prepare(
      "INSERT INTO subscription (chatId, username, vehicleCode) VALUES (?, ?, ?)"
    );
    stmt.run(chatId, username, vehicleCode);
    console.log("Subscription added.");
  }

  deleteSubscription(chatId, vehicleCode) {
    const stmt = this.db.prepare(
      "DELETE FROM subscription WHERE chatId = ? AND vehicleCode = ?"
    );
    stmt.run(chatId, vehicleCode);
    console.log("Subscription deleted.");
  }

  getSubscribers(vehicleCode) {
    const stmt = this.db.prepare(
      "SELECT * FROM subscription WHERE vehicleCode = ?"
    );
    return stmt.all(vehicleCode);
  }

  removeSubscriber(chatId, vehicleCode) {
    const stmt = this.db.prepare(
      "DELETE FROM subscription WHERE chatId = ? AND vehicleCode = ?"
    );
    stmt.run(chatId, vehicleCode);
    console.log("Subscription removed.");
  }

  removeAllSubscriptionsByChatId(chatId) {
    const stmt = this.db.prepare("DELETE FROM subscription WHERE chatId = ?");
    stmt.run(chatId);
    console.log("Subscriptions for chatId " + chatId + " removed");
  }

  /**
   * Retrieve all subscriptions from the database.
   * @return {Array.<Object>} an array of objects containing chatId, username, and vehicleCode.
   */
  getAllSubscriptions() {
    const stmt = this.db.prepare("SELECT * FROM subscription");
    return stmt.all();
  }

  removeSubscription(chatId) {
    const stmt = this.db.prepare("DELETE FROM subscription WHERE chatId = ?");
    stmt.run(chatId);
    console.log("Subscription removed.");
  }

  removeSubscriptionByChatIDandVehicleCode(chatId, vehicleCode) {
    const stmt = this.db.prepare(
      "DELETE FROM subscription WHERE chatId = ? AND vehicleCode = ?"
    );
    stmt.run(chatId);
    console.log("Subscription removed.");
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseController;
