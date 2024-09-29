// launch with node src/app.js
// release date 28-09-2024

const { launchBot, stopBot } = require("./bot");
const { startServer } = require("./server");
const DatabaseController = require("./sqlite3.controller");

const dbController = new DatabaseController();
dbController.createTables();
dbController.clearEmergencies();

// Launch the bot
launchBot();

// Start the server
startServer(13000);

// Handle graceful shutdown
process.once("SIGINT", () => stopBot("SIGINT"));
process.once("SIGTERM", () => stopBot("SIGTERM"));
