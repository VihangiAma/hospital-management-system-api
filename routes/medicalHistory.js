import express from "express";
import { addMedicalHistory, getMedicalHistoryByPatient } from "../controllers/medicalHistoryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";


const router = express.Router();

// Add new medical history (Doctor/Admin only)
router.post("/", verifyToken, authorizeRoles("Admin", "Doctor"), addMedicalHistory);

// Get medical history by patient
router.get("/:patient_id", verifyToken, authorizeRoles("Admin", "Doctor"), getMedicalHistoryByPatient);

export default router;
