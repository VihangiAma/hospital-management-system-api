import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  fileClaim,
  getAllClaims,
  updateClaimStatus,
} from "../controllers/insuranceController.js";

const router = express.Router();

router.post("/claims", verifyToken, authorizeRoles("Accountant"), fileClaim);
router.get("/claims", verifyToken, authorizeRoles("Accountant"), getAllClaims);
router.put("/claims/:id", verifyToken, authorizeRoles("Accountant"), updateClaimStatus);

export default router;
