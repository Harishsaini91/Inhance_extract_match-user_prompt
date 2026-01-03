
// H:\Brain_api\brain\server\utils\moveStage.js
const MAX_RETRIES = 3;

async function moveStage({
  prevModel,
  nextModel,
  prevId,
  buildNextData,
}) {
  try {
    /* 1️⃣ Lock previous stage */
    const prevDoc = await prevModel.findOneAndUpdate(
      { _id: prevId, processing: false },
      { processing: true },
      { new: true }
    );

    if (!prevDoc) {
      throw new Error("Already processing or document not found");
    }

    /* 2️⃣ Retry guard */
    if (prevDoc.retryCount >= MAX_RETRIES) {
      throw new Error("Max retry limit reached");
    }

    /* 3️⃣ Business logic */
    const nextData = await buildNextData(prevDoc);

    /* 4️⃣ Create next stage FIRST */
    const nextDoc = await nextModel.create(nextData);

    /* 5️⃣ Delete previous stage */
    await prevModel.findByIdAndDelete(prevId);

    return {
      success: true,
      newId: nextDoc._id,
    };
  } catch (err) {
    /* ❗ Rollback via metadata only */
    await prevModel.findByIdAndUpdate(prevId, {
      $set: {
        processing: false,
        failedAt: new Date(),
      },
      $inc: {
        retryCount: 1,
      },
    });

    console.error("Stage transition failed (LOCAL):", err.message);

    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = moveStage;
