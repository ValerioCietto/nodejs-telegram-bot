// launch with node src/emergenciesGenerator.js
// this script generates a random list of emergencies
// then add or remove one or two from the list
// then send data using axios

const axios = require("axios");
const vehicles = require("./vehicles");

const vehicleList = vehicles.vehicles;

function generateRandomVehicle() {
  return {
    vehicleCode: vehicleList[Math.floor(Math.random() * vehicleList.length)],
  };
}

function generateRandomCodex() {
  const codexList = ["KC19G", "KC19H", "KC19I", "KC19J"];
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

// Function to generate a random emergency
function generateRandomEmergency() {
  return {
    address: "VIA RONCAGLIO, 21 Piano: R",
    emergencyId: Math.floor(Math.random() * 5),
    timeDelayed: Math.floor(Math.random() * 24),
    localityMunicipality: "BOLOC",
    codex: generateRandomCodex(),
    district: "ZONA BLU 4 - BO LOC 2023 07",
    criticity: "G",
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
