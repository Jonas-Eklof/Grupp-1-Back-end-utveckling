const express = require("express");
const db = require("../database"); // Se till att databasen är korrekt importerad
const router = express.Router();

// Skapa en order
router.post("/", (req, res) => {
  const { user_id, items, discount, total_price } = req.body;
  const order_date = new Date().toISOString(); // Skapa order_date som den aktuella tidpunkten.

  let total_quantity = 0;
  items.forEach((item) => {
    total_quantity += item.quantity; // Lägg till quantity för varje item
  });

  try {
    const stmt = db.prepare(`
      INSERT INTO Orders (user_id, order_date, delivery_status, quantity, total_price)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      user_id,
      order_date,
      "pending",
      total_quantity,
      total_price
    );
    const order_id = result.lastInsertRowid;

    const itemStmt = db.prepare(`
      INSERT INTO Order_items (order_id, product_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `);

    items.forEach((item) => {
      itemStmt.run(order_id, item.product_id, item.quantity, item.price);
    });

    res.json({ message: "Order skapad", order_id: order_id });
  } catch (error) {
    console.error("Fel vid skapande av order:", error); // Logga eventuella fel
    res.status(400).json({ error: error.message });
  }
});

// Hämta alla ordrar för en användare
router.get("/:user_id", (req, res) => {
  const { user_id } = req.params;

  try {
    const stmt = db.prepare("SELECT * FROM Orders WHERE user_id = ?");
    const orders = stmt.all(user_id);

    if (orders.length === 0) {
      return res.status(404).json({ error: "Inga ordrar hittades" });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hämta detaljer för en specifik order via order_id
router.get("/:order_id", (req, res) => {
  const { order_id } = req.params;
  try {
    const stmt = db.prepare("SELECT * FROM Orders WHERE order_id = ?");
    const order = stmt.get(order_id);

    if (!order) {
      return res.status(404).json({ error: "Ordern hittades inte" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Uppdatera leveransstatus för en order
router.put("/:id/delivery-status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "shipped", "delivered"].includes(status)) {
    return res.status(400).json({ error: "Ogiltig status" });
  }

  try {
    const stmt = db.prepare(`
      UPDATE Orders SET delivery_status = ? WHERE order_id = ?
    `);
    stmt.run(status, id);

    res.json({ message: `Order ${id} uppdaterad till ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
  }
});

module.exports = router;
