import db from "../config/db.js";

// ADD NEW MEDICAL HISTORY
export const addMedicalHistory = async (req, res) => {
  try {
    const { patient_id, visit_date, diagnosis, treatment, prescription, doctor_id } = req.body;

    if (!patient_id || !diagnosis || !treatment || !prescription || !doctor_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [result] = await db.execute(
      `INSERT INTO medical_history (patient_id, visit_date, diagnosis, treatment, prescription, doctor_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, visit_date || new Date(), diagnosis, treatment, prescription, doctor_id]
    );

    res.status(201).json({
      message: "Medical history added successfully",
      history_id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// GET MEDICAL HISTORY BY PATIENT
export const getMedicalHistoryByPatient = async (req, res) => {
  try {
    const { patient_id } = req.params;

    const [history] = await db.execute(
      `SELECT mh.*, d.full_name AS doctor_name 
       FROM medical_history mh
       JOIN doctors d ON mh.doctor_id = d.doctor_id
       WHERE mh.patient_id = ?`,
      [patient_id]
    );

    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};
