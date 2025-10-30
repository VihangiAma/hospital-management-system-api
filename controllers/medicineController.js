import db from "../config/db.js";

// Add Medicine
export const addMedicine = async (req, res) => {
  try {
    const { medicine_code, name, category, supplier_id, unit_price, quantity_in_stock, expiry_date, reorder_level, status } = req.body;
    if (!name || !supplier_id) return res.status(400).json({ message: "Name and supplier are required" });

    await db.execute(
      `INSERT INTO medicines (medicine_code, name, category, supplier_id, unit_price, quantity_in_stock, expiry_date, reorder_level, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [medicine_code, name, category, supplier_id, unit_price, quantity_in_stock, expiry_date, reorder_level, status || "Available"]
    );

    res.status(201).json({ message: "Medicine added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// Get Medicines
export const getMedicines = async (req, res) => {
  try {
    const [medicines] = await db.execute(`
      SELECT m.*, s.name as supplier_name 
      FROM medicines m 
      LEFT JOIN suppliers s ON m.supplier_id = s.supplier_id
    `);
    res.status(200).json(medicines);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// Update Medicine
export const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, supplier_id, unit_price, quantity_in_stock, expiry_date, reorder_level, status } = req.body;

    await db.execute(
      `UPDATE medicines SET name=?, category=?, supplier_id=?, unit_price=?, quantity_in_stock=?, expiry_date=?, reorder_level=?, status=? WHERE medicine_id=?`,
      [name, category, supplier_id, unit_price, quantity_in_stock, expiry_date, reorder_level, status, id]
    );

    res.status(200).json({ message: "Medicine updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// Delete Medicine
export const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM medicines WHERE medicine_id=?", [id]);
    res.status(200).json({ message: "Medicine deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};


// Get Low Stock / Expired Medicines

export const getLowStockAlerts = async (req, res) => {
  try {
    const [alerts] = await db.execute(`
      SELECT m.*, s.name AS supplier_name
      FROM medicines m
      LEFT JOIN suppliers s ON m.supplier_id = s.supplier_id
      WHERE m.status IN ('Out of Stock', 'Expired')
    `);

    if (alerts.length === 0) {
      return res.status(200).json({ message: "No low stock or expired medicines found", data: [] });
    }

    res.status(200).json({ message: "Low stock / expired medicines fetched successfully", data: alerts });
  } catch (err) {
    console.error("Error fetching low stock alerts:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

