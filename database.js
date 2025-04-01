const path = require("path"); // Hantera filvägar
const Database = require("better-sqlite3"); // Använd SQLite

// Skapa anslutningen till databasen
const dbPath = path.join(__dirname, "db", "database.db"); // Sätt databasens filväg
const db = new Database(dbPath, { verbose: console.log }); // Skapa databasanslutningen

// Exportera anslutningen
module.exports = db;

