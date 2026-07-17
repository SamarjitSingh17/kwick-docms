import fs from "fs";
import path from "path";
import documentModel from "../models/document.js";
import productModel from "../models/product.js";
import auditLogModel from "../models/auditLog.js";

// Helper to delete local file
const deleteLocalFile = (fileUrl) => {
  if (!fileUrl) return;
  // fileUrl is like "uploads/17193234234-file.pdf"
  const fullPath = path.resolve(fileUrl);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error("Failed to delete file:", fileUrl, err);
      } else {
        console.log("Successfully deleted file:", fileUrl);
      }
    });
  }
};

// 1. Upload Document (Create)
// POST /api/documents
export const uploadDocument = async (req, res) => {
  try {
    const { productId, title, docType, version } = req.body;

    if (!productId || !title || !docType) {
      // If a file was uploaded by multer but details are missing, clean up the file
      if (req.file) {
        deleteLocalFile(req.file.path);
      }
      return res.status(400).json({ success: false, message: "Missing required document details" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a file" });
    }

    // Verify product exists
    const product = await productModel.findById(productId);
    if (!product) {
      deleteLocalFile(req.file.path);
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const fileFormat = path.extname(req.file.originalname).replace(".", "").toLowerCase();
    const fileSize = req.file.size;
    // Normalize path slashes to forward slashes for URLs
    const fileUrl = req.file.path.replace(/\\/g, "/");

    const newDoc = await documentModel.create({
      productId,
      title,
      docType,
      version: version || "1.0",
      fileUrl,
      fileFormat,
      fileSize,
      uploadedBy: req.user.id,
      isLatest: true,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document: newDoc,
    });
  } catch (error) {
    if (req.file) {
      deleteLocalFile(req.file.path);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Documents
// GET /api/documents
export const getDocuments = async (req, res) => {
  try {
    const { productId } = req.query;
    const filter = {};

    if (productId) {
      filter.productId = productId;
    }

    // Employee role only sees latest version by default
    if (req.user.role === "EMPLOYEE") {
      filter.isLatest = true;
    }

    const documents = await documentModel
      .find(filter)
      .populate("productId", "name category description")
      .populate("uploadedBy", "name email");

    return res.status(200).json({ success: true, documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update/Replace Document
// PUT /api/documents/:id
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, title, docType, version } = req.body;

    const document = await documentModel.findById(id);
    if (!document) {
      if (req.file) {
        deleteLocalFile(req.file.path);
      }
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Update text fields
    if (productId) {
      const product = await productModel.findById(productId);
      if (!product) {
        if (req.file) {
          deleteLocalFile(req.file.path);
        }
        return res.status(404).json({ success: false, message: "Selected product not found" });
      }
      document.productId = productId;
    }

    if (title) document.title = title;
    if (docType) document.docType = docType;
    if (version) document.version = version;

    // If new file is uploaded, replace the old file
    if (req.file) {
      const oldFileUrl = document.fileUrl;
      const fileFormat = path.extname(req.file.originalname).replace(".", "").toLowerCase();
      const fileSize = req.file.size;
      const fileUrl = req.file.path.replace(/\\/g, "/");

      document.fileUrl = fileUrl;
      document.fileFormat = fileFormat;
      document.fileSize = fileSize;

      // Delete the old physical file
      deleteLocalFile(oldFileUrl);
    }

    await document.save();

    return res.status(200).json({
      success: true,
      message: "Document updated successfully",
      document,
    });
  } catch (error) {
    if (req.file) {
      deleteLocalFile(req.file.path);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete Document
// DELETE /api/documents/:id
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await documentModel.findById(id);

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Delete the file from local storage
    deleteLocalFile(document.fileUrl);

    // Delete from database
    await documentModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. View Document File (Employee / Admin)
// GET /api/documents/:id/view
export const viewDocumentFile = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await documentModel.findById(id);

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Automatically create audit log if logged-in user is an employee
    if (req.user && req.user.role === "EMPLOYEE") {
      await auditLogModel.create({
        userId: req.user.id,
        documentId: document._id,
        action: "view",
      });
    }

    const filePath = path.resolve(document.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found on server" });
    }

    // Set content headers to show inline
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(document.title)}.${document.fileFormat}"`
    );

    let contentType = "application/octet-stream";
    if (document.fileFormat === "pdf") {
      contentType = "application/pdf";
    } else if (["png", "jpg", "jpeg", "gif"].includes(document.fileFormat)) {
      contentType = `image/${document.fileFormat === "jpg" ? "jpeg" : document.fileFormat}`;
    }

    res.setHeader("Content-Type", contentType);
    return res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Download Document File (Employee / Admin)
// GET /api/documents/:id/download
export const downloadDocumentFile = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await documentModel.findById(id);

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Automatically create audit log if logged-in user is an employee
    if (req.user && req.user.role === "EMPLOYEE") {
      await auditLogModel.create({
        userId: req.user.id,
        documentId: document._id,
        action: "download",
      });
    }

    const filePath = path.resolve(document.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found on server" });
    }

    // Set headers to force attachment download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(document.title)}.${document.fileFormat}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    return res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
