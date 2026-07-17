import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productModel",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    docType: {
      type: String,
      enum: ["brochure", "specification", "manual", "presentation", "other"],
    },

    version: {
      type: String,
      default: "1.0",
    },


    fileUrl: {
      type: String,
      required: true,
    },

   fileFormat: {
  type: String,               // e.g. "pdf", "pptx", "docx", "xlsx"
  required: true,
   },

   fileSize:{
    type:Number
   },


    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
    },

    isLatest: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const documentModel = mongoose.model(
  "documentModel",
  documentSchema,
  "documents",
);

export default documentModel;
