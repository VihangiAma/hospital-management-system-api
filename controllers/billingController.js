import db from "../config/db.js";

// Generate Bill (Calls Stored Procedure sp_generate_bill)
export const generateBill = async (req, res) => {
  try {
    const { patient_id, bill_code, payment_method, items } = req.body;

    if (!patient_id || !bill_code || !payment_method || !items)
      return res.status(400).json({ message: "Missing required fields" });

    const itemsJson = JSON.stringify(items);

    await db.query("CALL sp_generate_bill(?, ?, ?, ?)", [
      patient_id,
      bill_code,
      payment_method,
      itemsJson,
    ]);

    res.status(201).json({ message: "Bill generated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating bill", error: err });
  }
};

// Get All Bills (with summary view)
export const getAllBills = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM billing_summary_view ORDER BY bill_date DESC");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bills", error: err });
  }
};

// Get Bill by ID (with items)
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const [bill] = await db.execute("SELECT * FROM billing_summary_view WHERE bill_id=?", [id]);
    const [items] = await db.execute("SELECT * FROM bill_items WHERE bill_id=?", [id]);

    if (!bill.length) return res.status(404).json({ message: "Bill not found" });

    res.status(200).json({ ...bill[0], items });
  } catch (err) {
    res.status(500).json({ message: "Error fetching bill details", error: err });
  }
};

// Submit Insurance Claim (Stored Procedure)
export const submitInsuranceClaim = async (req, res) => {
  try {
    const { bill_id, insurance_provider, policy_number, claim_amount } = req.body;
    await db.query("CALL sp_submit_insurance_claim(?, ?, ?, ?)", [
      bill_id,
      insurance_provider,
      policy_number,
      claim_amount,
    ]);

    res.status(201).json({ message: "Insurance claim submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error submitting insurance claim", error: err });
  }
};
