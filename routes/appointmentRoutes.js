import express from "express";
import {
  getAvailableSlots,
 // bookAppointment,
  scheduleAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
  checkDoctorAvailability,
  getUpcomingAppointments
} from "../controllers/appointmentController.js";

const router = express.Router();

//  Check doctor availability for a specific date & time
router.post("/check-availability", checkDoctorAvailability);

//  Get available slots for doctor (e.g., drop-down for frontend)
router.get("/available-slots", getAvailableSlots);

//  Book appointment with double booking prevention
//router.post("/book", bookAppointment);

//  Create appointment (manual create - Admin/Reception)
router.post("/", scheduleAppointment);

//  Get all appointments
router.get("/", getAllAppointments);

//  Get single appointment by ID
router.get("/:id", getAppointmentById);

//  Update appointment
router.put("/:id", updateAppointmentStatus);

//  Delete appointment
router.delete("/:id", deleteAppointment);

//get upcoming appointments for a patient
router.get("/upcoming/:patient_id", getUpcomingAppointments);

export default router;
