// Detta är en middleware-funktion för att logga information om inkommande HTTP-förfrågningar och svar i en Express-applikation. Den loggar metod, URL, statuskod, IP-adress, användaragent, begärningskropp och svarstid.

const logger = (req, res, next) => {
  const startTime = Date.now(); // Startar tidtagning för requesten

  res.on("finish", () => { // Körs när svaret skickas till klienten
    const duration = Date.now() - startTime; // Beräknar svarstiden
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} 
    - Status: ${res.statusCode} 
    - IP: ${req.ip} 
    - User-Agent: ${req.headers["user-agent"]} 
    - Request Body: ${JSON.stringify(req.body)} 
    - Response Time: ${duration}ms`);
  });

  next();
};

module.exports = logger;

  