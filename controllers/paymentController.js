import db from "../config/db.js";

// Record Payment
export const recordPayment = async (req, res) => {
  try {
    const { bill_id, amount_paid, payment_method, reference_number, received_by } = req.body;

    await db.execute(
      "INSERT INTO payments (bill_id, amount_paid, payment_method, reference_number, received_by) VALUES (?, ?, ?, ?, ?)",
      [bill_id, amount_paid, payment_method, reference_number, received_by]
    );

    res.status(201).json({ message: "Payment recorded successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error recording payment", error: err });
  }
};

// Get All Payments for a Bill
export const getPaymentsByBill = async (req, res) => {
  try {
    const { bill_id } = req.params;
    const [rows] = await db.execute("SELECT * FROM payments WHERE bill_id=?", [bill_id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payments", error: err });
  }
};
