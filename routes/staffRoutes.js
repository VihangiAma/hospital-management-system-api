import express from "express";
import { addStaff, getAllStaff, getStaffById, updateStaff, deleteStaff,getActiveStaff,
  getStaffRoleSummary, } from "../controllers/staffController.js";

const router = express.Router();

router.post("/", addStaff);
router.get("/", getAllStaff);
router.get("/:id", getStaffById);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);
// 🔍 Get Active Staff (view)
router.get("/active/list", getActiveStaff);

// 📊 Get Staff Role Summary (view)
router.get("/summary/roles", getStaffRoleSummary);

export default router;
