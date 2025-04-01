// Importerar moduler
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose(); // För att jobba med SQLite

// Kopplar upp mot databasen
const db = new sqlite3.Database('./database.sqlite');

// ----------------------------
// GET /product – Hämta hela menyn
// ----------------------------
router.get('/product', (req, res) => {
  // Hämtar alla rader från tabellen "products"
  db.all('SELECT * FROM Products', (err, rows) => {
    if (err) {
      // Fel vid databasfråga
      return res.status(500).json({ error: 'Kunde inte hämta menyn' });
    }
    // Skickar tillbaka listan
    res.status(200).json(rows);
  });
});

// ----------------------------------
// GET /product/:id – En specifik produkt
// ----------------------------------
router.get('/product/:id', (req, res) => {
  const id = parseInt(req.params.id); // Tar ut id:t från URL:en

  // Hämtar en produkt som matchar id:t
  db.get('SELECT * FROM Products WHERE product_id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Fel vid hämtning' });
    }

    if (!row) {
      // Ingen produkt hittades
      return res.status(404).json({ error: 'Produkten hittades inte' });
    }

    // Skickar tillbaka produkten
    res.status(200).json(row);
  });
});

// Exporterar routen så den kan användas i server.js
module.exports = router;
