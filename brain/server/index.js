// H:\Brain_api\brain\server\index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const aiBrainRoutes = require("./routes/ai_brain.routes");
const adminRedFlag = require("./routes/adminRedFlag");
const syncEnhancerConfig = require("./config/syncEnhancerConfig");

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

    // 3️⃣ Start server
    app.listen(PORT, () => {  
      console.log(`🚀 Server running on port ${PORT}`); 
    }); 
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
})(); 
        