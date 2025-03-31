const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {

// Här görs ett försök att hämta en Bearer Token från HTTP-headern "Authorization".

// "Authorization"-headern ser vanligtvis ut så här:
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...

// split(" ")[1] delar upp strängen vid mellanslaget ("Bearer token") och tar ut själva token-värdet.

// ?. (optional chaining) ser till att det inte blir ett fel om Authorization är undefined.


    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Åtkomst nekad" }); // Om ingen token skickas 

    try {
        // Verifierar token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Lägg till verifierad användare i request-objektet
        next();
    } catch (err) {
        res.status(401).json({ error: "Ogiltig token" });
    }
}

module.exports = authenticateToken;