// launch with node src/app.js

const { Telegraf } = require("telegraf");
const { decodeCode } = require("./decodeUrgency");
const { vehicles } = require("../configurazione/Veicoli");
const {
  messageNewEmergency,
  messageEndEmergency,
  messageChangeCode,
  messageChangeNumberOfVehicles,
  messageEmergencyInStandBy,
} = require("./messageFormat.js");
const DatabaseController = require("./sqlite3.controller.js");
const dbController = new DatabaseController();
dbController.createTables();
dbController.clearEmergencies();
const express = require("express");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config({ path: "./configurazione/credenziali.env" });

let previousEmergencies = [];
let emergencies = [];
const subscribers = [];

let bot = {};
try {
  bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
} catch (error) {
  console.log("error in starting bot", error);
}

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
    dbController.removeUser(ctx.chat.id);
    dbController.removeAllSubscriptionsByChatId(ctx.chat.id);
  } else if (ctx.message.text === "cancella iscrizioni") {
    ctx.reply("Iscrizioni cancellate.");
    // remove the subscriber with the chat id
    dbController.removeAllSubscriptionsByChatId(ctx.chat.id);
  } else if (ctx.message.text === process.env.TELEGRAM_BOT_PASSWORD) {
    ctx.reply(
      "Password accettata, scrivi il mezzo a cui desideri sottoscrivere le notifiche TUTTO IN MAIUSCOLO. /stop per cancellare"
    );
    dbController.addUser(ctx.message.from.username, ctx.chat.id);
  } else if (vehicles.includes(ctx.message.text)) {
    // add check to avoid multiple subscriptions for the same user - vehicle
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

function parseJSONEmergencies(json) {
  const emergencyArrayOutput = [];
  json.forEach((emergency) => {
    if (emergency?.emergencyId !== undefined) {
      emergencyArrayOutput.push(emergency);
    }
  });
  return emergencyArrayOutput;
}

function makeVehicleString(manageVehicleForSynoptics) {
  const vehicleList = [];
  if (manageVehicleForSynoptics) {
    manageVehicleForSynoptics.forEach((vehicle) => {
      vehicleList.push(vehicle.vehicleCode);
    });
  }
  return vehicleList.join(", ");
}

// this function generates the event for:
// - new emergency
// - ended emergency
// - change code
// - change number of vehicles
// - emergency in standby
async function handleEmergencyData(json) {
  const emergencyData = parseJSONEmergencies(json);
  if (emergencyData.length === 0) {
    // void json provided, exit
    return;
  }

  const newEmergencies = [];
  const currentEmergencies = await dbController.getEmergencies();

  const currentEmergenciesIds = [];
  currentEmergencies.forEach((current) => {
    currentEmergenciesIds.push("" + current.emergencyId);
  });
  console.log(currentEmergenciesIds);
  // CHECK IF NEW EMERGENCY
  emergencyData.forEach((emergency) => {
    const isNewEmergency = dbController.addEmergency(
      emergency.emergencyId,
      makeVehicleString(emergency.manageVehicleForSynoptics),
      emergency.codex,
      emergency.timeDelayed,
      emergency.localityMunicipality,
      JSON.stringify(emergency)
    );
    if (isNewEmergency) {
      console.log(
        "[handleEmergencyData] new emergency: " + emergency.emergencyId
      );
      newEmergencies.push(emergency);
    }
  });
  onNewEmergencies(newEmergencies);

  // CHECK CHANGE CODEX
  const changeCodeEmergencies = [];
  emergencyData.forEach((emergency) => {
    currentEmergencies.forEach((currentEmergency) => {
      if (currentEmergency === emergency.emergencyId) {
        if (emergency.codex !== currentEmergency.codex) {
          console.log(
            "[handleEmergencyData] change code emergency: " +
              emergency.emergencyId
          );
          changeCodeEmergencies.push(emergency);
          dbController.updateEmergency(
            emergency.emergencyId,
            emergency.vehicles,
            emergency.codex,
            emergency.timeDelayed,
            emergency.localityMunicipality
          );
        }
      }
    });
  });
  onChangeCodeEmergencies(changeCodeEmergencies);

  // CHECK CHANGE NUMBER OF VEHICLES
  const changeVehiclesEmergencies = [];
  emergencyData.forEach((emergency) => {
    currentEmergencies.forEach((currentEmergency) => {
      if (currentEmergency === emergency.emergencyId) {
        if (!sameLogistics(emergency1, emergency2)) {
          console.log(
            "[handleEmergencyData] change number of vehicles emergency: " +
              emergency.emergencyId
          );
          changeVehiclesEmergencies.push(emergency);
          dbController.updateEmergency(
            emergency.emergencyId,
            emergency.vehicles,
            emergency.codex,
            emergency.timeDelayed,
            emergency.localityMunicipality
          );
        }
      }
    });
  });
  onChangeVehiclesEmergencies(changeVehiclesEmergencies);

  // CHECK IF ENDED EMERGENCY
  const endedEmergencies = [];
  currentEmergencies.forEach((emergency) => {
    const isCurrentEmergency = dbController.getIfEmergencyExists(
      emergency.emergencyId
    );
    if (isCurrentEmergency === undefined) {
      console.log(
        "[handleEmergencyData] EMERGENCY ENDED!!!!: " +
          emergency.codex +
          " " +
          emergency.localityMunicipality
      );
      endedEmergencies.push(emergency.emergencyId);
      dbController.deleteEmergency(emergency.emergencyId);
    }
  });
  onEndedEmergencies(endedEmergencies);
}

// return true if the 2 emergencies have same manageVehicleForSynoptics
function sameLogistics(emergency1, emergency2) {
  if (
    emergency1.manageVehicleForSynoptics.length !==
    emergency2.manageVehicleForSynoptics.length
  ) {
    return false;
  }
  for (let i = 0; i < emergency1.manageVehicleForSynoptics.length; i++) {
    if (
      emergency1.manageVehicleForSynoptics[i] !==
      emergency2.manageVehicleForSynoptics[i]
    ) {
      return false;
    }
  }
  return true;
}

function sendMessageFormatted(chatId, text) {
  try {
    bot.telegram.sendMessage(chatId, text);
  } catch (error) {
    console.log("unable to send message to:", chatId);
  }
}

function sendMessageNewEmergency(emergency, chatId) {
  const formattedText = messageNewEmergency(emergency);
  sendMessageFormatted(chatId, formattedText);
}

function sendMessageEndEmergency(emergency, chatId) {
  const formattedText = messageEndEmergency(emergency);
  sendMessageFormatted(chatId, formattedText);
}

function sendMessageChangeCode(emergency, chatId) {
  const formattedText = messageChangeCode(emergency);
  sendMessageFormatted(chatId, formattedText);
}

function sendMessageChangeNumberOfVehicles(emergency, chatId) {
  const formattedText = messageChangeNumberOfVehicles(emergency);
  sendMessageFormatted(chatId, formattedText);
}

function onEndedEmergencies(emergencies) {
  emergencies.forEach((emergencyId) => {
    const subscribers = dbController.getSubscribers(emergencyId);

    console.log(
      "[onEndedEmergencies][" +
        emergencyId +
        "] subscribers: " +
        subscribers.length
    );
    subscribers.forEach((subscriber) => {
      console.log(
        "[onEndedEmergencies][" +
          emergencyId +
          "] subscriber: " +
          subscriber.username
      );
      sendMessageEndedEmergency(emergencyId, subscriber.chatId);
    });
  });
}

function onChangeCodeEmergencies(emergencies) {
  emergencies.forEach((emergency) => {
    dbController.getSubscribers(emergency.emergencyId).then((subscribers) => {
      console.log(
        "[onChangeCodeEmergencies][" +
          emergency.emergencyId +
          "] subscribers: " +
          subscribers.length
      );
      subscribers.forEach((subscriber) => {
        console.log(
          "[onChangeCodeEmergencies][" +
            emergency.emergencyId +
            "] subscriber: " +
            subscriber.username
        );
        sendMessageChangeCode(emergency, subscriber.chatId);
      });
    });
  });
}

function onChangeVehiclesEmergencies(emergencies) {
  emergencies.forEach((emergency) => {
    dbController.getSubscribers(emergency.emergencyId).then((subscribers) => {
      console.log(
        "[onChangeVehiclesEmergencies][" +
          emergency.emergencyId +
          "] subscribers: " +
          subscribers.length
      );
      subscribers.forEach((subscriber) => {
        console.log(
          "[onChangeVehiclesEmergencies][" +
            emergency.emergencyId +
            "] subscriber: " +
            subscriber.username
        );
        sendMessageChangeNumberOfVehicles(emergency, subscriber.chatId);
      });
    });
  });
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
        const subscribers = dbController.getSubscribers(vehicle.vehicleCode);
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
    }
  });
}
