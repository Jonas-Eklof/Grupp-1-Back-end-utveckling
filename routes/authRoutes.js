const express = require("express");
const bcrypt = require("bcryptjs"); // För att hasha lösenord
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator"); // För request-validering
const db = require("../database");
const { v4: uuidv4 } = require("uuid"); // Uuid för att generera slumpmässiga ID:n
require("dotenv").config();

const router = express.Router();

// Simulerar tilldelandet av ett quest_id när man går in på vår sida

router.get("/guest-id", (req, res) => {
  const guest_id = uuidv4();
  res.status(200).json({ guest_id });
});

// POST /register - Hanterar registrering av ny användare
router.post(
  "/register",
  [
    // Valideringsregler för inkommande data:

    // Kontrollerar att e-postfältet innehåller en giltig e-postadress
    // Om inte: Returnerar felmeddelandet "Ogiltig e-postadress"
    body("email").isEmail().withMessage("Ogiltig e-postadress"),

    // Kontrollerar att lösenordet är minst 8 tecken långt
    // Om kortare: Returnerar "Lösenordet måste vara minst 8 tecken långt"
    body("password")
      .isLength({ min: 8 })
      .withMessage("Lösenordet måste vara minst 8 tecken långt"),

    // Kontrollerar att namn-fältet inte är tomt
    // Om tomt: Returnerar "Namn krävs"
    body("name").notEmpty().withMessage("Namn krävs"),

    // Kontrollerar att adress-fältet inte är tomt
    // Om tomt: Returnerar "Adress krävs"
    body("address").notEmpty().withMessage("Adress krävs"),
  ],
  // Async-funktion som hanterar själva registreringen
  async (req, res) => {
    // Hämtar eventuella valideringsfel från ovanstående kontroller
    const errors = validationResult(req);

    // Om det finns valideringsfel:
    if (!errors.isEmpty()) {
      // Returnera status 400 (Bad Request) med felmeddelandena
      return res.status(400).json({ errors: errors.array() });
    }

    // Hämtar data från request-body
    const { email, password, name, address } = req.body;

    // Hashar lösenordet med bcrypt:
    // - password: det inmatade lösenordet
    // - 10: antal "salt rounds" (hur komplex hashningen ska vara)
    //    - 8-12 är standard (8 = snabbare, 12 = säkrare)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Genererar ett unikt ID för användaren med uuidv4()
    // Exempel: "123e4567-e89b-12d3-a456-426614174000"
    const user_id = uuidv4();

    try {
      // Kollar om e-postadressen redan finns i databasen
      // prepare() skapar en säker SQL-fråga, get() kör frågan med e-post som parameter
      const existingUser = db
        .prepare("SELECT email FROM Users WHERE email = ?")
        .get(email);

      // Om e-postadressen redan finns:
      if (existingUser) {
        // Returnera status 400 med felmeddelande
        return res.status(400).json({ error: "E-postadressen finns redan" });
      }

      // Skapar användaren i databasen:
      // 1. prepare() skapar en säker INSERT-fråga
      const stmt = db.prepare(`
                INSERT INTO Users (user_id, email, password, name, address) 
                VALUES (?, ?, ?, ?, ?)
            `);

      // 2. run() kör frågan med de faktiska värdena
      stmt.run(user_id, email, hashedPassword, name, address);

      // Returnera status 201 (Created) vid lyckad registrering
      res.status(201).json({ message: "Användare skapad!" });
    } catch (err) {
      // Fångar oväntade fel (t.ex. databasproblem)
      // Returnera status 500 (Internal Server Error) med felmeddelande
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /login - Hanterar inloggningsförsök och returnerar en JWT-token vid lyckad inloggning
router.post(
  "/login",
  [
    // Validerar att e-postfältet innehåller en giltig e-postadress
    // Om inte: Skickar felmeddelande "Ogiltig e-postadress"
    body("email").isEmail().withMessage("Ogiltig e-postadress"),

    // Validerar att lösenordsfältet inte är tomt
    // Om tomt: Skickar felmeddelande "Lösenord krävs"
    body("password").notEmpty().withMessage("Lösenord krävs"),
  ],

  // Async-funktion som hanterar själva inloggningen
  async (req, res) => {
    // Hämtar eventuella valideringsfel från ovanstående kontroller
    const errors = validationResult(req);

    // Om det finns valideringsfel:
    if (!errors.isEmpty()) {
      // Returnera status 400 (Bad Request) med felmeddelandena
      return res.status(400).json({ errors: errors.array() });
    }

    // Hämtar e-post och lösenord från request-body
    const { email, password } = req.body;

    // Hämtar användare från databasen som matchar angiven e-post
    // prepare() skapar en säker SQL-fråga, get() kör frågan med e-post som parameter
    const user = db.prepare("SELECT * FROM Users WHERE email = ?").get(email);

    // Om ingen användare hittades:
    if (!user) {
      // Returnera status 400 med generellt felmeddelande (av säkerhetsskäl)
      return res.status(400).json({ error: "Felaktig e-post eller lösenord" });
    }

    // Jämför det inmatade lösenordet med det hashande lösenordet i databasen
    // bcrypt.compare() dekrypterar inte, utan hashar input och jämför hashar
    const isMatch = await bcrypt.compare(password, user.password);

    // Om lösenorden inte matchar:
    if (!isMatch) {
      // Returnera samma felmeddelande igen (för att inte avslöja vad som var fel)
      return res.status(400).json({ error: "Felaktig e-post eller lösenord" });
    }

    // Om allt stämmer - skapa en JWT (JSON Web Token):
    // jwt.sign() skapar en krypterad token som innehåller:
    // - användar-ID och e-post (i "payload")
    // - signerad med din hemliga nyckel (JWT_SECRET från .env-fil)
    // - som upphör att gälla efter 1 timme (expiresIn)
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Skicka tillbaka ett lyckat svar med:
    res.json({
      message: "Inloggad!", // Bekräftelsemeddelande
      token, // JWT-token som ska sparas klient-sidan
      user: {
        // Grundläggande användarinfo
        id: user.user_id, // Användarens ID
        name: user.name, // Användarens namn
        email: user.email, // Användarens e-post
      },
    });
  }
);

// Skapa ny användare från guest_id och flytta varukorg
router.post(
  "/users/from-guest",
  [
    body("guest_id").notEmpty().withMessage("guest_id krävs"),
    body("email").isEmail().withMessage("Ogiltig e-postadress"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Lösenordet måste vara minst 8 tecken långt"),
    body("name").notEmpty().withMessage("Namn krävs"),
    body("address").notEmpty().withMessage("Adress krävs"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { guest_id, email, password, name, address } = req.body;

    try {
      // 1. Kontrollera att gästens varukorg existerar
      const guestCart = db
        .prepare("SELECT * FROM Carts WHERE guest_id = ?")
        .all(guest_id);

      if (guestCart.length === 0) {
        return res.status(400).json({
          message: "Ingen varukorg kopplad till angivet guest_id.",
        });
      }

      // 2. Kontrollera att e-postadressen inte redan finns
      const existingUser = db
        .prepare("SELECT email FROM Users WHERE email = ?")
        .get(email);

      if (existingUser) {
        return res.status(400).json({
          message: "E-postadressen är redan registrerad.",
        });
      }

      // 3. Skapa ny användare
      const user_id = uuidv4();
      const hashedPassword = await bcrypt.hash(password, 10);

      db.prepare(
        `INSERT INTO Users (user_id, email, password, name, address)
         VALUES (?, ?, ?, ?, ?)`
      ).run(user_id, email, hashedPassword, name, address);

      // 4. Flytta kundvagnen från guest_id till user_id
      db.prepare(
        `UPDATE Carts SET user_id = ?, guest_id = NULL WHERE guest_id = ?`
      ).run(user_id, guest_id);

      // 5. Svara med nytt user_id
      res.status(201).json({
        message: "Användare skapad och varukorg överförd.",
        user_id,
      });
    } catch (error) {
      console.error("Fel vid skapande från gäst:", error);
      res
        .status(500)
        .json({ message: "Serverfel vid registrering från gäst." });
    }
  }
);

module.exports = router;
