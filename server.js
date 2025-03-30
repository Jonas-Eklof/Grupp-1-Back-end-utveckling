const express = require("express"); // Importera express för att skapa en server
const usersRouter = require("./routes/users"); // Importera användarrutten
const productsRouter = require("./routes/products"); // Importera produktrutten
const ordersRouter = require("./routes/orders"); // Importera orderrutten
const cartRouter = require("./routes/cart"); // Importera kundvagnsrutten

const app = express(); // Skapa en express-app
app.use(express.json()); // Middleware för att parsa JSON-data i inkommande förfrågningar

app.use("/users", usersRouter); // Använd användarrutten för alla förfrågningar som börjar med /users
app.use("/products", productsRouter); // Använd produktrouter för alla förfrågningar som börjar med /products
app.use("/orders", ordersRouter); // Använd orderrouter för alla förfrågningar som börjar med /orders
app.use("/cart", cartRouter); // Använd kundvagnrouter för alla förfrågningar som börjar med /cart

const PORT = 5000; // Definiera porten för servern
app.listen(PORT, () => { // Starta servern och lyssna på angiven port
  console.log(`Server körs på http://localhost:${PORT}`);
});
