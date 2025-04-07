const path = require("path"); // Hantera filvägar
const Database = require("better-sqlite3"); // Använd SQLite
const dbPath = path.join(__dirname, "db", "database.db"); // Sätt databasens filväg
const db = new Database(dbPath, { verbose: console.log }); // Skapa databasanslutningen

// Skapa tabeller
db.exec(`
  CREATE TABLE IF NOT EXISTS Users (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS Products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS Orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_status TEXT NOT NULL,
    total_price TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
  )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS Order_Items (
      order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      FOREIGN KEY (order_id) REFERENCES Orders(order_id),
      FOREIGN KEY (product_id) REFERENCES Products(product_id)
    )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS Carts (
  cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  guest_id TEXT,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (product_id) REFERENCES Products(product_id),
  CHECK (user_id IS NOT NULL OR guest_id IS NOT NULL)
)
`);

console.log("Tabeller skapade!");

// Förbered en SQL-fråga för att lägga till produkter
const insertProduct = db.prepare(`
  INSERT INTO Products (name, description, price) VALUES (?, ?, ?)
`);

// Produkterna som ska läggas in
const products = [
  ["Bryggkaffe", "En klassisk kopp med rund smak och tydlig arom.", 39],
  ["Caffè Doppio", "Dubbel espresso för en kraftfull start på dagen.", 49],
  ["Cappuccino", "Balans mellan espresso, mjölk och skum.", 49],
  ["Latte Macchiato", "Mjölk med ett stänk av espresso.", 49],
  ["Kaffe Latte", "Dubbel espresso och ångad mjölk.", 54],
  ["Cortado", "Espresso med en skvätt varm mjölk.", 39],
];

// Kolla om produkterna redan finns i databasen
const count = db.prepare("SELECT COUNT(*) AS count FROM Products").get().count;
if (count === 0) {
  db.transaction(() => {
    products.forEach((product) => insertProduct.run(...product));
  })();
  console.log("Produkter har lagts till i databasen!");
} else {
  console.log("Produkter finns redan i databasen.");
}
