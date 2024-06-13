// USAGE EXAMPLE
// const DatabaseController = require('./path_to/DatabaseController');
// const dbController = new DatabaseController();

// After your operations
// dbController.close();

const Database = require('better-sqlite3');
const path = require('path');

class DatabaseController {
  constructor() {
    this.db = new Database(path.resolve(__dirname, '../db/118er.db'));
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

  addEmergency(emergencyId, vehicles, codex, timeStart, localityMunicipality, jsonEmergency) {
    const stmt = this.db.prepare('INSERT INTO emergency (emergencyId, vehicles, codex, timeStart, localityMunicipality, jsonEmergency) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(emergencyId, vehicles, codex, timeStart, localityMunicipality, jsonEmergency);
    console.log("Emergency added.");
  }

  getEmergencies() {
    const stmt = this.db.prepare('SELECT * FROM emergency');
    return stmt.all();
  }

  deleteEmergency(emergencyId) {
    const stmt = this.db.prepare('DELETE FROM emergency WHERE emergencyId = ?');
    stmt.run(emergencyId);
    console.log("Emergency deleted.");
  }

  addUser(username, chatId) {
    const stmt = this.db.prepare('INSERT INTO user (username, chatId) VALUES (?, ?)');
    stmt.run(username, chatId);
    console.log("User added.");
  }

  deleteUser(username) {
    const stmt = this.db.prepare('DELETE FROM user WHERE username = ?');
    stmt.run(username);
    console.log("User deleted.");
  }

  addSubscription(chatId, username, vehicleCode) {
    const stmt = this.db.prepare('INSERT INTO subscription (chatId, username, vehicleCode) VALUES (?, ?, ?)');
    stmt.run(chatId, username, vehicleCode);
    console.log("Subscription added.");
  }

  deleteSubscription(chatId, vehicleCode) {
    const stmt = this.db.prepare('DELETE FROM subscription WHERE chatId = ? AND vehicleCode = ?');
    stmt.run(chatId, vehicleCode);
    console.log("Subscription deleted.");
  }

  getSubscribers(vehicleCode) {
    const stmt = this.db.prepare('SELECT * FROM subscription WHERE vehicleCode = ?');
    return stmt.all(vehicleCode);
  }

  removeSubscriber(chatId, vehicleCode) {
    const stmt = this.db.prepare('DELETE FROM subscription WHERE chatId = ? AND vehicleCode = ?');
    stmt.run(chatId, vehicleCode);
    console.log("Subscription removed.");
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseController;