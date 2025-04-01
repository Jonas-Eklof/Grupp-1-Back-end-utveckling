const express = require("express");
const db = require("../database"); // Importera databasmodulen
const router = express.Router();

// Hämta en användares kundvagn

router.get("/carts/:user_id", (req, res) => {
  const { user_id } = req.params;

  try {
    const stmt = db.prepare(`
      SELECT Carts.cart_id, Products.name, Carts.quantity, Products.price
      FROM Carts
      JOIN Products ON Carts.product_id = Products.product_id
      WHERE Carts.user_id = ?
    `);
    const cartItems = stmt.all(user_id);

    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Fel vid hämtning av kundvagn:", error);
    res.status(500).json({ message: "Serverfel vid hämtning av kundvagn" });
  }
});

// Lägg till en produkt i kundvagnen

router.post("/carts", (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  if (!user_id || !product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "Ogiltig data för kundvagnen" });
  }

  try {
    // Kontrollera om produkten redan finns i kundvagnen
    const checkStmt = db.prepare(`
      SELECT * FROM Carts WHERE user_id = ? AND product_id = ?
    `);
    const existingItem = checkStmt.get(user_id, product_id);

    if (existingItem) {
      // Uppdatera kvantiteten om produkten redan finns
      const updateStmt = db.prepare(`
        UPDATE Carts SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?
      `);
      updateStmt.run(quantity, user_id, product_id);
    } else {
      // Lägg till ny produkt i kundvagnen
      const insertStmt = db.prepare(`
        INSERT INTO Carts (user_id, product_id, quantity, added_at)
        VALUES (?, ?, ?, ?)
      `);
      insertStmt.run(user_id, product_id, quantity, new Date().toISOString());
    }

    res.status(201).json({ message: "Produkt tillagd i kundvagnen!" });
  } catch (error) {
    console.error("Fel vid tillägg till kundvagn:", error);
    res.status(500).json({ message: "Serverfel vid tillägg till kundvagn" });
  }
});

// Ta bort en produkt från kundvagnen

router.delete("/carts/:cart_id", (req, res) => {
  const { cart_id } = req.params;

  try {
    const stmt = db.prepare("DELETE FROM Carts WHERE cart_id = ?");
    const result = stmt.run(cart_id);

    if (result.changes > 0) {
      res.status(200).json({ message: "Produkt borttagen från kundvagnen!" });
    } else {
      res.status(404).json({ message: "Produkt ej hittad i kundvagnen" });
    }
  } catch (error) {
    console.error("Fel vid borttagning från kundvagn:", error);
    res
      .status(500)
      .json({ message: "Serverfel vid borttagning från kundvagn" });
  }
});

// Töm en användares kundvagn

router.delete("/carts/user/:user_id", (req, res) => {
  const { user_id } = req.params;

  try {
    const stmt = db.prepare("DELETE FROM Carts WHERE user_id = ?");
    const result = stmt.run(user_id);

    if (result.changes > 0) {
      res.status(200).json({ message: "Kundvagn tömd!" });
    } else {
      res.status(404).json({ message: "Ingen kundvagn att tömma" });
    }
  } catch (error) {
    console.error("Fel vid tömning av kundvagn:", error);
    res.status(500).json({ message: "Serverfel vid tömning av kundvagn" });
  }
});

// Förslag på hur vi kan skapa en ny order från kundvagn

router.post("/orders", (req, res) => {
  const { user_id } = req.body;

  try {
    // 1. Hämta varorna i kundvagnen
    const cartStmt = db.prepare(`
      SELECT Carts.product_id, Carts.quantity, Products.price
      FROM Carts
      JOIN Products ON Carts.product_id = Products.product_id
      WHERE Carts.user_id = ?
    `);
    const cartItems = cartStmt.all(user_id);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Kundvagnen är tom." });
    }

    // 2. Beräkna totalpris
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 3. Skapa en ny order
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

    // 4. Flytta produkter från Carts till Order_Items
    const orderItemStmt = db.prepare(`
      INSERT INTO Order_Items (order_id, product_id, quantity)
      VALUES (?, ?, ?)
    `);

    const insertOrderItems = db.transaction((items) => {
      for (const item of items) {
        orderItemStmt.run(order_id, item.product_id, item.quantity);
      }
    });

    insertOrderItems(cartItems);

    // 5. Töm kundvagnen
    const deleteCartStmt = db.prepare("DELETE FROM Carts WHERE user_id = ?");
    deleteCartStmt.run(user_id);

    res
      .status(201)
      .json({ message: "Order skapad!", order_id, total_price: totalPrice });
  } catch (error) {
    console.error("Order-fel:", error);
    res.status(500).json({ message: "Serverfel vid orderläggning" });
  }
});

module.exports = router;
