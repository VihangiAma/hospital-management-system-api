import db from "../config/db.js";

// Issue medicine to patient
export const issueMedicine = async (req, res) => {
  try {
    const { patient_id, prescription_id, medicine_id, quantity, issued_by } = req.body;

    // Check stock
    const [med] = await db.execute("SELECT quantity_in_stock FROM medicines WHERE medicine_id=?", [medicine_id]);
    if (!med[0] || med[0].quantity_in_stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // Insert issued medicine
    await db.execute(
      `INSERT INTO issued_medicines (patient_id, prescription_id, medicine_id, quantity, issued_by)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, prescription_id, medicine_id, quantity, issued_by]
    );

    // Update stock
    await db.execute(
      "UPDATE medicines SET quantity_in_stock = quantity_in_stock - ? WHERE medicine_id=?",
      [quantity, medicine_id]
    );

    res.status(200).json({ message: "Medicine issued successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};
// Get all issued medicines
export const getIssuedMedicines = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT im.issue_id, im.issue_date, im.quantity, 
             m.name AS medicine_name, 
             p.name AS patient_name,
             im.prescription_id, u.username AS issued_by
      FROM issued_medicines im
      JOIN medicines m ON im.medicine_id = m.medicine_id
      JOIN patients p ON im.patient_id = p.patient_id
      JOIN users u ON im.issued_by = u.user_id
      ORDER BY im.issue_date DESC
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err });
  }
};

