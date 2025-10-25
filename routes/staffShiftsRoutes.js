import express from "express";
import {
  assignShift,
  getShifts,
  updateShift,
  deleteShift
} from "../controllers/staffShiftsController.js";

const router = express.Router();

// ➕ Assign a shift
router.post("/assign", assignShift);

// 📋 Get shifts (with filters)
router.get("/", getShifts);

// ✏ Update a shift
router.put("/update/:shift_id", updateShift);

// ❌ Delete a shift
router.delete("/delete/:shift_id", deleteShift);

export default router;
