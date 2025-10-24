import db from "../config/db.js";

// ➕ Create Appointment
export const createAppointment = async (req, res) => {
  try {
    const { appointment_code, patient_id, doctor_id, department, appointment_date, appointment_time, notes } = req.body;

    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await db.execute(
      `INSERT INTO appointments (appointment_code, patient_id, doctor_id, department, appointment_date, appointment_time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [appointment_code, patient_id, doctor_id, department, appointment_date, appointment_time, notes]
    );

    res.status(201).json({ message: "Appointment created successfully" });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📋 Get all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT a.*, 
             CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
             p.contact_number,
             d.full_name AS doctor_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
      ORDER BY a.appointment_date DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Get appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(`
      SELECT a.*, 
             CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
             d.full_name AS doctor_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
      WHERE a.appointment_id = ?
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctor_id, department, appointment_date, appointment_time, status, notes } = req.body;

    await db.execute(
      `UPDATE appointments
       SET doctor_id=?, department=?, appointment_date=?, appointment_time=?, status=?, notes=?
       WHERE appointment_id=?`,
      [doctor_id, department, appointment_date, appointment_time, status, notes, id]
    );

    res.status(200).json({ message: "Appointment updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🗑 Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM appointments WHERE appointment_id = ?", [id]);
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
