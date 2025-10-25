import express from "express";
import {
  createBill,
  getAllBills,
  getBillById,
  recordPayment,
  createInsuranceClaim,
  getFinancialSummary,
  updateInsuranceClaimStatus,
  getAllInsuranceClaims,
    getFinancialReports
} from "../controllers/billingController.js";

const router = express.Router();

router.post("/", createBill);
router.get("/", getAllBills);
router.get("/:id", getBillById);
router.post("/payment", recordPayment);
router.post("/insurance", createInsuranceClaim);
router.get("/report/summary", getFinancialSummary);
router.get("/insurance/all", getAllInsuranceClaims);
router.put("/insurance/status", updateInsuranceClaimStatus);
router.get("/reports", getFinancialReports);


export default router;
