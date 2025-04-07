const express = require("express");
const db = require("../database");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { validateCartInput } = require("../middleware/validateCart");

// Simulerar tilldelandet av ett quest_id när man går in på vår sida

router.get("/guest-id", (req, res) => {
  const guest_id = uuidv4();
  res.status(200).json({ guest_id });
});

// Hämta en användares kundvagn

router.get("/carts/:id", (req, res) => {
  const id = req.params.id;

  try {
    // Försök hämta med user_id först
    let stmt = db.prepare(`
      SELECT Carts.cart_id, Products.name, Carts.quantity, Products.price,
             (Carts.quantity * Products.price) AS total_item_price
      FROM Carts
      JOIN Products ON Carts.product_id = Products.product_id
      WHERE Carts.user_id = ?
    `);
    let cartItems = stmt.all(id);

    // Om inget hittades, prova med guest_id
    if (cartItems.length === 0) {
      stmt = db.prepare(`
        SELECT Carts.cart_id, Products.name, Carts.quantity, Products.price,
               (Carts.quantity * Products.price) AS total_item_price
        FROM Carts
        JOIN Products ON Carts.product_id = Products.product_id
        WHERE Carts.guest_id = ?
      `);
      cartItems = stmt.all(id);
    }

    // Om kundvagnen är tom, returnera 404 Not Found
    if (cartItems.length === 0) {
      return res
        .status(404)
        .json({ message: "Ingen kundvagn hittades för denna användare." });
    }

    // Beräkna totalpris och total antal produkter
    let totalPrice = 0;
    let totalQuantity = 0;

    cartItems.forEach((item) => {
      totalPrice += item.total_item_price;
      totalQuantity += item.quantity;
    });

    // Om fler än 3 produkter i varukorgen → ge 10% rabatt
    let discount = 0;
    if (totalQuantity > 2) {
      discount = totalPrice * 0.1; // 10% rabatt
      totalPrice -= discount;
    }

    res.status(200).json({
      cartItems,
      totalQuantity,
      discount: discount.toFixed(2),
      finalPrice: totalPrice.toFixed(2),
    });
  } catch (error) {
    console.error("Fel vid hämtning av kundvagn:", error);
    res.status(500).json({ message: "Serverfel vid hämtning av kundvagn" });
  }
});

// Lägg till en produkt i kundvagnen

router.post("/carts", validateCartInput, (req, res) => {
  const { user_id, guest_id, product_id, quantity } = req.body;

  const idField = user_id ? "user_id" : guest_id ? "guest_id" : null;
  const idValue = user_id || guest_id;

  if (!idField || !product_id || quantity === undefined) {
    return res.status(400).json({ message: "user_id eller guest_id krävs." });
  }

  try {
    const checkStmt = db.prepare(`
      SELECT * FROM Carts WHERE ${idField} = ? AND product_id = ?
    `);
    const existingItem = checkStmt.get(idValue, product_id);

    if (existingItem) {
      const updateStmt = db.prepare(`
        UPDATE Carts SET quantity = quantity + ? WHERE ${idField} = ? AND product_id = ?
      `);
      updateStmt.run(quantity, idValue, product_id);
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO Carts (${idField}, product_id, quantity)
        VALUES (?, ?, ?)
      `);
      insertStmt.run(idValue, product_id, quantity);
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

router.delete("/carts/:id", (req, res) => {
  const { id } = req.params;

  // Försök tömma user_id först
  let stmt = db.prepare("DELETE FROM Carts WHERE user_id = ?");
  let result = stmt.run(id);

  // Om inget togs bort, försök med guest_id
  if (result.changes === 0) {
    stmt = db.prepare("DELETE FROM Carts WHERE guest_id = ?");
    result = stmt.run(id);
  }

  if (result.changes > 0) {
    res.status(200).json({ message: "Kundvagn tömd!" });
  } else {
    res.status(404).json({ message: "Ingen kundvagn att tömma." });
  }
});

// Förslag på hur vi kan skapa en ny order från kundvagn

router.post("/orders", (req, res) => {
  const { user_id } = req.body;

  try {
    // 1. Hämta varorna i kundvagnen
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

    // 3. Applicera rabatt om fler än 3 produkter
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
      discount: discount.toFixed(2), // Visar rabattbeloppet
      total_price: totalPrice.toFixed(2), // Rabatterat pris
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

module.exports = router;
