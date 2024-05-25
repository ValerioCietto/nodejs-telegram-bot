// USAGE EXAMPLE
// const DatabaseController = require('./path_to/DatabaseController');
// const dbController = new DatabaseController();

// After your operations
// dbController.close();

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class DatabaseController {
  constructor() {
    this.db = new sqlite3.Database(
      path.resolve(__dirname, "../db/118er.db"),
      (err) => {
        if (err) {
          console.error(err.message);
        }
        console.log("Connected to the 118er database.");
      }
    );
  }

  async createTables() {
    const createUsers =
      "CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY, username TEXT, chatId TEXT)";
    const createSubscriptions =
      "CREATE TABLE IF NOT EXISTS subscription (id INTEGER PRIMARY KEY, chatId TEXT, username TEXT, vehicleCode TEXT)";

    this.db.run(createUsers, (err) => {
      if (err) {
        console.error("Error creating user table:", err.message);
      } else {
        console.log("User table created or already exists.");
      }
    });

    this.db.run(createSubscriptions, (err) => {
      if (err) {
        console.error("Error creating subscription table:", err.message);
      } else {
        console.log("Subscription table created or already exists.");
      }
    });
  }

  async addUser(username, chatId) {
    this.db.run(
      "INSERT INTO user (username, chatId) VALUES (?, ?)",
      [username, chatId],
      (err) => {
        if (err) {
          console.error("Error adding user:", err.message);
        } else {
          console.log("User added.");
        }
      }
    );
  }

  async addSubscription(chatId, username, vehicleCode) {
    this.db.run(
      "INSERT INTO subscription (chatId, username, vehicleCode) VALUES (?, ?, ?)",
      [chatId, username, vehicleCode],
      (err) => {
        if (err) {
          console.error("Error adding subscription:", err.message);
        } else {
          console.log("Subscription added.");
        }
      }
    );
  }

  async getSubscribers(vehicleCode) {
    return new Promise((resolve, reject) => {
      let subscribers = [];
      this.db.each(
        "SELECT * FROM subscription WHERE vehicleCode = ?",
        [vehicleCode],
        (err, row) => {
          if (err) {
            reject(err.message);
          }
          subscribers.push(row);
        },
        (err, count) => {
          if (err) {
            reject(err.message);
          }
          resolve(subscribers);
        }
      );
    });
  }

  async removeSubscriber(chatId, vehicleCode) {
    this.db.run(
      "DELETE FROM subscription WHERE chatId = ? AND vehicleCode = ?",
      [chatId, vehicleCode],
      (err) => {
        if (err) {
          console.error("Error removing subscription:", err.message);
        } else {
          console.log("Subscription removed.");
        }
      }
    );
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseController;
