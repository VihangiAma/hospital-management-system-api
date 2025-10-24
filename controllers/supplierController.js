import db from "../config/db.js";

// Add Supplier
export const addSupplier = async (req, res) => {
  try {
    const { supplier_code, name, contact_person, phone, email, address, status } = req.body;
    if (!name || !supplier_code) {
      return res.status(400).json({ message: "Supplier code and name are required" });
    }

    await db.execute(
      "INSERT INTO suppliers (supplier_code, name, contact_person, phone, email, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [supplier_code, name, contact_person, phone, email, address, status || "Active"]
    );

    res.status(201).json({ message: "Supplier added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// Get All Suppliers
export const getSuppliers = async (req, res) => {
  try {
    const [suppliers] = await db.execute("SELECT * FROM suppliers");
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// Update Supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_person, phone, email, address, status } = req.body;

    await db.execute(
      "UPDATE suppliers SET name=?, contact_person=?, phone=?, email=?, address=?, status=? WHERE supplier_id=?",
      [name, contact_person, phone, email, address, status, id]
    );

    res.status(200).json({ message: "Supplier updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// Delete Supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM suppliers WHERE supplier_id=?", [id]);
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};
