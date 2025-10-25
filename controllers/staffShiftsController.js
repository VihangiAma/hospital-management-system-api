import db from "../config/db.js";

// ➕ Assign a shift to staff or doctor
export const assignShift = async (req, res) => {
  const { staff_id, doctor_id, shift_date, start_time, end_time, remarks } = req.body;

  if (!shift_date || !start_time || !end_time || (!staff_id && !doctor_id)) {
    return res.status(400).json({ message: "staff_id or doctor_id, shift_date, start_time, end_time are required" });
  }

  try {
    await db.execute(
      "CALL sp_assignShift(?,?,?,?,?,?)",
      [staff_id || null, doctor_id || null, shift_date, start_time, end_time, remarks || null]
    );
    res.status(201).json({ message: "Shift assigned successfully" });
  } catch (err) {
    res.status(500).json({ 
      message: err.message.includes('overlaps') ? err.message : "Error assigning shift", 
      error: err 
    });
  }
};

// 📋 Get shifts for a staff, doctor, or date
export const getShifts = async (req, res) => {
  const { staff_id, doctor_id, shift_date } = req.query;
  let query = `
    SELECT ds.*, 
           s.full_name AS staff_name, 
           d.full_name AS doctor_name
    FROM duty_shifts ds
    LEFT JOIN staff s ON ds.staff_id=s.staff_id
    LEFT JOIN doctors d ON ds.doctor_id=d.doctor_id
    WHERE 1=1`;
  const params = [];

  if (staff_id) { query += " AND ds.staff_id = ?"; params.push(staff_id); }
  if (doctor_id) { query += " AND ds.doctor_id = ?"; params.push(doctor_id); }
  if (shift_date) { query += " AND ds.shift_date = ?"; params.push(shift_date); }

  query += " ORDER BY ds.shift_date, ds.start_time";

  try {
    const [rows] = await db.execute(query, params);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching shifts", error: err });
  }
};

// ✏ Update a shift
export const updateShift = async (req, res) => {
  const { shift_id } = req.params;
  const { staff_id, doctor_id, shift_date, start_time, end_time, remarks } = req.body;

  if (!shift_id) return res.status(400).json({ message: "shift_id required" });

  try {
    const [result] = await db.execute(
      `UPDATE duty_shifts 
       SET staff_id=?, doctor_id=?, shift_date=?, start_time=?, end_time=?, remarks=? 
       WHERE shift_id=?`,
      [staff_id || null, doctor_id || null, shift_date, start_time, end_time, remarks || null, shift_id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Shift not found" });

    res.status(200).json({ message: "Shift updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating shift", error: err });
  }
};

// ❌ Delete a shift
export const deleteShift = async (req, res) => {
  const { shift_id } = req.params;
  try {
    const [result] = await db.execute("DELETE FROM duty_shifts WHERE shift_id = ?", [shift_id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Shift not found" });
    res.status(200).json({ message: "Shift deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting shift", error: err });
  }
};
