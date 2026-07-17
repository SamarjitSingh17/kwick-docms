import express from "express";
const authRouter = express.Router();

import { changePassword, login, logout } from "../controllers/authController.js";
import auth from "../middlewares/auth.js";

authRouter.post("/login", login);
authRouter.post("/logout", logout);

export default authRouter;
