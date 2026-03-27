import mongoose from "mongoose";

const unlockSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paperID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paper",
    required: true,
  },
  coinSpent: { type: Number, required: true, min: 0 },
  unlockedAt: { type: Date, default: Date.now },
});

unlockSchema.index({ userID: 1, paperID: 1 }, { unique: true });

const Unlock = mongoose.models.Unlock || mongoose.model("Unlock", unlockSchema);

export default Unlock;