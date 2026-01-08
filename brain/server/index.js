// H:\Brain_api\brain\server\index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const aiBrainRoutes = require("./routes/ai_brain.routes");
const adminRedFlag = require("./routes/adminRedFlag");
const syncEnhancerConfig = require("./config/syncEnhancerConfig");
const runStage4 = require("./stage4");

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* Routes */
app.use("/api/brain", aiBrainRoutes);
app.use("/admin", adminRedFlag);

/* Test Route */
app.get("/", (req, res) => {
  res.send("🧠 Brain API is running");
});
 
/* Start Server */
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === "development") {
  console.log("🔧 Running in development mode");
}

(async () => { 
  try { 
    // 1️⃣ Connect DB
    await connectDB();
    console.log("✅ MongoDB connected");



    // 2️⃣ Sync enhancer config from .env → DB
    await syncEnhancerConfig();


    // 3️⃣ START STAGE-4 WORKER LOOP (AUTO)
    let stage4Running = false;

    setInterval(async () => {
      if (stage4Running) return;
      stage4Running = true;

      try {
        await runStage4();
      } catch (err) {
        console.error("❌ Stage-4 error:", err.message);
      } finally {
        stage4Running = false;
      } 
    }, 3000); // ⏱ every 3 seconds
 
    console.log("🟣 Stage-4 worker started");

  

    // 4 Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
})();
