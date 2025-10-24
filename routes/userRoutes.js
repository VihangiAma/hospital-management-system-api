import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/userController.js";


const router = express.Router();

router.get("/admin-only", verifyToken, authorizeRoles("Admin"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});

router.get("/pharmacy", verifyToken, authorizeRoles("Admin", "Pharmacist"), (req, res) => {
  res.json({ message: "Pharmacy Access Granted" });
});

router.get("/billing", verifyToken, authorizeRoles("Admin", "Accountant"), (req, res) => {
  res.json({ message: "Billing Access Granted" });
});

// All routes require authentication + Admin role
router.get("/", verifyToken, authorizeRoles("Admin"), getAllUsers);
router.get("/:id", verifyToken, authorizeRoles("Admin"), getUserById);
router.put("/:id", verifyToken, authorizeRoles("Admin"), updateUser);
router.delete("/:id", verifyToken, authorizeRoles("Admin"), deleteUser);


export default router;
