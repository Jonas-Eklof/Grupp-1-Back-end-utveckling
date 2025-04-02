const express = require("express");
const db = require("../database"); // Se till att databasen är korrekt importerad
const router = express.Router();


// Hämta alla ordrar för en användare
router.get("/user/:user_id", (req, res) => {
  // Ändrat här från /:user_id till /user/:user_id då det krockar med /:order_id annars
  const { user_id } = req.params;


  if (!user_id) {
    return res.status(400).json({ error: "User ID saknas" }); // 400 om user_id inte skickas
  }

  try {
    const stmt = db.prepare("SELECT * FROM Orders WHERE user_id = ?");
    const orders = stmt.all(user_id);

    if (orders.length === 0) {
      return res.status(404).json({ error: "Inga ordrar hittades" });
    }
    res.json(orders);
  } catch (error) {

    res.status(500).json({ error: "Serverfel vid hämtning av ordrar" });
  }
});

// Hämta detaljer för en specifik order via order_id
router.get("/:order_id", (req, res) => {
  const { order_id } = req.params;

  if (!order_id) {
    return res.status(400).json({ error: "Order ID saknas" }); // 400 om order_id inte finns
  }

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
router.put("/:id/delivery_status", (req, res) => {
  // Ändrat från - till _
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Order ID saknas" }); // 400 om id inte skickas
  }

  if (!["pending", "shipped", "delivered"].includes(status)) {
    return res.status(400).json({ error: "Ogiltig status" });
  }

  try {
    const stmt = db.prepare(`
      UPDATE Orders SET delivery_status = ? WHERE order_id = ?
    `);
    stmt.run(status, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Ordern hittades inte" }); // 404 om order_id inte finns
    }

    res.json({ message: `Order ${id} uppdaterad till ${status}` });
  } catch (error) {
    res.status(500).json({ error: "Serverfel vid uppdatering av order" });
  }
});

module.exports = router;
