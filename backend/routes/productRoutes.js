import express from "express";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/productController.js";

import auth from "../middlewares/auth.js";
import admin from "../middlewares/admin.js"
const productRouter=express.Router();


productRouter.get("/",auth,getProducts);
productRouter.post("/",auth,admin,createProduct);
productRouter.put("/:id",auth,admin,updateProduct);
productRouter.delete("/:id",auth,admin,deleteProduct);

export default productRouter;