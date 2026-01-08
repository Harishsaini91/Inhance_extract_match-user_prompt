// server/stage4/index.js
const stage4Worker = require("./stage4.worker");

async function runStage4() {
  try {
    await stage4Worker();
  } catch (err) {
    console.error("Stage-4 error:", err.message);
  }
}

module.exports = runStage4;
