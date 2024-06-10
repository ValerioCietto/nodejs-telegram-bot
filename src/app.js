// launch with node src/app.js

const { Telegraf } = require("telegraf");
const { decodeCode } = require("./decodeUrgency");
const { vehicles } = require("./vehicles");
const {
  messageNewEmergency,
  messageEndEmergency,
  messageChangeCode,
  messageChangeNumberOfVehicles,
  messageEmergencyInStandBy,
} = require("./messageFormat.js");
const DatabaseController = require("./sqlite.controller.js");
const dbController = new DatabaseController();
dbController.createTables();
const express = require("express");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config({ path: "./src/credenziali.env" });

let previousEmergencies = [];
let emergencies = [];
const subscribers = [];

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

console.log("config bot");
bot.launch();
bot.on("message", (ctx) => textManager(ctx));
// Enable graceful stop
process.once("SIGINT", () => onStop("SIGINT"));
process.once("SIGTERM", () => onStop("SIGTERM"));

function onStop(signal) {
  dbController.close();
  bot.stop(signal);
}

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(cors());
app.get("/", (req, res) => {
  res.send("indirizzi disponibili /test e /data per l'invio di dati");
});
app.get("/test", (req, res) => {
  res.send(
    "Il servizio è attivo. Start time: " +
      this.dateTimeStart +
      ". Last data: " +
      this.dateTimeLastData
  );
});
let dateTimeStart = new Date();
let dateTimeLastData = new Date();

app.post("/data", (req, res) => {
  console.log(req.body.dati);
  // parse json that was stringified
  const data = JSON.parse(req.body.dati);
  dateTimeLastData = new Date();
  handleEmergencyData(data);
  res.send("ok");
});
app.listen(13000, () => {
  console.log("Server started on port 13000");
});
dateTimeStart = new Date();

function textManager(ctx) {
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
    dbController.addUser(ctx.message.from.username, ctx.chat.id);
  } else if (vehicles.includes(ctx.message.text)) {
    ctx.reply("mezzo sottoscritto: " + ctx.message.text);
    console.log(ctx.chat.id);
    console.log(ctx.message.from.username);
    dbController.addSubscription(
      ctx.chat.id,
      ctx.message.from.username,
      ctx.message.text
    );
  } else {
    ctx.reply("Comando non riconosciuto");
  }
}

function sendMessageNewEmergency(emergency, chatId) {
  const formattedText = messageNewEmergency(emergency);
  bot.telegram.sendMessage(chatId, formattedText);
}

// this function generates the event for:
// - new emergency
// - ended emergency
// - change code
// - change number of vehicles
// - emergency in standby
function handleEmergencyData(json) {
  // json is an array of Emergency objects
  json.forEach((emergency) => {
    if (emergency?.emergencyId !== undefined) {
      emergencies.push(emergency);
    }
  });
  const newEmergencies = [];
  // CHECK IF NEW EMERGENCY
  emergencies.forEach((emergency) => {
    if (!previousEmergencies.includes(emergency.emergencyId)) {
      newEmergencies.push(emergency);
    }
  });
  onNewEmergencies(newEmergencies);

  previousEmergencies.forEach((emergency) => {
    if (!emergencies.includes(emergency)) {
      // ENDED Emergency!
      // send message to subscribers
      console.log("ended emergency: " + emergency.emergencyId);
      // remove from previousEmergencies
      previousEmergencies = previousEmergencies.filter((prevEmergency) => {
        return prevEmergency !== emergency.emergencyId;
      });
    }
  });

  // add to previousEmergencies all new emergencies
  previousEmergencies = previousEmergencies.concat(
    newEmergencies.map((emergency) => {
      return emergency.emergencyId;
    })
  );
}

function onNewEmergencies(emergencies) {
  emergencies.forEach((emergency) => {
    if (emergency.manageVehicleForSynoptics) {
      emergency.manageVehicleForSynoptics.forEach((vehicle) => {
        console.log(
          "[onNewEmergencies][" +
            emergency.emergencyId +
            "] vehicle: " +
            vehicle.vehicleCode
        );
        dbController.getSubscribers(vehicle.vehicleCode).then((subscribers) => {
          console.log(
            "[onNewEmergencies][" +
              emergency.emergencyId +
              "] subscribers: " +
              subscribers.length
          );
          subscribers.forEach((subscriber) => {
            console.log(
              "[onNewEmergencies][" +
                emergency.emergencyId +
                "] subscriber: " +
                subscriber.username
            );
            sendMessageNewEmergency(emergency, subscriber.chatId);
          });
        });
      });
    }
  });
}
