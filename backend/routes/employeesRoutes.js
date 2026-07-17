import express from "express";
const employeeRouter = express.Router();
import {
  createEmployees,
  getEmployees,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import admin from "../middlewares/admin.js";
import auth from "../middlewares/auth.js";
employeeRouter.get("/", auth, admin, getEmployees);
employeeRouter.post("/", auth, admin, createEmployees);
employeeRouter.put("/:id", auth, admin, updateEmployee);
employeeRouter.delete("/:id", auth, admin, deleteEmployee);

export default employeeRouter;
