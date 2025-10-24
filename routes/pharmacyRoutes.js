import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  addSupplier, getSuppliers, updateSupplier, deleteSupplier
} from "../controllers/supplierController.js";

import {
  addMedicine, getMedicines, updateMedicine, deleteMedicine
} from "../controllers/medicineController.js";

import { issueMedicine } from "../controllers/issuedMedicineController.js";

const router = express.Router();

// Supplier Routes (Pharmacist + Admin)
router.post("/suppliers", verifyToken, authorizeRoles("Pharmacist", "Admin"), addSupplier);
router.get("/suppliers", verifyToken, authorizeRoles("Pharmacist", "Admin"), getSuppliers);
router.put("/suppliers/:id", verifyToken, authorizeRoles("Pharmacist", "Admin"), updateSupplier);
router.delete("/suppliers/:id", verifyToken, authorizeRoles("Pharmacist", "Admin"), deleteSupplier);

// Medicine Routes (Pharmacist only)
router.post("/medicines", verifyToken, authorizeRoles("Pharmacist"), addMedicine);
router.get("/medicines", verifyToken, authorizeRoles("Pharmacist", "Admin"), getMedicines);
router.put("/medicines/:id", verifyToken, authorizeRoles("Pharmacist"), updateMedicine);
router.delete("/medicines/:id", verifyToken, authorizeRoles("Pharmacist"), deleteMedicine);

// Issue Medicine
router.post("/medicines/issue", verifyToken, authorizeRoles("Pharmacist"), issueMedicine);

export default router;
