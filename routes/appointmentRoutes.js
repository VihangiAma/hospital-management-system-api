import express from "express";
import {
  getAvailableSlots,
  bookAppointment,
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
  checkDoctorAvailability
} from "../controllers/appointmentController.js";

const router = express.Router();

//  Check doctor availability for a specific date & time
router.post("/check-availability", checkDoctorAvailability);

//  Get available slots for doctor (e.g., drop-down for frontend)
router.get("/available-slots", getAvailableSlots);

//  Book appointment with double booking prevention
router.post("/book", bookAppointment);

//  Create appointment (manual create - Admin/Reception)
router.post("/", createAppointment);

//  Get all appointments
router.get("/", getAllAppointments);

//  Get single appointment by ID
router.get("/:id", getAppointmentById);

//  Update appointment
router.put("/:id", updateAppointmentStatus);

//  Delete appointment
router.delete("/:id", deleteAppointment);

export default router;
