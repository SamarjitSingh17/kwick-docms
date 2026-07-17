import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userModel",
    required: true,
  },

  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "documentModel",
    required: true,
  },

  action: {
    type: String,
    enum: ["view", "download"],
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const auditLogModel = mongoose.model("auditLogModel", auditLogSchema);

export default auditLogModel;
