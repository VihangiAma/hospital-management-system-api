import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import db from "./config/db.js";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import medicalHistoryRoutes from "./routes/medicalHistory.js";
import userRoutes from "./routes/userRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import pharmacyRoutes from "./routes/pharmacyRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple route for testing
app.get("/", (req, res) => {
  res.send("Hospital Management Backend Running...");
});

// Import routes (later)
// import billRoutes from "./src/routes/billRoutes.js";
// app.use("/api/bills", billRoutes);
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medical-history", medicalHistoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/pharmacy", pharmacyRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
