// launch with node src/app.js

const { Telegraf } = require("telegraf");
const { decodeCode } = require("./decodeUrgency");
const { vehicles } = require("./vehicles");
const DatabaseController = require("./sqlite.controller.js");
const dbController = new DatabaseController();

const dotenv = require("dotenv");
dotenv.config({ path: "./src/credenziali.env" });

let previousEmergencies = [];
let emergencies = [];
const subscribers = [];
const vehicleSubscriptions = [];

// mock subscription
subscribers.push({ chatId: 24326382, username: "ValerioCietto" });
vehicleSubscriptions.push({
  chatId: 24326382,
  username: "ValerioCietto",
  vehicleCode: "MONTERENZIO41",
});

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
// echo user text messages
bot.on("message", (ctx) => textManager(ctx));

console.log("config bot");
bot.launch();
// Enable graceful stop
process.once("SIGINT", () => onStop("SIGINT"));
process.once("SIGTERM", () => onStop("SIGTERM"));

function onStop(signal) {
  dbController.close();
  bot.stop(signal);
}

function sendMessageToSubscribers(text, vehicleCode) {
  console.log("sendMessageToSubscribers:" + vehicleCode);
  subscribers.forEach((subscriber) => {
    // if subscriber has a vehicle subscription, send only to that vehicle
    console.log(
      "searching subscriptions for subscriber: " +
        subscriber.username +
        " - " +
        subscriber.chatId
    );
    vehicleSubscriptions.forEach((vehicleSubscription) => {
      if (
        vehicleSubscription.chatId === subscriber.chatId &&
        vehicleSubscription.vehicleCode === vehicleCode
      ) {
        console.log("found vehicle subscription: " + vehicleCode);
        bot.telegram.sendMessage(subscriber.chatId, text);
        return;
      }
    });
    // bot.telegram.sendMessage(subscriber.chatId, text);
  });
}

function sendMessageToTelegram(chatId, text) {
  bot.telegram.sendMessage(chatId, text);
}

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

const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// add cors middleware
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/hello", (req, res) => {
  const sentData = req.query;
  console.log(req.query);
  res.send("Hello World!");
});

app.post("/data", (req, res) => {
  console.log(req.body.dati);
  // parse json that was stringified
  const data = JSON.parse(req.body.dati);

  handleEmergencyData(data);
  res.send("ok");
});

app.listen(13001, () => {
  console.log("Bot app listening on port 13000!");
});

function handleEmergencyData(json) {
  // json is an array of Emergency objects
  json.forEach((emergency) => {
    if (emergency?.address !== undefined) {
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
    console.log("new emergency: " + emergency.emergencyId);
  });
  console.log("new emergencies");
}

function messageNewEmergency(emergency) {
  let emergencyString = "";
  // example
  // 🚑ALERT! EMERGENZA N° 021815 alle 12:29 IN CORSO
  // SC01V località OZZANO DELL'EMILIA CAPOLUOGO - OZZANO DELL'EMILIA PARCO DELLA RESISTENZA PARCO DELLA RESISTENZA
  // Il mezzo assegnato all'intervento è la macchina MONTERENZIO41 in STRADA con patologia TRAuMATICA codice VERDE
  // link a openstreetmap
  emergencyString =
    `🚑ALERT! EMERGENZA N° ${emergency.emergencyId} alle ${emergency.timeDelayed} IN CORSO ` +
    `\n ${emergency.localityMunicipality} ${emergency.address} \n Il mezzo assegnato all'intervento è la macchina ${emergency.manageVehicleForSynoptics?.vehicleCode} ` +
    `in STRADA con patologia ${emergency.patology} codice ${emergency.codex} \n link a openstreetmap `;
  console.log("new emergency");
  return emergencyString;
}

function messageEndEmergency() {
  // example
  // EMERGENZA N° 021717 -> KC03R - Mezzo MONTERENZIO41 si è liberato alle 11:30, codice VERDE, luogo OZZANO DELL'EMILIA
  console.log("end emergency");
}

function messageChangeCode() {
  // example
  // 🚑ALERT! EMERGENZA N° 021815 ha cambiato codice colore gravità da VERDE a GIALLO alle ore 12:38
  console.log("change code");
}

function messageChangeNumberOfVehicles() {
  console.log("change number of vehicles");
}

function messageEmergencyInStandBy() {
  console.log("emergency in standby");
}
