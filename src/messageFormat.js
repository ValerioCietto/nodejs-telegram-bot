// format messages to send to Telegram Bot
const { decodeCode } = require("./decodeUrgency");

function messageNewEmergency(emergency) {
  let emergencyString = "";
  // example
  // 🚑ALERT! EMERGENZA N° 021815 alle 12:29 IN CORSO
  // SC01V località OZZANO DELL'EMILIA CAPOLUOGO - OZZANO DELL'EMILIA PARCO DELLA RESISTENZA PARCO DELLA RESISTENZA
  // Il mezzo assegnato all'intervento è la macchina MONTERENZIO41 in STRADA con patologia TRAuMATICA codice VERDE
  // link a openstreetmap
  const vehiclesCodes = [];
  emergency.manageVehicleForSynoptics.forEach((vehicle) => {
    vehiclesCodes.push(vehicle.vehicleCode);
  });
  const vehiclesFromEmergency = vehiclesCodes.join(", ");
  const decodedCodex = decodeCode(emergency.codex);

  emergencyString =
    `🚑ALERT! EMERGENZA N° ${emergency.emergencyId} alle ${emergency.timeDelayed} IN CORSO ` +
    `\n ${emergency.localityMunicipality} ${emergency.address} \n Il mezzo assegnato all'intervento è la macchina ${vehiclesFromEmergency} ` +
    `in ${decodedCodex.place} con patologia ${decodedCodex.patology} codice ${decodedCodex.urgency} \n link a openstreetmap `;
  console.log("new emergency");
  return emergencyString;
}

function messageEndEmergency(emergency) {
  // example
  // EMERGENZA N° 021717 -> KC03R - Mezzo MONTERENZIO41 si è liberato alle 11:30, codice VERDE, luogo OZZANO DELL'EMILIA
  let emergencyString = "";
  const vehiclesCodes = [];
  emergency.manageVehicleForSynoptics.forEach((vehicle) => {
    vehiclesCodes.push(vehicle.vehicleCode);
  });
  const vehiclesFromEmergency = vehiclesCodes.join(", ");
  const decodedCodex = decodeCode(emergency.codex);
  if (manageVehicleForSynoptics.length > 1) {
    emergencyString =
      `EMERGENZA N° ${emergency.emergencyId} → ${emergency.codex}` +
      `Mezzi ${vehiclesFromEmergency} si sono liberati alle ${emergency.timeDelayed}, ` +
      `codice ${decodedCodex.urgency}, ` +
      `luogo ${emergency.localityMunicipality}`;
  } else {
    emergencyString =
      `EMERGENZA N° ${emergency.emergencyId} → ${emergency.codex}` +
      ` Mezzo ${vehiclesFromEmergency} si è liberato alle ${emergency.timeDelayed}, ` +
      `codice ${decodedCodex.urgency},  ` +
      `luogo ${emergency.localityMunicipality}`;
  }
  return emergencyString;
}

function messageChangeCode(emergencies, oldUrgency, newUrgency) {
  // example
  // 🚑ALERT! EMERGENZA N° 021815 ha cambiato codice colore gravità da VERDE a GIALLO alle ore 12:38
  let emergencyString = "";

  emergencyString = `🚑ALERT! EMERGENZA N° ${emergency.emergencyId} ha cambiato codice colore gravità da ${oldUrgency} a ${newUrgency} alle ${emergency.timeDelayed}`;
  return emergencyString;
}

function messageChangeNumberOfVehicles(oldEmergency, newEmergency) {
  // example
  // 🚑ALERT! EMERGENZA N° 021815 ha cambiato numero di veicoli, da MONTERENZIO41
  // a MONTERENZIO41,MONTERENZIO42
  let emergencyString = "";

  const previousVehicles = [];
  oldEmergency.manageVehicleForSynoptics.forEach((vehicle) => {
    previousVehicles.push(vehicle.vehicleCode);
  });
  const previousVehiclesFromEmergency = previousVehicles.join(", ");

  const newVehicles = [];
  newEmergency.manageVehicleForSynoptics.forEach((vehicle) => {
    newVehicles.push(vehicle.vehicleCode);
  });
  const newVehiclesFromEmergency = newVehicles.join(", ");

  emergencyString = `🚑ALERT! EMERGENZA N° ${emergency.emergencyId} ha cambiato numero di veicoli, da ${previousVehiclesFromEmergency} a ${newVehiclesFromEmergency}`;

  return emergencyString;
}

function messageEmergencyInStandBy() {
  // 🚑ALERT! EMERGENZA N° 021815 in standby nel comune di SAN VITALE - BOLOGNA
  // iniziata alle 21:49:26
  let emergencyString = "";
  emergencyString = `🚑ALERT! EMERGENZA N° ${emergency.emergencyId} in standby nel comune di ${emergency.localityMunicipality} iniziata alle ${emergency.timeDelayed}`;
  return emergencyString;
}

module.exports = {
  messageNewEmergency,
  messageEndEmergency,
  messageChangeCode,
  messageChangeNumberOfVehicles,
  messageEmergencyInStandBy,
};
