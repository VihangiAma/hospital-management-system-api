import db from "../config/db.js";

// 📌 Add Doctor
export const addDoctor = async (req, res) => {
  try {
    const { doctor_code, full_name, specialization, contact_number, email, department, working_hours } = req.body;

    if (!doctor_code || !full_name || !email) {
      return res.status(400).json({ message: "Doctor Code, Full Name & Email required" });
    }

    // Check duplicate doctor code or email
    const [exists] = await db.execute(
      "SELECT * FROM doctors WHERE doctor_code = ? OR email = ?",
      [doctor_code.trim(), email.trim()]
    );

    if (exists.length > 0) {
      return res.status(409).json({ message: "Doctor Code or Email already exists" });
    }

    const query = `
      INSERT INTO doctors (doctor_code, full_name, specialization, contact_number, email, department, working_hours, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Available')
    `;

    await db.execute(query, [
      doctor_code.trim(),
      full_name.trim(),
      specialization?.trim() || null,
      contact_number?.trim() || null,
      email.trim(),
      department?.trim() || null,
      working_hours?.trim() || null
    ]);

    res.status(201).json({ message: "Doctor added successfully" });

  } catch (err) {
    console.error("Add Doctor Error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// 📌 Get All Doctors
export const getDoctors = async (req, res) => {
  try {
    const [doctors] = await db.execute("SELECT * FROM doctors ORDER BY doctor_id DESC");
    res.status(200).json(doctors);
  } catch (err) {
    console.error("Get Doctors Error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// 📌 Get Single Doctor
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const [doctor] = await db.execute("SELECT * FROM doctors WHERE doctor_id = ?", [id]);

    if (doctor.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor[0]);
  } catch (err) {
    console.error("Get Doctor Error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// 📌 Update Doctor
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, specialization, contact_number, email, department, working_hours, status } = req.body;

    const query = `
      UPDATE doctors 
      SET full_name=?, specialization=?, contact_number=?, email=?, department=?, working_hours=?, status=?
      WHERE doctor_id=?
    `;

    await db.execute(query, [
      full_name?.trim(),
      specialization?.trim(),
      contact_number?.trim(),
      email?.trim(),
      department?.trim(),
      working_hours?.trim(),
      status,
      id
    ]);

    res.status(200).json({ message: "Doctor updated successfully" });
  } catch (err) {
    console.error("Update Doctor Error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// 📌 Delete Doctor
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM doctors WHERE doctor_id = ?", [id]);
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (err) {
    console.error("Delete Doctor Error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};
