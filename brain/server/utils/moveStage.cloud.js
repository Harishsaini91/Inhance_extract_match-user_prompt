const mongoose = require("mongoose");

const MAX_RETRIES = 3;

async function moveStage({
  prevModel,
  nextModel,
  prevId,
  buildNextData,
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /* 1️⃣ Lock previous stage */
    const prevDoc = await prevModel.findOneAndUpdate(
      { _id: prevId, processing: false },
      { processing: true },
      { new: true, session }
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

    /* 4️⃣ Create next stage */
    const nextDoc = await nextModel.create([nextData], { session });

    /* 5️⃣ Delete previous stage */
    await prevModel.findByIdAndDelete(prevId, { session });

    /* 6️⃣ Commit */
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      newId: nextDoc[0]._id,
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    await prevModel.findByIdAndUpdate(prevId, {
      $set: {
        processing: false,
        failedAt: new Date(),
      },
      $inc: {
        retryCount: 1,
      },
    });

    console.error("Stage transition failed (CLOUD):", err.message);

    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = moveStage;
