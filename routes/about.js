const express = require("express"); // Importera express för att skapa en router
const router = express.Router(); // Skapa en router

// Definiera GET-routen för att ge information om företaget
router.get("/", (req, res) => {
  try {
    const companyInfo = {
      name: "Airbean",
      established: 2025,
      location: "Stockholm, Sverige",
      mission:
        "Att erbjuda fantastiskt gott kaffe levererat av drönare till din dörr.",
      info: "Airbean är ett företag startat 2025 av Mathilda, Molly, Jonas, Micke och Jesper. Vårat kaffe produceras med de finaste kaffebönorna från hela världen. Vi strävar efter att vara miljövänliga och hållbara i alla våra processer.",
      contact: {
        email: "info@airbean.se",
        phone: "+46 123 456 789",
      },
    };

    // Kontrollera om datan finns (detta är mest för att demonstrera felhantering)
    if (!companyInfo) {
      throw new Error("Företagsinformationen kunde inte hämtas.");
    }

    // Skicka JSON-data som svar
    res.json(companyInfo);
  } catch (error) {
    // Skicka en felkod och felmeddelande
    res.status(500).json({ error: "Ett serverfel uppstod: " + error.message });
  }
});

module.exports = router; // Exportera routern så att den kan användas i servern
