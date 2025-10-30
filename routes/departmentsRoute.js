import express from "express";
import {
  addDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} from "../controllers/departments.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Routes (Admin Only)
router.post("/departments", verifyToken, authorizeRoles("Admin"), addDepartment);
router.get("/departments", verifyToken, authorizeRoles("Admin"), getDepartments);
router.get("/departments/:id", verifyToken, authorizeRoles("Admin"), getDepartmentById);
router.put("/departments/:id", verifyToken, authorizeRoles("Admin"), updateDepartment);
router.delete("/departments/:id", verifyToken, authorizeRoles("Admin"), deleteDepartment);

export default router;
