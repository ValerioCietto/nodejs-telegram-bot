const { Telegraf } = require("telegraf");
const dotenv = require("dotenv");
dotenv.config({ path: "./configurazione/credenziali.env" });
const { handleTextCommand } = require("./textManager");

// Bot Initialization
let bot = {};
try {
  bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  console.log("Bot initialized");
} catch (error) {
  console.error("Error initializing bot:", error);
}

bot.on("message", (ctx) => handleTextCommand(ctx, bot));

// Graceful Stop Handling
process.once("SIGINT", () => stopBot("SIGINT"));
process.once("SIGTERM", () => stopBot("SIGTERM"));

function launchBot() {
  try {
    bot.launch();
    console.log("Bot launched");
  } catch (error) {
    console.error("Error launching bot:", error);
  }
}

function stopBot(signal) {
  bot.stop(signal);
}

function sendMessage(chatId, text) {
  try {
    bot.telegram.sendMessage(chatId, text);
  } catch (error) {
    console.error(`Error sending message to chatId ${chatId}:`, error);
  }
}

module.exports = {
  launchBot,
  stopBot,
  sendMessage,
};
