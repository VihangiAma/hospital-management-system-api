import express from "express";
import {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorWeeklySchedule
} from "../controllers/doctorController.js";
import { verifyToken, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only Admin Can Add, Update, Delete Doctors
router.post("/", verifyToken, allowRoles("Admin"), addDoctor);
router.put("/:id", verifyToken, allowRoles("Admin"), updateDoctor);
router.delete("/:id", verifyToken, allowRoles("Admin"), deleteDoctor);

// All Roles Can View Doctors
router.get("/", verifyToken, allowRoles("Admin", "Pharmacist", "Accountant"), getDoctors);
router.get("/:id", verifyToken, allowRoles("Admin", "Pharmacist", "Accountant"), getDoctorById);
router.get("/schedule/weekly", verifyToken, allowRoles("Admin", "Pharmacist", "Accountant"), getDoctorWeeklySchedule);

export default router;
