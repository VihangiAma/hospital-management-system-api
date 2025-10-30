import db from "../config/db.js";

// Daily Report
export const getDailyReport = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM daily_revenue_report");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching daily report", error: err });
  }
};

// Monthly Report
export const getMonthlyReport = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM monthly_revenue_report");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching monthly report", error: err });
  }
};
