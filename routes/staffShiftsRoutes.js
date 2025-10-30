import express from "express";
import {
  assignShift,
  getShifts,
  updateShift,
  deleteShift,
  getShiftCount
} from "../controllers/staffShiftsController.js";

const router = express.Router();

/// ➕ Assign new shift
router.post("/", assignShift);

// 📋 Get all or filtered shifts
router.get("/", getShifts);

// ✏ Update a shift
router.put("/:shift_id", updateShift);

// ❌ Delete a shift
router.delete("/:shift_id", deleteShift);

// 📊 Get shift count
router.get("/count", getShiftCount);

export default router;
