const express = require('express');
const router = express.Router();
const db = require('../database'); // Använder databasen via better-sqlite3

// -------------------------------------
// GET /products – Hämta hela menyn
// -------------------------------------
router.get('/products', (req, res) => {
  try {
    // ÄNDRAT: Använder better-sqlite3 med prepare().all() istället för db.all(callback)
    const stmt = db.prepare('SELECT * FROM Products');
    const products = stmt.all(); // Hämtar alla produkter
    res.json(products); // Express skickar automatiskt status 200
  } catch (error) {
    // NYTT: Try/catch för att fånga fel vid frågan
    console.error('Fel vid hämtning av produkter:', error);
    res.status(500).json({ error: 'Kunde inte hämta menyn' });
  }
});

// -------------------------------------------------
// GET /products/:id – Hämta en specifik produkt
// -------------------------------------------------
router.get('/products/:id', (req, res) => {
  const { id } = req.params; // ÄNDRAT: Använder enklare destructuring

  try {
    // ÄNDRAT: Använder prepare().get() istället för db.get(callback)
    const stmt = db.prepare('SELECT * FROM Products WHERE product_id = ?');
    const product = stmt.get(id); // Hämtar en produkt med angivet ID

    if (!product) {
      return res.status(404).json({ error: 'Produkten hittades inte' });
    }

    res.json(product); // Status 200 sätts automatiskt
  } catch (error) {
    // NYTT: Fångar fel med try/catch
    console.error('Fel vid hämtning av produkt:', error);
    res.status(500).json({ error: 'Fel vid hämtning av produkt' });
  }
});

// Exporterar routen så den kan användas i server.js
module.exports = router;
