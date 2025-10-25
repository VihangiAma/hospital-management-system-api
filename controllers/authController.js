import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { username, full_name, email, password, role } = req.body;

    if (!username || !full_name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    // Check if user exists by username or email
    const [existingUser] = await db.execute(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [trimmedUsername, trimmedEmail]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      `INSERT INTO users (username, password, full_name, email, role) 
       VALUES (?, ?, ?, ?, ?)`,

      [trimmedUsername, hashedPassword, full_name.trim(), trimmedEmail, role]
    );

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and Password are required" });
    }

    const [user] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username.trim()]
    );

    if (user.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (!process.env.JWT_SECRET) {
      console.warn("⚠️ Missing JWT_SECRET in .env file");
    }

    const token = jwt.sign(
      { user_id: user[0].user_id, role: user[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        user_id: user[0].user_id,
        username: user[0].username,
        email: user[0].email,
        full_name: user[0].full_name,
        role: user[0].role,
      },
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server Error", error: err });
  }
};
