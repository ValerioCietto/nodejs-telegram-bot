// launch with node src/app.js

const { TelegramBot } = require("./telegram-bot.js");
const { Server } = require("./server.js");
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

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

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
