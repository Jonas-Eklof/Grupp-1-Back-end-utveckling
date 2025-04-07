const db = require("../database");

const validateCartInput = (req, res, next) => {
  const { user_id, guest_id, product_id, quantity } = req.body;

  // 1. Kontrollera att antingen user_id eller guest_id finns
  if (!user_id && !guest_id) {
    return res
      .status(400)
      .json({ message: "Antingen user_id eller guest_id krävs." });
  }

  // 2. Kontrollera att övriga fält finns
  if (!product_id || quantity === undefined) {
    return res
      .status(400)
      .json({ message: "Fälten product_id och quantity krävs." });
  }

  // 3. Kontrollera format
  if (
    (user_id && typeof user_id !== "string") ||
    (guest_id && typeof guest_id !== "string") ||
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

  // 4. Kontrollera att produkten finns
  const productCheckStmt = db.prepare(
    "SELECT * FROM Products WHERE product_id = ?"
  );
  const product = productCheckStmt.get(product_id);

  if (!product) {
    return res.status(404).json({ message: "Produkten finns inte i menyn." });
  }

  // Allt okej – gå vidare
  next();
};

module.exports = { validateCartInput };
