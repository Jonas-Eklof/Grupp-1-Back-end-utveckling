const express = require("express"); // Importera express för att skapa en server
const cors = require("cors"); // Importera cors för att hantera CORS-problem
const usersRouter = require("./routes/users"); // Importera användarrutten
const aboutRouter = require("./routes/about"); // Importera om-rutten
const productsRouter = require("./routes/products"); // Importera produktrutten
const ordersRouter = require("./routes/orders"); // Importera orderrutten
const cartsRouter = require("./routes/carts"); // Importera kundvagnsrutten
const authRouter = require("./routes/authRoutes");

const app = express(); // Skapa en express-app
app.use(express.json()); // Middleware för att parsa JSON-data i inkommande förfrågningar
app.use(cors()); // Använd cors för att tillåta alla domäner att göra förfrågningar till servern

app.use("/users", usersRouter); // Använd userRouter för alla förfrågningar som börjar med /users
app.use("/about", aboutRouter); // Använd aboutRouter för alla förfrågningar som börjar med /about
app.use("/products", productsRouter); // Använd productsRouter för alla förfrågningar som börjar med /products
app.use("/orders", ordersRouter); // Använd ordersRouter för alla förfrågningar som börjar med /orders
app.use("/carts", cartsRouter); // Använd cartRouter för alla förfrågningar som börjar med /cart
app.use(authRouter);

const PORT = 5000; // Definiera porten för servern
app.listen(PORT, () => { // Starta servern och lyssna på angiven port
  console.log(`Server körs på http://localhost:${PORT}`);
});
