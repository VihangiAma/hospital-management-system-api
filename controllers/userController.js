import db from "../config/db.js";

// ✅ Get All Users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT user_id, username, full_name, email, role, created_at FROM users"
    );
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// ✅ Get Single User by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await db.execute(
      "SELECT user_id, username, full_name, email, role, created_at FROM users WHERE user_id = ?",
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User Not Found" });
    }

    res.status(200).json({ user: user[0] });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// ✅ Update User (Admin only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role } = req.body;

    const [result] = await db.execute(
      "UPDATE users SET full_name = ?, email = ?, role = ? WHERE user_id = ?",
      [full_name, email, role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User Not Found" });
    }

    res.status(200).json({ message: "User Updated Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// ✅ Delete User (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "DELETE FROM users WHERE user_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User Not Found" });
    }

    res.status(200).json({ message: "User Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};
