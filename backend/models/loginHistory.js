import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      browser: {
        type: String, default: "unknown"},
      operatingSystem: {
        type: String, default: "unknown"},
      ipAddress: {
          type: String, default: "unknown"},
      deviceType: {
          type: String, default: "unknown"},
      location: {
          type: String, default: "unknown"},
      loginTime: {
        type: Date,
        default: Date.now,
      },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LoginHistory", loginHistorySchema);
      