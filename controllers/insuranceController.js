import db from "../config/db.js";

// ✅ File new insurance claim
export const fileClaim = async (req, res) => {
  try {
    const { bill_id, insurance_provider, policy_number, claim_amount } = req.body;

    await db.execute(
      `INSERT INTO insurance_claims 
       (bill_id, insurance_provider, policy_number, claim_amount, claim_status, submission_date) 
       VALUES (?, ?, ?, ?, 'Submitted', CURDATE())`,
      [bill_id, insurance_provider, policy_number, claim_amount]
    );

    res.status(201).json({ message: "Insurance claim filed successfully" });
  } catch (err) {
    console.error("Error filing claim:", err);
    res.status(500).json({ message: "Error filing claim", error: err });
  }
};

// ✅ Get all insurance claims
export const getAllClaims = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM insurance_claims ORDER BY submission_date DESC"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching claims:", err);
    res.status(500).json({ message: "Error fetching claims", error: err });
  }
};

// ✅ Update claim status
export const updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { claim_status } = req.body;

    let query =
      claim_status === "Approved"
        ? "UPDATE insurance_claims SET claim_status=?, approval_date=CURDATE() WHERE claim_id=?"
        : "UPDATE insurance_claims SET claim_status=? WHERE claim_id=?";

    await db.execute(query, [claim_status, id]);
    res.status(200).json({ message: "Claim status updated successfully" });
  } catch (err) {
    console.error("Error updating claim status:", err);
    res.status(500).json({ message: "Error updating claim status", error: err });
  }
};
