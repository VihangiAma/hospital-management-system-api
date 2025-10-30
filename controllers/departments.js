import db from "../config/db.js";

// ➕ Add new department
export const addDepartment = async (req, res) => {
  try {
    const { department_code, name, description, head_doctor_id, status } = req.body;

    await db.execute(
      "INSERT INTO departments (department_code, name, description, head_doctor_id, status) VALUES (?, ?, ?, ?, ?)",
      [department_code, name, description, head_doctor_id || null, status || "Active"]
    );

    res.status(201).json({ message: "Department added successfully" });
  } catch (err) {
    console.error("Add Department Error:", err);
    res.status(500).json({ message: "Error adding department", error: err });
  }
};

// 📋 Get all departments
export const getDepartments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT d.*, doc.full_name AS head_doctor_name 
      FROM departments d 
      LEFT JOIN doctors doc ON d.head_doctor_id = doc.doctor_id
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch Departments Error:", err);
    res.status(500).json({ message: "Error fetching departments", error: err });
  }
};

// 📄 Get single department
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM departments WHERE department_id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Department not found" });
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Get Department Error:", err);
    res.status(500).json({ message: "Error fetching department", error: err });
  }
};

// ✏️ Update department
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { department_code, name, description, head_doctor_id, status } = req.body;

    await db.execute(
      "UPDATE departments SET department_code=?, name=?, description=?, head_doctor_id=?, status=? WHERE department_id=?",
      [department_code, name, description, head_doctor_id || null, status, id]
    );

    res.status(200).json({ message: "Department updated successfully" });
  } catch (err) {
    console.error("Update Department Error:", err);
    res.status(500).json({ message: "Error updating department", error: err });
  }
};

// 🗑️ Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM departments WHERE department_id=?", [id]);
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (err) {
    console.error("Delete Department Error:", err);
    res.status(500).json({ message: "Error deleting department", error: err });
  }
};
