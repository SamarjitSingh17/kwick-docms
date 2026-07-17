import express from "express";
import {
  uploadDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  viewDocumentFile,
  downloadDocumentFile,
} from "../controllers/documentController.js";
import auth from "../middlewares/auth.js";
import admin from "../middlewares/admin.js";
import { upload } from "../middlewares/upload.js";

const documentRouter = express.Router();

// Accessible by both admin and employees to fetch documents
documentRouter.get("/", auth, getDocuments);

// File viewing and downloading endpoints (both employee and admin can access, protected by auth)
documentRouter.get("/:id/view", auth, viewDocumentFile);
documentRouter.get("/:id/download", auth, downloadDocumentFile);

// Admin-only document management routes
documentRouter.post("/", auth, admin, upload, uploadDocument);
documentRouter.put("/:id", auth, admin, upload, updateDocument);
documentRouter.delete("/:id", auth, admin, deleteDocument);

export default documentRouter;
