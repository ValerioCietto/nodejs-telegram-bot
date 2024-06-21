const places = {
  S: "Strada",
  P: "Eserc. Pubblici",
  Y: "Imp. Sportivi",
  K: "Casa",
  L: "Lavoro",
  Q: "Scuole",
  T: "Non definito",
  Z: "Altri luoghi",
};

const pathologies = {
  C01: "Traumatica",
  C02: "Cardiocircolatoria",
  C03: "Respiratoria",
  C04: "Neurologica",
  C05: "Psichiatrica",
  C06: "Neoplastica",
  C07: "Tossicologica",
  C08: "Metabolica",
  C09: "Gastroenterologica",
  C10: "Urologica",
  C11: "Oculistica",
  C12: "Otorinolaringoiatria",
  C13: "Dermatologica",
  C14: "Ostetrico - Ginecologica",
  C15: "Infettiva",
  C19: "Altra Patologia",
  C20: "Patologia non identificata",
  "IU*": "Non definito",
};

const urgencies = {
  V: "Verde",
  G: "Giallo",
  R: "Rosso base",
  A: "Rosso avanzato",
};

function encodeCode(place, pathology, urgency) {
  const placeCode = Object.keys(places).find((key) => places[key] === place);
  const pathologyCode = Object.keys(pathologies).find(
    (key) => pathologies[key] === pathology
  );
  const urgencyCode = Object.keys(urgencies).find(
    (key) => urgencies[key] === urgency
  );

  if (!placeCode || !pathologyCode || !urgencyCode) {
    return "Invalid code provided.";
  }

  return `${placeCode}${pathologyCode}${urgencyCode}`;
}

/**
 * Decodes a given code into its corresponding place, pathology, and urgency.
 *
 * @param {string} code - The code to be decoded.
 * @return {Object|string} An object containing the place, pathology, and urgency if the code is valid.
 *                          Otherwise, a string indicating that an invalid code was provided.
 */
function decodeCode(code) {
  const placeCode = code[0];
  const urgencyCode = code[code.length - 1];
  const pathologyCode = code.substring(1, code.length - 1);

  const place = places[placeCode];
  const pathology = pathologies[pathologyCode];
  const urgency = urgencies[urgencyCode];

  if (!place || !pathology || !urgency) {
    return "Invalid code provided.";
  }

  return {
    place,
    pathology,
    urgency,
  };
}

module.exports.decodeCode = decodeCode;
module.exports.encodeCode = encodeCode;
