import db from "../config/db.js";

// ➕ ADD NEW MEDICAL HISTORY USING STORED PROCEDURE
export const addMedicalHistory = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { patient_id, visit_date, diagnosis, treatment, prescription, doctor_id } = req.body;

    if (!patient_id || !diagnosis || !treatment || !prescription || !doctor_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await connection.beginTransaction();

    // Call the stored procedure
    const [result] = await connection.execute(
      `CALL sp_add_medical_history(?, ?, ?, ?, ?, ?)`,
      [patient_id, visit_date || new Date(), diagnosis, treatment, prescription, doctor_id]
    );

    await connection.commit();

    res.status(201).json({
      message: "Medical history added successfully via stored procedure",
      // The insertId is not always returned directly from CALL, 
      // you may fetch last insertId separately if needed
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error adding medical history:", err);
    res.status(500).json({ message: "Server error", error: err });
  } finally {
    connection.release();
  }
};

// 📋 GET MEDICAL HISTORY BY PATIENT (no change)
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

// ➕ NEW: Get latest medical history using view
export const getLatestMedicalHistory = async (req, res) => {
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
