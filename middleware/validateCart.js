const db = require("../database");

const validateCartInput = (req, res, next) => {
  const { user_id, product_id, quantity } = req.body;

  // 1. Kontrollera att alla fält finns
  // "quantity === undefined" istället för "!quantity", då det senare alternativet ger "fel" felmeddelande vid quantity = 0 pga att Javascript är "Falsy"
  // quantity = 0 ska ge meddelande "Kvantitet måste vara ett heltal större än 0.", tidigare så gav det "Alla fält (user_id, product_id, quantity) krävs."
  if (!user_id || !product_id || quantity === undefined) {
    return res
      .status(400)
      .json({ message: "Alla fält (user_id, product_id, quantity) krävs." });
  }

  // 2. Kontrollera format
  if (
    typeof user_id !== "string" ||
    typeof product_id !== "number" ||
    typeof quantity !== "number"
  ) {
    return res.status(400).json({ message: "Felaktiga datatyper." });
  }

  if (quantity <= 0 || !Number.isInteger(quantity)) {
    return res
      .status(400)
      .json({ message: "Kvantitet måste vara ett heltal större än 0." });
  }

  // 3. Kontrollera att produkten finns i databasen
  const productCheckStmt = db.prepare(
    "SELECT * FROM Products WHERE product_id = ?"
  );
  const product = productCheckStmt.get(product_id);

  if (!product) {
    return res.status(404).json({ message: "Produkten finns inte i menyn." });
  }

  // Allt okej – gå vidare till nästa middleware eller route
  next();
};

module.exports = { validateCartInput };
