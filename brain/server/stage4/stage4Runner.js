// server/stage4/stage4Runner.js

const mongoose = require("mongoose");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const connectDB = require("../config/db");
const runStage4 = require("./index");

(async () => {
  try {
    await connectDB();
    console.log("🧠 Connected DB:", mongoose.connection.name);
    console.log("🟣 Stage-4 worker started");

    let isRunning = false;

    setInterval(async () => {
      if (isRunning) return;
      isRunning = true;

      try {
        await runStage4();
      } catch (err) {
        console.error("❌ Stage-4 error:", err.message);
      } finally {
        isRunning = false;
      }
    }, 2000);
  } catch (err) {
    console.error("❌ Stage-4 startup failed:", err);
    process.exit(1);
  }
})();
