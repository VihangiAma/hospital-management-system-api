import db from "../config/db.js";

/**
 * ➕ CREATE BILL using stored procedure
 * Calls: sp_generate_bill(patient_id, bill_code, payment_method, itemsJSON)
 */
export const createBill = async (req, res) => {
  try {
    const { bill_code, patient_id, items, payment_method } = req.body;

    if (!bill_code || !patient_id || !items || items.length === 0) {
      return res.status(400).json({ message: "Bill code, patient, and items required" });
    }

    const itemsJSON = JSON.stringify(items);

    await db.query("CALL sp_generate_bill(?, ?, ?, ?)", [
      patient_id,
      bill_code,
      payment_method || "Cash",
      itemsJSON,
    ]);

    res.status(201).json({ message: "Bill generated successfully" });
  } catch (error) {
    console.error("Error generating bill:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 📋 GET ALL BILLS (using billing_summary_view)
 */
export const getAllBills = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM billing_summary_view ORDER BY bill_date DESC");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🔍 GET BILL BY ID (includes bill_items)
 */
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const [bill] = await db.query(
      "SELECT * FROM billing_summary_view WHERE bill_id = ?",
      [id]
    );

    if (bill.length === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const [items] = await db.query("SELECT * FROM bill_items WHERE bill_id = ?", [id]);

    res.status(200).json({ ...bill[0], items });
  } catch (error) {
    console.error("Error fetching bill by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 💳 RECORD PAYMENT — uses trigger to auto-update billing status
 * Trigger: trg_update_bill_status_after_payment
 */
export const recordPayment = async (req, res) => {
  try {
    const { bill_id, amount_paid, payment_method, reference_number, received_by } = req.body;

    if (!bill_id || !amount_paid || !payment_method) {
      return res.status(400).json({ message: "Bill ID, amount, and payment method required" });
    }

    await db.query(
      `INSERT INTO payments (bill_id, amount_paid, payment_method, reference_number, received_by)
       VALUES (?, ?, ?, ?, ?)`,
      [bill_id, amount_paid, payment_method, reference_number || null, received_by || null]
    );

    // ✅ The trigger automatically updates billing.status
    res.status(201).json({ message: "Payment recorded successfully (status auto-updated)" });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🏦 SUBMIT INSURANCE CLAIM
 * Calls: sp_submit_insurance_claim(bill_id, insurance_provider, policy_number, claim_amount)
 */
export const createInsuranceClaim = async (req, res) => {
  try {
    const { bill_id, insurance_provider, policy_number, claim_amount } = req.body;

    if (!bill_id || !insurance_provider || !policy_number || !claim_amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await db.query("CALL sp_submit_insurance_claim(?, ?, ?, ?)", [
      bill_id,
      insurance_provider,
      policy_number,
      claim_amount,
    ]);

    res.status(201).json({ message: "Insurance claim submitted successfully" });
  } catch (error) {
    console.error("Error submitting insurance claim:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🧾 GET ALL INSURANCE CLAIMS
 */
export const getAllInsuranceClaims = async (req, res) => {
  try {
    const [claims] = await db.query(`
      SELECT 
        ic.*, 
        b.bill_code, 
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name
      FROM insurance_claims ic
      JOIN billing b ON ic.bill_id = b.bill_id
      JOIN patients p ON b.patient_id = p.patient_id
      ORDER BY ic.submission_date DESC
    `);

    res.status(200).json(claims);
  } catch (error) {
    console.error("Error fetching claims:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🧩 UPDATE INSURANCE CLAIM STATUS (Approve / Reject)
 * When Approved → updates billing status & inserts payment record.
 */
export const updateInsuranceClaimStatus = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { claim_id, claim_status } = req.body;

    if (!claim_id || !claim_status) {
      return res.status(400).json({ message: "claim_id and claim_status required" });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      `UPDATE insurance_claims 
       SET claim_status = ?, 
           approval_date = CASE WHEN ? = 'Approved' THEN CURRENT_DATE ELSE NULL END
       WHERE claim_id = ?`,
      [claim_status, claim_status, claim_id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Claim not found" });
    }

    const [[claim]] = await connection.query(
      `SELECT bill_id, claim_status, claim_amount FROM insurance_claims WHERE claim_id = ?`,
      [claim_id]
    );

    if (claim.claim_status === "Approved") {
      await connection.query(
        `UPDATE billing SET status = 'Paid', payment_method = 'Insurance' WHERE bill_id = ?`,
        [claim.bill_id]
      );

      await connection.query(
        `INSERT INTO payments (bill_id, amount_paid, payment_method, reference_number)
         VALUES (?, ?, 'Insurance', CONCAT('INS-', ?))`,
        [claim.bill_id, claim.claim_amount, claim_id]
      );
    } else if (claim.claim_status === "Rejected") {
      await connection.query(`UPDATE billing SET status = 'Unpaid' WHERE bill_id = ?`, [claim.bill_id]);
    }

    await connection.commit();
    res.status(200).json({ message: `Claim ${claim_status} successfully` });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating claim status:", error);
    res.status(500).json({ message: "Server error", error });
  } finally {
    connection.release();
  }
};

/**
 * 📊 FINANCIAL REPORTS — uses SQL views
 * daily_revenue_report / monthly_revenue_report
 */
export const getFinancialReports = async (req, res) => {
  try {
    const { type } = req.query;

    const view =
      type === "daily"
        ? "daily_revenue_report"
        : type === "monthly"
        ? "monthly_revenue_report"
        : "daily_revenue_report";

    const [rows] = await db.query(`SELECT * FROM ${view}`);

    res.status(200).json({
      reportType: type || "daily",
      recordCount: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 💰 GET TOTAL FINANCIAL SUMMARY
 */
export const getFinancialSummary = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        SUM(total_amount) AS totalRevenue,
        SUM(CASE WHEN status='Paid' THEN total_amount ELSE 0 END) AS totalPaid,
        SUM(CASE WHEN status='Partially Paid' THEN total_amount ELSE 0 END) AS partial,
        SUM(CASE WHEN status='Unpaid' THEN total_amount ELSE 0 END) AS unpaid
      FROM billing
    `);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
