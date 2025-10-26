import express from "express";
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
} from "../controllers/purchaseOrderController.js";

const router = express.Router();

// 🧾 Create a new purchase order
router.post("/", createPurchaseOrder);

// 📋 Get all purchase orders
router.get("/", getPurchaseOrders);

// 🔍 Get purchase order by ID (with items)
router.get("/:id", getPurchaseOrderById);

// 🔄 Update purchase order status
router.put("/:id/status", updatePurchaseOrderStatus);

// ❌ Delete purchase order
router.delete("/:id", deletePurchaseOrder);

export default router;
