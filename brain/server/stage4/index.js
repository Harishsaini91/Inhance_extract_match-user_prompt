// server/stage4/index.js

const stage4Worker = require("./stage4.worker");

async function runStage4() {
  await stage4Worker();
}

module.exports = runStage4;
