import db from "../config/db.js";

// GET DASHBOARD ANALYTICS (Admin Only)
export const getDashboardAnalytics = async (req, res) => {
  try {
    // 1. User Count by Role
    const [userRoles] = await db.execute(
      `SELECT role, COUNT(*) AS count FROM users GROUP BY role`
    );
    const userRolesCount = {};
    userRoles.forEach(u => (userRolesCount[u.role] = u.count));

    // 2. Total Patients + Monthly Registration (Last 12 Months)
    const [totalPatients] = await db.execute(`SELECT COUNT(*) AS total FROM patients`);
    const [monthlyPatients] = await db.execute(`
      SELECT DATE_FORMAT(date_registered, '%b') AS month, COUNT(*) AS count
      FROM patients
      WHERE date_registered >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(date_registered), MONTH(date_registered)
      ORDER BY date_registered ASC
    `);

    // 3. Appointments Summary
    const [appointments] = await db.execute(`
      SELECT 
        SUM(status = 'Scheduled') AS scheduled,
        SUM(status = 'Completed') AS completed,
        SUM(status = 'Cancelled') AS cancelled
      FROM appointments
    `);

    // 4. Doctors Summary
    const [doctors] = await db.execute(`
      SELECT 
        COUNT(*) AS total,
        SUM(status = 'Available') AS available,
        SUM(status = 'On Leave') AS onLeave
      FROM doctors
    `);

    // 5. Medicine Stock Summary
    const [medicines] = await db.execute(`
      SELECT 
        COUNT(*) AS total,
        SUM(quantity_in_stock <= reorder_level) AS lowStock,
        SUM(expiry_date < CURDATE()) AS expired
      FROM medicines
    `);

    // 6. Billing & Revenue Summary
    const [billing] = await db.execute(`
      SELECT 
        COALESCE(SUM(total_amount), 0) AS totalRevenue,
        SUM(CASE WHEN status = 'Paid' THEN total_amount ELSE 0 END) AS paid,
        SUM(CASE WHEN status = 'Unpaid' THEN total_amount ELSE 0 END) AS unpaid
      FROM billing
    `);

    res.status(200).json({
      userRolesCount,
      patientsSummary: {
        totalPatients: totalPatients[0].total,
        monthlyRegistrations: monthlyPatients
      },
      appointmentsSummary: appointments[0],
      doctorsSummary: doctors[0],
      medicineStockSummary: medicines[0],
      billingSummary: billing[0]
    });

  } catch (err) {
    console.error("Dashboard Analytics Error:", err);
    res.status(500).json({ message: "Server Error", error: err });
  }
};
