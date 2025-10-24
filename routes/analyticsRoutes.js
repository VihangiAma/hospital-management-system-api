import express from "express";
import { getDashboardAnalytics } from "../controllers/analyticasController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Only Admin can access dashboard analytics
router.get("/dashboard", verifyToken, authorizeRoles("Admin"), getDashboardAnalytics);

export default router;
