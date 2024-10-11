const DatabaseController = require("./sqlite3.controller.js");
const dbController = new DatabaseController();
const { vehicles } = require("../configurazione/Veicoli");

function handleTextCommand(ctx, bot) {
  const messageText = ctx.message.text;
  switch (messageText) {
    case "/start":
      ctx.reply("Benvenuto! Scrivi la password per connetterti al servizio.");
      break;
    case "/stop":
      dbController.removeUser(ctx.chat.id);
      ctx.reply("Le tue iscrizioni sono state cancellate.");
      break;
    case "cancella iscrizioni":
      dbController.removeAllSubscriptionsByChatId(ctx.chat.id);
      ctx.reply("Iscrizioni cancellate.");
      break;
    default:
      handleVehicleSubscription(ctx, messageText);
  }
}

function handleVehicleSubscription(ctx, messageText) {
  if (vehicles.includes(messageText)) {
    dbController.addSubscription(
      ctx.chat.id,
      ctx.message.from.username,
      messageText
    );
    ctx.reply(`Mezzo sottoscritto: ${messageText}`);
  } else {
    ctx.reply("Comando non riconosciuto.");
  }
}

module.exports = {
  handleTextCommand,
};
