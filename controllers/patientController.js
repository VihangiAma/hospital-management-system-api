import db from "../config/db.js";

// ➕ Add patient
export const addPatient = async (req, res) => {
  try {
    const { patient_code, first_name, last_name, gender, age, contact_number, address, email } = req.body;

    if (!first_name || !last_name || !gender || !contact_number) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `
      INSERT INTO patients (patient_code, first_name, last_name, gender, age, contact_number, address, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      patient_code, first_name, last_name, gender, age, contact_number, address, email
    ]);

    res.status(201).json({ message: "Patient added successfully" });
  } catch (error) {
    console.error("Add patient error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📋 Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const [patients] = await db.query("SELECT * FROM patients ORDER BY date_registered DESC");
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM patients WHERE patient_id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ Update patient
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, gender, age, contact_number, address, email, status } = req.body;

    const sql = `
      UPDATE patients 
      SET first_name=?, last_name=?, gender=?, age=?, contact_number=?, address=?, email=?, status=?
      WHERE patient_id=?
    `;

    const [result] = await db.query(sql, [
      first_name, last_name, gender, age, contact_number, address, email, status, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ message: "Patient updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if patient exists
    const [patient] = await db.execute("SELECT * FROM patients WHERE patient_id = ?", [id]);
    if (patient.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Delete patient record
    await db.execute("DELETE FROM patients WHERE patient_id = ?", [id]);
    res.status(200).json({ message: "Patient deleted successfully" });

  } catch (err) {
    console.error("❌ Error deleting patient:", err);
    res.status(500).json({ message: "Error deleting patient", error: err.message });
  }
};