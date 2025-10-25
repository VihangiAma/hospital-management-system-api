import express from "express";
import { addMedicalHistory, getMedicalHistoryByPatient,getLatestMedicalHistory } from "../controllers/medicalHistoryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";


const router = express.Router();

// Add new medical history (Doctor/Admin only)
router.post("/", verifyToken, authorizeRoles("Admin", "Doctor"), addMedicalHistory);

// Get medical history by patient
router.get("/:patient_id", verifyToken, authorizeRoles("Admin", "Doctor"), getMedicalHistoryByPatient);
// Get latest medical history for a patient
router.get("/latest/:patient_id", verifyToken, authorizeRoles("Admin", "Doctor"), getLatestMedicalHistory);

export default router;
