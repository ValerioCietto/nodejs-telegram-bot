// launch with node src/emergenciesGeneratorDatabase.js
// this script reads all emergencies in database, changes one so that it can trigger
// an event and sends data using axios

const axios = require("axios");
const vehicles = require("../configurazione/Veicoli");
const dbController = require("./sqlite3.controller");

const vehicleList = vehicles.vehicles;

function eventToGenerate() {
  const events = [
    "messageNewEmergency",
    "messageEndEmergency",
    "messageChangeCode",
    "messageChangeNumberOfVehicles",
    "messageEmergencyInStandBy",
  ];
  return events[Math.floor(Math.random() * events.length)];
}

async function generateNewEmergency() {
  // read all emergencies from database
  const emergencies = await dbController.getEmergencies();
  // add a new one
  emergencies.push(generateRandomEmergency());
  // send it!
  sendEmergencies(emergencies);
  console.log("generate new emergency");
}

async function generateEndEmergency() {
  // read all emergencies from database
  const emergencies = await dbController.getEmergencies();
  // remove an emergency
  const index = Math.floor(Math.random() * emergencies.length);
  emergencies.splice(index, 1);
  // send it!
  sendEmergencies(emergencies);
  console.log("generate end emergency");
}

async function generateChangeCode() {
  // read all emergencies from database
  const emergencies = await dbController.getEmergencies();
  // change a code
  const index = Math.floor(Math.random() * emergencies.length);
  emergencies[index].codex = generateRandomCodex();
  // send it!
  sendEmergencies(emergencies);
  console.log("generate change code");
}

async function generateChangeNumberOfVehicles() {
  // read all emergencies from database
  const emergencies = await dbController.getEmergencies();
  // change a code
  const index = Math.floor(Math.random() * emergencies.length);
  emergencies[index].manageVehicleForSynoptics =
    generateRandomVehicleAssegnation();
  // send it!
  sendEmergencies(emergencies);
  console.log("generate change number of vehicles");
}

function generateRandomVehicle() {
  return {
    vehicleCode: vehicleList[Math.floor(Math.random() * vehicleList.length)],
  };
}

function generateRandomCodex() {
  const codexList = ["KC19G", "KC19R", "KC02V", "KC19G"];
  return codexList[Math.floor(Math.random() * codexList.length)];
}

function generateRandomVehicleAssegnation() {
  const vehicleAssignments = [];
  const times = Math.floor(Math.random() * 3);

  for (let i = 0; i < times; i++) {
    vehicleAssignments.push(generateRandomVehicle());
  }

  return vehicleAssignments.length > 0 ? vehicleAssignments : null;
}

function makeRandomTime() {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  const seconds = Math.floor(Math.random() * 60);
  return `${hours}:${minutes}:${seconds}`;
}

// Function to generate a random emergency
function generateRandomEmergency() {
  return {
    address: "VIA RONCAGLIO, 21 Piano: R",
    emergencyId: Math.floor(Math.random() * 5),
    timeDelayed: makeRandomTime(),
    codex: generateRandomCodex(),
    district: "ZONA BLU 4 - BO LOC 2023 07",
    criticity: "G",
    localityMunicipality: "SAN LAZZARO DI MODENA - MODENA",
    eventCoord: {
      class: "it.eng.area118.dumpdp.model.LatLonDM",
      latD: 44,
      latM: 32.23339088586016,
      lonD: 11,
      lonM: 21.164510289911966,
    },
    manageVehicleForSynoptics: generateRandomVehicleAssegnation(),
  };
}

function generateEmergencies() {
  const emergencies = [];

  for (let i = 0; i < 4; i++) {
    emergencies.push(generateRandomEmergency());
  }
  return emergencies;
}

async function sendEmergencies(emergencies) {
  await axios
    .post("http://localhost:13000/data", {
      dati: JSON.stringify(emergencies),
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error("Error sending data:", error.message);
    });
}

function sendData() {
  const emergencies = generateEmergencies();
  console.log(emergencies);
  axios
    .post("http://localhost:13000/data", {
      dati: JSON.stringify(emergencies),
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error("Error sending data:", error.message);
    });
}

sendData();
