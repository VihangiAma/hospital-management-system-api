import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  generateBill,
  getAllBills,
  getBillById,
  submitInsuranceClaim,
} from "../controllers/billingController.js";
import {
  recordPayment,
  getPaymentsByBill,
} from "../controllers/paymentController.js";
import {
  getDailyReport,
  getMonthlyReport,
} from "../controllers/reportController.js";

const router = express.Router();

// Billing
router.post("/", verifyToken, authorizeRoles("Accountant"), generateBill);
router.get("/", verifyToken, authorizeRoles("Accountant"), getAllBills);
router.get("/:id", verifyToken, authorizeRoles("Accountant"), getBillById);

// Insurance Claims
router.post("/insurance", verifyToken, authorizeRoles("Accountant"), submitInsuranceClaim);

// Payments
router.post("/payments", verifyToken, authorizeRoles("Accountant"), recordPayment);
router.get("/payments/:bill_id", verifyToken, authorizeRoles("Accountant"), getPaymentsByBill);

// Reports
router.get("/reports/daily", verifyToken, authorizeRoles("Accountant", "Admin"), getDailyReport);
router.get("/reports/monthly", verifyToken, authorizeRoles("Accountant", "Admin"), getMonthlyReport);

export default router;
