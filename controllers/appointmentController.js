import db from "../config/db.js";

// ✅ Get Available Time Slots for a Doctor on a Given Date
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctor_id, date } = req.query;

    if (!doctor_id || !date) {
      return res.status(400).json({ message: "doctor_id and date are required" });
    }

    const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

    const [availability] = await db.execute(
      `SELECT start_time, end_time 
       FROM doctor_availability
       WHERE doctor_id = ? AND day_of_week = ? AND status = 'Available'`,
      [doctor_id, dayName]
    );

    if (availability.length === 0) {
      return res.status(200).json({ availableSlots: [], message: "Doctor not available on this day" });
    }

    const { start_time, end_time } = availability[0];

    const slots = [];
    const start = new Date(`1970-01-01T${start_time}`);
    const end = new Date(`1970-01-01T${end_time}`);

    while (start < end) {
      slots.push(start.toTimeString().substring(0, 5));
      start.setMinutes(start.getMinutes() + 15);
    }

    const [booked] = await db.execute(
      `SELECT appointment_time FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ?`,
      [doctor_id, date]
    );

    const bookedSlots = booked.map(b => b.appointment_time.substring(0, 5));
    const availableSlots = slots.filter(s => !bookedSlots.includes(s));

    res.status(200).json({ availableSlots });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// ✅ Quick Check: Is Doctor Available at Given Date & Time?
export const checkDoctorAvailability = async (req, res) => {
  try {
    const { doctor_id, appointment_date, appointment_time } = req.body;

    if (!doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [existing] = await db.execute(
      `SELECT appointment_id FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?`,
      [doctor_id, appointment_date, appointment_time]
    );

    if (existing.length > 0) {
      return res.status(409).json({ available: false, message: "Doctor is NOT available at this time" });
    }

    res.status(200).json({ available: true, message: "Doctor is available" });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Book Appointment (Prevents Double Booking)
export const bookAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, department, appointment_date, appointment_time, notes } = req.body;

    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [exists] = await db.execute(
      `SELECT * FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?`,
      [doctor_id, appointment_date, appointment_time]
    );

    if (exists.length > 0) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    await db.execute(
      `INSERT INTO appointments (patient_id, doctor_id, department, appointment_date, appointment_time, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Scheduled')`,
      [patient_id, doctor_id, department, appointment_date, appointment_time, notes || null]
    );

    res.status(201).json({ message: "Appointment booked successfully" });

  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * Schedule appointment via stored procedure sp_schedule_appointment
 */
export const scheduleAppointment = async (req, res) => {
  try {
    const {
      appointment_code, // optional (trigger can generate)
      patient_id,
      doctor_id,
      department,
      appointment_date,
      appointment_time,
      notes
    } = req.body;

    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Use stored procedure
    await db.query("CALL sp_schedule_appointment(?,?,?,?,?,?,?)", [
      appointment_code || null,
      patient_id,
      doctor_id,
      department || null,
      appointment_date,
      appointment_time,
      notes || null
    ]);

    res.status(201).json({ message: "Appointment scheduled successfully" });
  } catch (err) {
    console.error("Error scheduling appointment:", err);
    res.status(500).json({ message: "Server error", error: err.message });
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
export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Make sure the column name matches your DB (likely `status`)
    const [result] = await db.execute(
      "UPDATE appointments SET status = ? WHERE appointment_id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment status updated successfully" });
  } catch (err) {
    console.error("Error updating appointment status:", err);
    res.status(500).json({ message: "Server error", error: err });
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


/**
 * Return upcoming appointments view (view_upcoming_appointments)
 */
export const getUpcomingAppointments = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM view_upcoming_appointments ORDER BY appointment_date, appointment_time");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching upcoming appointments:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};