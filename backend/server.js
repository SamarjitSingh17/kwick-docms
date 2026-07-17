import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser"; // added cookie-parser
import connectDB from "./config/db.js";
import employeeRouter from "./routes/employeesRoutes.js";
import authRouter from "./routes/authRouter.js";
import productRouter from "./routes/productRoutes.js";
import documentRouter from "./routes/documentRoutes.js";
import auditLogRouter from "./routes/auditLogRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
connectDB();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5174",
  credentials: true,
}));
app.use(cookieParser()); // enable cookie parsing

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/employees", employeeRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/documents", documentRouter);
app.use("/api/audit-logs", auditLogRouter);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port http://localhost:${process.env.PORT || 5000}`);
});
