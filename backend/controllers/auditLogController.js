import auditLogModel from "../models/auditLog.js";
import userModel from "../models/user.js";
import documentModel from "../models/document.js";
import productModel from "../models/product.js";

// GET /api/audit-logs
export const getAuditLogs = async (req, res) => {
  try {
    const { employeeId, productId, documentId, action, date, search } = req.query;

    const query = {};

    // 1. Action filter (view or download)
    if (action) {
      query.action = action;
    }

    // 2. Employee filter (by user ID)
    if (employeeId) {
      query.userId = employeeId;
    }

    // 3. Document filter (by document ID)
    if (documentId) {
      query.documentId = documentId;
    }

    // 4. Date filter
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.timestamp = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // 5. Search query (matches employee name OR document title)
    if (search) {
      const searchRegex = new RegExp(search, "i");

      // Find matching employees
      const matchingUsers = await userModel.find({
        name: { $regex: searchRegex },
        role: "EMPLOYEE",
      }).select("_id");
      const userIds = matchingUsers.map((u) => u._id);

      // Find matching documents
      const matchingDocs = await documentModel.find({
        title: { $regex: searchRegex },
      }).select("_id");
      const docIds = matchingDocs.map((d) => d._id);

      query.$or = [
        { userId: { $in: userIds } },
        { documentId: { $in: docIds } },
      ];
    }

    // 6. Product filter
    if (productId) {
      // Find all documents belonging to this product
      const productDocs = await documentModel.find({ productId }).select("_id");
      const productDocIds = productDocs.map((d) => d._id);

      // If filtering by document AND product, ensure document belongs to product
      if (query.documentId) {
        const docIdStr = query.documentId.toString();
        const belongsToProduct = productDocIds.some(
          (id) => id.toString() === docIdStr
        );
        if (!belongsToProduct) {
          // Document filter conflicts with product filter: return empty
          return res.status(200).json({ success: true, auditLogs: [] });
        }
      } else {
        query.documentId = { $in: productDocIds };
      }
    }

    // Execute query and populate
    const auditLogs = await auditLogModel
      .find(query)
      .populate("userId", "name email")
      .populate({
        path: "documentId",
        select: "title docType fileFormat fileSize productId",
        populate: {
          path: "productId",
          select: "name category",
        },
      })
      .sort({ timestamp: -1 });

    return res.status(200).json({ success: true, auditLogs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
