import express from "express";
import { getAuditLogs } from "../controllers/auditLogController.js";
import auth from "../middlewares/auth.js";
import admin from "../middlewares/admin.js";

const auditLogRouter = express.Router();

// Only administrators can view audit logs
auditLogRouter.get("/", auth, admin, getAuditLogs);

export default auditLogRouter;
