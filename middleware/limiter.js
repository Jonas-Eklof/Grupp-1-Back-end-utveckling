// Denna fil innehåller en middleware för att begränsa antalet förfrågningar
// till servern för att skydda mot överbelastning och potentiella attacker.
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 minuter
  max: 150, // Max 150 förfrågningar per IP
});

module.exports = limiter; // Exportera limiter så att den kan användas i andra filer
