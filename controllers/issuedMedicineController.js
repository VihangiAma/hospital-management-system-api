import db from "../config/db.js";

// Issue medicine to patient
export const issueMedicine = async (req, res) => {
  try {
    const { patient_id, prescription_id, medicine_id, quantity, issued_by } = req.body;

    // Call stored procedure
    await db.query("CALL sp_issue_medicine(?, ?, ?, ?, ?)", [
      patient_id,
      prescription_id,
      medicine_id,
      quantity,
      issued_by
    ]);

    res.status(200).json({ message: "Medicine issued successfully" });
  } catch (err) {
    console.error("❌ Error issuing medicine:", err);
    res.status(500).json({ message: err.sqlMessage || "Server Error" });
  }
};


// Get all issued medicines
export const getIssuedMedicines = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT im.issue_id, im.issue_date, im.quantity, 
             m.name AS medicine_name, 
             p.first_name AS patient_name,
             im.prescription_id, u.username AS issued_by
      FROM issued_medicines im
      JOIN medicines m ON im.medicine_id = m.medicine_id
      JOIN patients p ON im.patient_id = p.patient_id
      JOIN users u ON im.issued_by = u.user_id
      ORDER BY im.issue_date DESC
    `);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};
