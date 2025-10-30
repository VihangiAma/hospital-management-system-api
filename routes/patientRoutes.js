import express from "express";
import {
  addPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientSummary
} from "../controllers/patientController.js";

const router = express.Router();

// Add new patient
router.post("/", addPatient);
// Get all patients
router.get("/", getAllPatients);
// Get patient by ID
router.get("/:id", getPatientById);
// Update patient by ID
router.put("/:id", updatePatient);
// Delete patient by ID
router.delete("/:id", deletePatient);
// Get patient summary
router.get("/summary", getPatientSummary);

export default router;
