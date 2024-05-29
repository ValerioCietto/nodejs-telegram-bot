// telegram bot

const { Telegraf } = require("telegraf");

class TelegramBot {
  constructor(botToken) {
    this.bot = new Telegraf(botToken);
  }

  launch() {
    this.bot.launch();
    this.bot.on("message", (ctx) => textManager(ctx));
  }

  sendMessageToTelegram(chatId, text) {
    this.bot.telegram.sendMessage(chatId, text);
  }

  textManager(ctx) {
    console.log(ctx.message.text);
    if (ctx.message.text === "/start") {
      ctx.reply(
        "Benvenuto in ER dump bot. Scrivi la password per connetterti al servizio"
      );
    } else if (ctx.message.text === "/stop") {
      ctx.reply(
        "Con questo comando non riceverai più notifiche dal bot. Cancella e crea di nuovo la chat per ricominciare."
      );
      // remove the subscriber with the chat id
      subscribers = subscribers.filter((subscriber) => {
        return subscriber.chatId !== ctx.chat.id;
      });
    } else if (ctx.message.text === process.env.TELEGRAM_BOT_PASSWORD) {
      ctx.reply(
        "Password accettata, scrivi il mezzo a cui desideri sottoscrivere le notifiche TUTTO IN MAIUSCOLO. /stop per cancellare"
      );
      // print chat id
      console.log(ctx.chat.id);
      console.log(ctx.message.from.username);

      // add subscriber
      subscribers.push({
        chatId: ctx.chat.id,
        username: ctx.message.from.username,
      });
    } else if (vehicles.includes(ctx.message.text)) {
      ctx.reply("Sottoscrizione mezzi ancora non implementata");
      console.log(ctx.chat.id);
      console.log(ctx.message.from.username);
      vehicleSubscriptions.push({
        chatId: ctx.chat.id,
        username: ctx.message.from.username,
        vehicleCode: ctx.message.text,
      });
    } else {
      ctx.reply("Comando non riconosciuto");
    }
  }
}

module.exports = TelegramBot;
