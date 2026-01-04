// H:\Brain_api\brain\server\index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const aiBrainRoutes = require("./routes/ai_brain.routes");
// const verificationRoutes = require("./routes/verification.routes");

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* Routes */
app.use("/api/brain", aiBrainRoutes);
// app.use("/api/brain", verificationRoutes); 


/* Test Route */
app.get("/", (req, res) => {
  res.send("🧠 Brain API is running");
});
 
/* Start Server */
const PORT = process.env.PORT || 5000;
 if (process.env.NODE_ENV === "development") {
  console.log("Mongo connected in dev mode");
} 


connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
});
