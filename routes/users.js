const express = require("express"); // Importera express för att skapa en router
const { v4: uuidv4 } = require("uuid"); // Importera uuid för att generera slumpmässiga ID:n
const db = require("../database"); // Importera databasmodulen

const bcrypt = require("bcryptjs"); // Importera bcrypt för att hash:a lösenord
const saltRounds = 10; // Antal salt-rundor för bcrypt

const router = express.Router(); // Skapa en router för användare

// Hämta alla användare
// Endast för utvecklingsändamål, inte för produktion
router.get("/", (req, res) => {
  try {
    const stmt = db.prepare(
      "SELECT user_id, name, email, address, password FROM Users"
    ); // Hämta alla användare med ID, namn och e-postadress
    const users = stmt.all(); // Kör SQL-frågan och hämta alla användare
    if (!users) {
      return res.status(404).json({ error: "Inga användare hittades" });
    }
    res.json(users); // Returnera användarna som JSON
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hämta en specifik användare via ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare(
      "SELECT name, address, email FROM Users WHERE user_id = ?"
    );
    const user = stmt.get(id);
    if (!user) {
      return res.status(404).json({ error: "Användaren hittades inte" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; // Exportera routern för användare så att den kan användas i servern
