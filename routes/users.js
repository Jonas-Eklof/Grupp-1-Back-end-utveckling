const express = require("express"); // Importera express för att skapa en router
const { v4: uuidv4 } = require("uuid"); // Importera uuid för att generera slumpmässiga ID:n
const db = require("../database"); // Importera databasmodulen

const bcrypt = require("bcryptjs"); // Importera bcrypt för att hash:a lösenord
const saltRounds = 10; // Antal salt-rundor för bcrypt

const router = express.Router(); // Skapa en router för användare

// Lägg till en ny användare med slumpmässigt ID
router.post("/register", (req, res) => {
  const { name, address, password, email } = req.body;
  const id = uuidv4(); // Generera slumpmässigt ID med uuidv4 bibliotek

  try {
    // Kontrollera om e-postadressen redan finns i databasen
    const checkEmail = db.prepare("SELECT email FROM Users WHERE email = ?");
    const existingUser = checkEmail.get(email);

    if (existingUser) {
      // Om e-postadressen redan finns, skicka ett felmeddelande
      return res
        .status(400)
        .json({ error: "Epostadressen finns redan registrerad" });
    }

    // Hasha lösenordet med bcrypt
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    // Lägg till användaren i databasen
    const stmt = db.prepare(
      "INSERT INTO Users (user_id, name, address, password, email) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(id, name, address, hashedPassword, email);

    res.json({ message: "Användare skapad" });
  } catch (error) {
    res.status(400).json({ error: error.message }); // Returnera felmeddelande om något går fel
  }
});

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
