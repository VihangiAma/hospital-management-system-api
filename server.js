import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import db from "./config/db.js";
import testRoutes from "./routes/testRoutes.js";

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
