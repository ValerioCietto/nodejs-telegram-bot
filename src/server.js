const express = require("express");
const cors = require("cors");
const path = require("path");
const { handleEmergencyData } = require("./emergencyHandler");

const DatabaseController = require("./sqlite3.controller.js");
const dbController = new DatabaseController();

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(cors());
// Serve static files like HTML, JS, and CSS from the "public" directory
app.use(express.static(path.join(__dirname, "src/public")));

app.get("/", (req, res) => {
  res.send("API endpoints: /test, /data");
});

// Serve the subscriptions page at "/subscriptions-page"
app.get("/subscriptions-page", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "subscriptions.html"));
});

app.get("/test", (req, res) => {
  res.send("Service is active.");
});

app.post("/data", (req, res) => {
  const data = JSON.parse(req.body.dati);
  handleEmergencyData(data);
  res.send("Data received.");
});

// 1. Get all subscriptions
app.get("/subscriptions", async (req, res) => {
  try {
    const subscriptions = await dbController.getAllSubscriptions();
    res.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).send("Error fetching subscriptions.");
  }
});

// 2. Get subscriptions by chatId
app.get("/subscriptions/:chatId", async (req, res) => {
  const { chatId } = req.params;
  try {
    const subscriptions = await dbController.getSubscriptionsByChatId(chatId);
    if (subscriptions.length === 0) {
      return res.status(404).send("No subscriptions found for this chatId.");
    }
    res.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions for chatId:", error);
    res.status(500).send("Error fetching subscriptions.");
  }
});

// 3. Add a subscription (chatId and vehicleCode passed via request body)
app.post("/subscriptions", async (req, res) => {
  const { chatId, username, vehicleCode } = req.body;
  if (!chatId || !vehicleCode || !username) {
    return res.status(400).send("Missing chatId, username, or vehicleCode.");
  }

  try {
    await dbController.addSubscription(chatId, username, vehicleCode);
    res.status(201).send("Subscription added successfully.");
  } catch (error) {
    console.error("Error adding subscription:", error);
    res.status(500).send("Error adding subscription.");
  }
});

// 4. Delete a subscription by chatId and vehicleCode
app.delete("/subscriptions", async (req, res) => {
  const { chatId, vehicleCode } = req.body;
  if (!chatId || !vehicleCode) {
    return res.status(400).send("Missing chatId or vehicleCode.");
  }

  try {
    await dbController.removeSubscription(chatId, vehicleCode);
    res.status(200).send("Subscription deleted successfully.");
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).send("Error deleting subscription.");
  }
});

function startServer(port = 13000) {
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

module.exports = {
  startServer,
};
