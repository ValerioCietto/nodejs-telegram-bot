// start this module with
// node src/server.js
const express = require("express");
const cors = require("cors");

// this module contains server logic

class Server {
  // constructor
  dateTimeStart = null;
  dateTimeLastData = null;
  onEmergencyData = null;
  constructor(functionOnEmergencyData) {
    this.onEmergencyData = functionOnEmergencyData;
    this.app = express();
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ limit: "50mb" }));
    this.app.use(cors());
    this.app.get("/", (req, res) => {
      res.send("indirizzi disponibili /test e /data per l'invio di dati");
    });
    this.app.get("/test", (req, res) => {
      res.send(
        "Il servizio è attivo. Start time: " +
          this.dateTimeStart +
          ". Last data: " +
          this.dateTimeLastData
      );
    });

    this.app.post("/data", (req, res) => {
      console.log(req.body.dati);
      // parse json that was stringified
      const data = JSON.parse(req.body.dati);
      this.dateTimeLastData = new Date();
      onEmergencyData(data);
      res.send("ok");
    });
  }

  start() {
    this.app.listen(13000, () => {
      console.log("Server started on port 13000");
    });
    this.dateTimeStart = new Date();
  }

  handleEmergencyData(json) {
    // json is an array of Emergency objects
    json.forEach((emergency) => {
      if (emergency?.address !== undefined) {
        emergencies.push(emergency);
      }
    });
  }
}

function test() {
  const server = new Server();
  server.start();
}

test();

module.exports = Server;
