import express from "express";
import {
  addMedicalHistory,
  getMedicalHistoryByPatientId,
  getMedicalHistoryByPatientCode,
  getLatestMedicalHistoryById,
  getLatestMedicalHistoryByCode
} from "../controllers/medicalHistoryController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Add new medical history (Admin Only) – supports ID or Code
router.post("/", verifyToken, authorizeRoles("Admin"), addMedicalHistory);

// Get medical history by patient_id
router.get("/id/:patient_id", verifyToken, authorizeRoles("Admin"), getMedicalHistoryByPatientId);

// Get medical history by patient_code
router.get("/code/:patient_code", verifyToken, authorizeRoles("Admin"), getMedicalHistoryByPatientCode);

// Get latest history by ID
router.get("/latest/id/:patient_id", verifyToken, authorizeRoles("Admin"), getLatestMedicalHistoryById);

// Get latest history by Code
router.get("/latest/code/:patient_code", verifyToken, authorizeRoles("Admin"), getLatestMedicalHistoryByCode);

export default router;
