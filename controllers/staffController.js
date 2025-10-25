import db from "../config/db.js";

// ➕ ADD STAFF (via stored procedure)
export const addStaff = async (req, res) => {
  const { staff_code, full_name, role, contact_number, email, shift, status } = req.body;

  try {
    await db.execute(
      "CALL sp_addStaff(?,?,?,?,?,?,?)",
      [staff_code, full_name, role, contact_number, email, shift, status || 'Active']
    );
    res.status(201).json({ message: "Staff added successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📋 GET ALL STAFF (with search & filter using raw query or views)
export const getAllStaff = async (req, res) => {
  const { search, role, status } = req.query;
  let query = "SELECT * FROM staff WHERE 1=1";
  const params = [];

  if (search) {
    query += " AND full_name LIKE ?";
    params.push(`%${search}%`);
  }
  if (role) {
    query += " AND role = ?";
    params.push(role);
  }
  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  try {
    const [rows] = await db.query(query, params);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔍 GET ACTIVE STAFF (using view)
export const getActiveStaff = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_active_staff");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔎 GET STAFF BY ID
export const getStaffById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM staff WHERE staff_id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Staff not found" });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ UPDATE STAFF (via stored procedure)
export const updateStaff = async (req, res) => {
  const { full_name, role, contact_number, email, shift, status } = req.body;
  const staff_id = req.params.id;

  try {
    await db.execute(
      "CALL sp_updateStaff(?,?,?,?,?,?,?)",
      [staff_id, full_name, role, contact_number, email, shift, status]
    );
    res.status(200).json({ message: "Staff updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ❌ DELETE STAFF (via stored procedure)
export const deleteStaff = async (req, res) => {
  const staff_id = req.params.id;
  try {
    await db.execute("CALL sp_deleteStaff(?)", [staff_id]);
    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📊 GET STAFF ROLE SUMMARY (using view)
export const getStaffRoleSummary = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_staff_role_summary");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
