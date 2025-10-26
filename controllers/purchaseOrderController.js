import db from "../config/db.js";

// 🧾 Create Purchase Order (with items)
export const createPurchaseOrder = async (req, res) => {
  const connection = await db.getConnection(); // for transaction
  try {
    const { order_code, supplier_id, order_date, items } = req.body;

    if (!supplier_id || !items || items.length === 0) {
      return res.status(400).json({ message: "Supplier and items are required" });
    }

    // Calculate total amount
    const total_amount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    await connection.beginTransaction();

    // Insert into purchase_orders
    const [orderResult] = await connection.execute(
      `INSERT INTO purchase_orders (order_code, supplier_id, order_date, total_amount, status)
       VALUES (?, ?, ?, ?, 'Pending')`,
      [order_code, supplier_id, order_date || new Date(), total_amount]
    );

    const order_id = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      await connection.execute(
        `INSERT INTO purchase_order_items (order_id, medicine_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [order_id, item.medicine_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
      );
    }

    await connection.commit();

    res.status(201).json({ message: "Purchase order created successfully", order_id });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: "Server Error", error: err });
  } finally {
    connection.release();
  }
};

// 📋 Get All Purchase Orders
export const getPurchaseOrders = async (req, res) => {
  try {
    const [orders] = await db.execute(`
      SELECT po.*, s.name AS supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.supplier_id
      ORDER BY po.order_date DESC
    `);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// 🔍 Get Purchase Order By ID (with items)
export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [orderRows] = await db.execute(`
      SELECT po.*, s.name AS supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.supplier_id
      WHERE po.order_id = ?`, [id]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    const [items] = await db.execute(`
      SELECT poi.*, m.name AS medicine_name
      FROM purchase_order_items poi
      LEFT JOIN medicines m ON poi.medicine_id = m.medicine_id
      WHERE poi.order_id = ?`, [id]
    );

    res.status(200).json({ ...orderRows[0], items });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// 🔄 Update Purchase Order Status (e.g., Pending → Received)
export const updatePurchaseOrderStatus = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Received", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    await connection.beginTransaction();

    // Update status
    await connection.execute(
      "UPDATE purchase_orders SET status=? WHERE order_id=?",
      [status, id]
    );

    // If order marked as 'Received', trigger will handle stock update (if configured)
    await connection.commit();

    res.status(200).json({ message: "Purchase order status updated" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: "Server Error", error: err });
  } finally {
    connection.release();
  }
};

// ❌ Delete Purchase Order (optional)
export const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM purchase_orders WHERE order_id=?", [id]);
    res.status(200).json({ message: "Purchase order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};
