const express = require("express");
const db = require("../database");
const router = express.Router();

// Skapa ny order från innehåll i kundvagn

router.post("/", (req, res) => {
  const { user_id } = req.body;

  try {
    // 1. Hämta produkter i kundvagnen
    const cartStmt = db.prepare(`
      SELECT Carts.product_id, Carts.quantity, Products.name, Products.price
      FROM Carts
      JOIN Products ON Carts.product_id = Products.product_id
      WHERE Carts.user_id = ?
    `);
    const cartItems = cartStmt.all(user_id);

    if (cartItems.length === 0) {
      return res
        .status(404)
        .json({ message: "Kundvagnen är tom, order kan inte skapas." });
    }

    // 2. Beräkna totalpris och antal produkter
    let totalPrice = 0;
    let totalQuantity = 0;

    cartItems.forEach((item) => {
      totalPrice += item.price * item.quantity;
      totalQuantity += item.quantity;
    });

    // 3. Applicera rabatt om 3 eller fler produkter
    let discount = 0;
    if (totalQuantity >= 3) {
      discount = totalPrice * 0.1; // 10% rabatt
      totalPrice -= discount;
    }

    // 4. Skapa en ny order
    const orderStmt = db.prepare(`
      INSERT INTO Orders (user_id, order_date, delivery_status, total_price)
      VALUES (?, ?, ?, ?)
    `);
    const orderResult = orderStmt.run(
      user_id,
      new Date().toISOString(),
      "pending",
      totalPrice
    );
    const order_id = orderResult.lastInsertRowid;

    // 5. Flytta produkter från Carts till Order_Items
    const orderItemStmt = db.prepare(`
      INSERT INTO Order_Items (order_id, product_id, quantity)
      VALUES (?, ?, ?)
    `);

    const insertOrderItems = db.transaction((items) => {
      for (const item of items) {
        orderItemStmt.run(order_id, item.product_id, item.quantity);
      }
    });

    try {
      insertOrderItems(cartItems);
    } catch (error) {
      console.error("Fel vid order-inläggning:", error);
      return res
        .status(500)
        .json({ message: "Misslyckades att lägga till produkter i ordern." });
    }

    // 6. Töm kundvagnen
    const deleteCartStmt = db.prepare("DELETE FROM Carts WHERE user_id = ?");
    deleteCartStmt.run(user_id);

    // 7. Skicka tillbaka orderbekräftelse med rabatt-info
    res.status(201).json({
      message: "Order skapad!",
      order_id,
      order_date: new Date().toISOString(),
      delivery_status: "pending",
      discount: discount.toFixed(2),
      total_price: totalPrice.toFixed(2),
      products: cartItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  } catch (error) {
    console.error("Order-fel:", error);
    res.status(500).json({ message: "Serverfel vid orderläggning" });
  }
});

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
    const result = stmt.run(status, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Ordern hittades inte" }); // 404 om order_id inte finns
    }

    res.json({ message: `Order ${id} uppdaterad till ${status}` });
  } catch (error) {
    res.status(500).json({ error: "Serverfel vid uppdatering av order" });
  }
});

module.exports = router;
