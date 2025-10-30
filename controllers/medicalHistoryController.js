import db from "../config/db.js";

// Convert patient_code to patient_id
const getPatientIdFromCode = async (patient_code) => {
  const [rows] = await db.execute(
    "SELECT patient_id FROM patients WHERE patient_code = ?",
    [patient_code]
  );
  return rows.length ? rows[0].patient_id : null;
};

// ➕ ADD MEDICAL HISTORY (accepts patient_id or patient_code)
export const addMedicalHistory = async (req, res) => {
  const connection = await db.getConnection();
  try {
    let { patient_id, patient_code, visit_date, diagnosis, treatment, prescription, doctor_id } = req.body;

    // If code provided, convert to ID
    if (!patient_id && patient_code) {
      patient_id = await getPatientIdFromCode(patient_code);
    }

    if (!patient_id) {
      return res.status(400).json({ message: "Patient ID or Patient Code is required" });
    }

    if (!diagnosis || !treatment || !prescription || !doctor_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await connection.beginTransaction();

    await connection.execute(
      `CALL sp_add_medical_history(?, ?, ?, ?, ?, ?)`,
      [patient_id, visit_date || new Date(), diagnosis, treatment, prescription, doctor_id]
    );

    await connection.commit();

    res.status(201).json({ message: "Medical history saved successfully" });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  } finally {
    connection.release();
  }
};

// 📌 GET BY PATIENT ID
export const getMedicalHistoryByPatientId = async (req, res) => {
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

// 🔍 GET BY PATIENT CODE
export const getMedicalHistoryByPatientCode = async (req, res) => {
  try {
    const { patient_code } = req.params;

    const patient_id = await getPatientIdFromCode(patient_code);
    if (!patient_id) return res.status(404).json({ message: "Patient not found" });

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

// 🕘 GET LATEST BY ID
export const getLatestMedicalHistoryById = async (req, res) => {
  try {
    const { patient_id } = req.params;

    const [latest] = await db.execute(
      `SELECT * FROM latest_medical_history WHERE patient_id = ?`,
      [patient_id]
    );

    res.status(200).json(latest);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// 🕘 GET LATEST BY CODE
export const getLatestMedicalHistoryByCode = async (req, res) => {
  try {
    const { patient_code } = req.params;

    const patient_id = await getPatientIdFromCode(patient_code);
    if (!patient_id) return res.status(404).json({ message: "Patient not found" });

    const [latest] = await db.execute(
      `SELECT * FROM latest_medical_history WHERE patient_id = ?`,
      [patient_id]
    );

    res.status(200).json(latest);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};
