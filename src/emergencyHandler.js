const dbController = require("./sqlite3.controller");
const {
  sendMessageNewEmergency,
  sendMessageEndEmergency,
  sendMessageChangeCode,
  sendMessageChangeNumberOfVehicles,
} = require("./bot");

function handleEmergencyData(emergencyData) {
  const parsedEmergencies = parseJSONEmergencies(emergencyData);
  if (parsedEmergencies.length === 0) return;

  const currentEmergencies = dbController.getEmergencies();
  processNewEmergencies(parsedEmergencies, currentEmergencies);
  processEndedEmergencies(currentEmergencies);
}

function parseJSONEmergencies(json) {
  return json.filter((emergency) => emergency?.emergencyId !== undefined);
}

function processNewEmergencies(emergencyData, currentEmergencies) {
  const newEmergencies = [];
  emergencyData.forEach((emergency) => {
    const isNew = dbController.addEmergency(
      emergency.emergencyId,
      makeVehicleString(emergency.manageVehicleForSynoptics),
      emergency.codex,
      emergency.timeDelayed,
      emergency.localityMunicipality,
      JSON.stringify(emergency)
    );
    if (isNew) {
      newEmergencies.push(emergency);
      notifySubscribers(emergency);
    }
  });
}

function notifySubscribers(emergency) {
  if (!emergency.manageVehicleForSynoptics) return;

  emergency.manageVehicleForSynoptics.forEach((vehicle) => {
    const subscribers = dbController.getSubscribers(vehicle.vehicleCode);
    subscribers.forEach((subscriber) => {
      sendMessageNewEmergency(emergency, subscriber.chatId);
    });
  });
}

function processEndedEmergencies(currentEmergencies) {
  currentEmergencies.forEach((emergency) => {
    if (!dbController.getIfEmergencyExists(emergency.emergencyId)) {
      notifyEndOfEmergency(emergency);
      dbController.deleteEmergency(emergency.emergencyId);
    }
  });
}

function notifyEndOfEmergency(emergency) {
  const subscribers = dbController.getSubscribers(emergency.emergencyId);
  subscribers.forEach((subscriber) => {
    sendMessageEndEmergency(emergency, subscriber.chatId);
  });
}

function makeVehicleString(manageVehicleForSynoptics) {
  return manageVehicleForSynoptics
    ?.map((vehicle) => vehicle.vehicleCode)
    .join(", ");
}

module.exports = {
  handleEmergencyData,
};
