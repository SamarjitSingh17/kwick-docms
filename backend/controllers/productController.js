// CRUD opr of product for admin

import productModel from "../models/product.js";

// read opr for employee

/*
name
category
description
createdBy
 */

const createProduct = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    if (!name || !category) {
        return res.status(400).json({ success: false, message: "Missing Details" });
    }
    const createdBy = req.user.id;
    const product = await productModel.create({
      name: name,
      category: category,
      description: description,
      createdBy: createdBy,
    });
    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await productModel.find();
    return res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const { id } = req.params;
      const product = await productModel.findByIdAndUpdate(id, { name, category, description }, { new: true });
    res.json({ success: true, message: "Product Updated Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {

    const { id } = req.params;
      const product = await productModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Product deleted Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {createProduct,getProducts,updateProduct,deleteProduct};
