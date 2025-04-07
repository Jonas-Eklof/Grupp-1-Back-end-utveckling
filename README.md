**Grupp 1 Backend utveckling**

Projektet använder en Express baserad server med konfigurerade routes för att hantera förfrågningar till en databas.
Middlewares används för att logga, autentisera och kontrollera anrop till databasen.

---

**Installation**

Klona repo:t:  
`git clone https://github.com/Jonas-Eklof/Grupp-1-Back-end-utveckling.git`

`cd Grupp-1-Back-end-utveckling`

`npm install`

`node databasesetup.js` (Kör databasesetup.js som skapar mappen db i vilken databasen och tabeller skapas)

`node server.js` (Startar express servern)

Använd Insomnia för att testa endpoints enligt instruktioner nedan.

---

***Base URL:***
http://localhost:5000/

---

***Endpoints***

### GET `/about`
Returnerar information om företaget Airbean.

---

### GET `/guest-id`

**Beskrivning:**  
Simulerar tilldelningen av ett `guest_id` när man besöker sidan. Genererar ett unikt `guest_id` som används av gästanvändare för att hantera sin kundvagn.

**Svar – 200 OK**

```json
{
  "guest_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

### POST `/register`

**Beskrivning:**  
Skapa en ny användare med namn, email, adress och lösenord som obligatoriska fält

**Body:**

```json
[
  {
    "name": "Test User",
    "password": "testpassword",
    "email": "test@example.com",
    "address": "Testgatan 1"
  }
]
```

**Svar – 201 Created**

```json
{
  "message": "Användare skapad!"
}
```

**Svar – 400 Bad Request**

```json
{
  "errors": [
    {
      "msg": "Ogiltig e-postadress",
      "param": "email",
      "location": "body"
    }
  ]
}
```

```json
{
  "error": "E-postadressen finns redan"
}
```

---

### POST `/login`

**Beskrivning:**  
Logga in som en specifik användare och få tillgång till user_id och JWT-token.
Email och Password är obligatoriska fält.

**Body:**

```json
{
  "email": "test@example.com",
  "password": "testpassword"
}
```

**Svar – 200 OK**

```json
{
  "message": "Inloggad!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

**Svar - 400 (Bad Request)**

```json
{
  "errors": [
    {
      "msg": "Ogiltig e-postadress",
      "param": "email",
      "location": "body"
    }
  ]
}
```

```json
{
  "errors": [
    {
      "msg": "Lösenord krävs",
      "param": "password",
      "location": "body"
    }
  ]
}
```

```json
{
  "error": "Felaktig e-post eller lösenord"
}
```

**Svar – 404 Not Found**

```json
{
  "message": "Användaren hittades inte"
}
```

**Svar – 500 Serverfel**

```json
{
  "error": "Ett fel uppstod"
}
```

---

## Tips och felsökning

    Token har gått ut:
    Tokens är giltiga i 1 timme
    Gör en ny inloggning för att få en ny token

    Felaktigt användar-ID:
    Kontrollera att ID:t är korrekt kopierat
    ID:t ska vara i UUID-format (t.ex. "123e4567-e89b-12d3-a456-426614174000")

    Debug-information:
    Om du får 403-access nekad, kontrollera:
    Att token-användarens ID matchar det ID du försöker hämta
    Serverns konsol för debug-utskrifter (visas i terminalen där servern körs)

---

### GET `/users`

**Beskrivning:**  
Hämta alla användare i databasen för att enkelt visa att lösenord slumpgenererat ID och krypterat lösenord fungerar. Och för
att hämta user_id för vidare testning till endpoints.

**Svar – 200 OK**

```json
[
	{
		"user_id": "6447d6c5-0718-4b99-9867-b3b0efb7b654",
		"name": "Test User3",
		"email": "test3@example.com",
		"address": "Testgatan 2",
		"password": "$2b$10$c2g9yq4Y2EeYW5HIPKc93eQ4jTg20Wg3/0KhMHlFsiwNoHsBMlKIe"
	}
]
```

**Svar – 404 Not Found**
```json
{
  "message": "Inga användare hittades"
}
```

---

### GET `/users/:user_id`

**Beskrivning:**  
Hämta och visa en enskild användare i databasen.

**Headers:**

```json
{
    "Authorization": "Bearer <din token>"
}
```

**Parameter:**
user_id

**Svar – 200 OK**

```json
{
  "name": "Exempel",
  "email": "exempel@exempel.com",
  "address": "Strängnäs"
}

```

**Svar - 403 (Åkomst nekad)**
```json
{
    "error": "Åtkomst nekad"
}
```

**Svar – 404 Not Found**
```json
{
  "message": "Användaren hittades inte"
}
```

**Svar – 500 Serverfel**
```json
{
  "error": "Ett fel uppstod"
}
```

---

###  GET `/products`

**Beskrivning:**  
Denna del av API:t hanterar produkter (kaffesorter) i databasen. Data är hårdkodad i databasesetup.js och sparas i tabellen Products. Den här routen ger möjlighet att hämta hela menyn eller en enskild produkt via ID.

**Svar – (200 OK)**

```json
[
  {
    "product_id": 1,
    "name": "Bryggkaffe",
    "description": "En klassisk kopp med rund smak och tydlig arom.",
    "price": 39
  },
  {
    "product_id": 2,
    "name": "Cappuccino",
    "description": "Perfekt balans mellan espresso, mjölk och mjölkskum.",
    "price": 49
  }
]
```

**Fel - (500 Internal Server Error):**

```json
{ "error": "Kunde inte hämta menyn" }

```

###  GET `/products/:id`

**Svar - (200 OK):**

```json
{
  "product_id": 2,
  "name": "Cappuccino",
  "description": "Perfekt balans mellan espresso, mjölk och mjölkskum.",
  "price": 49
}

```

**Fel – (400 Bad Request)**

```json

{ "error": "Ogiltigt ID-format. ID måste vara ett positivt heltal." }

```

**Fel - (404 Not Found):**

```json

{ "error": "Produkten hittades inte" }

```

**Fel - (500 Internal Server Error):**

```json

{ "error": "Fel vid hämtning av produkt" }

```

---

### POST `/carts`

**Beskrivning:**  
Lägger till en produkt i kundvagnen. Gäller både `user_id` och `guest_id`. Om produkten redan finns uppdateras kvantiteten.

**Request Body (guest_id exempel):**

```json
{
  "guest_id": "123e4567...",
  "product_id": 2,
  "quantity": 1
}
```

**Request Body (user_id exempel):**

```json
{
  "user_id": "123e4567...",
  "product_id": 2,
  "quantity": 1
}
```

**Svar – 201 Created**

```json
{
  "message": "Produkt tillagd i kundvagnen!"
}
```

**Svar – 400 eller 404 (exempel):**

```json
{
  "message": "Alla fält (user_id, product_id, quantity) krävs."
}
```

```json
{
  "message": "Felaktiga datatyper."
}
```

```json
{
  "message": "Kvantitet måste vara ett heltal större än 0."
}
```

```json
{
  "message": "Produkten finns inte i menyn."
}
```

---

### DELETE `/carts/:cart_id`

**Beskrivning:**  
Tar bort en specifik produkt från kundvagnen baserat på `cart_id`.

**Svar – 200 OK**

```json
{
  "message": "Produkt borttagen från kundvagnen!"
}
```

**Svar – 404 Not Found**

```json
{
  "message": "Produkt ej hittad i kundvagnen"
}
```

---

### DELETE `/carts/:id`

**Beskrivning:**  
Tömmer hela kundvagnen för en användare **eller** gäst (`user_id` eller `guest_id`).

**Svar – 200 OK**

```json
{
  "message": "Kundvagn tömd!"
}
```

**Svar – 404 Not Found**

```json
{
  "message": "Ingen kundvagn att tömma."
}
```

---

### GET `/carts/:id`

**Beskrivning:**  
Hämtar innehållet i en användares eller gästs kundvagn. Automatisk rabatt på 10% vid 3 eller fler produkter.

**Svar – 200 OK**

```json
{
  "cartItems": [
    {
      "cart_id": 1,
      "name": "Cappuccino",
      "quantity": 2,
      "price": 49,
      "total_item_price": 98
    }
  ],
  "totalQuantity": 2,
  "discount": "0.00",
  "finalPrice": "98.00"
}
```

**Svar – 404 Not Found**

```json
{
  "message": "Ingen kundvagn hittades för denna användare."
}
```

---

### POST `/users/from-guest`

**Beskrivning:**  
Simulerar ifyllning av ett formulär för person-/användaruppgifter vid beställning. Används när en **gäst** vill slutföra sin beställning. Skapar en ny användare baserat på inskickade uppgifter och överför varukorgen från `guest_id` till `user_id`. (Vi vill inte att man ska kunna skapa en order som gäst, det är ok att fylla varukorgen som gäst men om man vill slutföra beställningen så behöver man ett user_id).

**Request Body:**

```json
{
  "guest_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "example@example.com",
  "password": "minst8tecken",
  "name": "Förnamn Efternamn",
  "address": "Adressgatan 12"
}
```

**Svar – 201 Created**

```json
{
  "message": "Användare skapad och varukorg överförd.",
  "user_id": "a1b2c3d4..."
}
```

---

### POST `/orders`

**Beskrivning:**  
Skapar en ny order från innehållet i en **registrerad användares** kundvagn. Gäster måste registrera sig först via `/users/from-guest`.

**Request Body:**

```json
{
  "user_id": "uuid-här"
}
```

**Svar – 201 Created**

```json
{
  "message": "Order skapad!",
  "order_id": 5,
  "order_date": "2025-04-02T13:12:34.000Z",
  "delivery_status": "pending",
  "discount": "13.00",
  "total_price": "117.00",
  "products": [
    {
      "name": "Bryggkaffe",
      "quantity": 2,
      "price": 39
    },
    {
      "name": "Latte",
      "quantity": 1,
      "price": 52
    }
  ]
}
```

**Svar – 404 Not Found**

```json
{
  "message": "Kundvagnen är tom, order kan inte skapas."
}
```

**Svar – 500 Server Error**

```json
{
  "message": "Serverfel vid orderläggning"
}
```

---

### GET `/user/:user_id`
**Beskrivning:**   
Hämtar alla ordrar kopplade till en viss användare.

**Svar - (200 OK)**

```json
[
  {
    "order_id": 1,
    "user_id": 101,
    "order_date": "2025-04-01",
    "total_amount": 150,
    "delivery_status": "pending"
  },
  {
    "order_id": 2,
    "user_id": 101,
    "order_date": "2025-04-02",
    "total_amount": 200,
    "delivery_status": "shipped"
  }
]
```

**Fel - (400 Bad Request)**
```json
{ "error": "User ID saknas" }
```

**Fel - (404 Not Found)**
```json
{ "error": "Inga ordrar hittades" }
````

**Fel (500 Internal Server Error)**
```json
{ "error": "Serverfel vid hämtning av ordrar" }
````
---

### GET `/orders/:order_id` 
**Beskrivning:**   
Hämtar detaljer för en enskild order via order_id.

**Svar (200 OK)**
```json
{
"order_id": 2,
  "user_id": 3,
  "total_price": 49,
  "delivery_status": "shipped",
  "created_at": "2025-04-02T10:13:00"
}
```

**Fel (400 Bad Request)**
```json
{ "error": "Order ID saknas"}
```

**Fel (404 Not Found)**
```json
{ "error": "Ordern hittades inte" }
```

**Fel (500 Internal Server Error)**
```json
{ "error": "Fel vid hämtning av order" }
````
---

### PUT `/orders/:id/delivery_status`
**Beskrivning:**   
Uppdaterar leveransstatus för en specifik order.

**Body-format (application/json)**
```json
{
"status": "shipped"
}
```
*Giltiga värden: "pending", "shipped", "delivered"*

**Svar (200 OK)**
```json
{ "message": "Order 2 uppdaterade till shipped" }
```

**Fel (400 Bad Request)** 
```json
{ "error": "Ogiltig status" }
```

**Fel (404 Not Found)**
```json
{ "error": "Ordern hittades inte" }
```

**Fel (500 Internal Server Error)**
```json
{ "error": "Serverfel vid uppdatering av order" }
```

---






***Websockets tankar***
Om vi vill lyfta användarupplevelsen och skapa en mer interaktiv webshop kan websockets vara en bra idé.
Chatfunktion/support skulle kunna implementeras för projektet.

Kunder:
Realtidsuppdateringar till kund om orderstatus samt lagersaldo.
Varukorg kan synkas mellan olika enheter om man använder på telefon och dator.
Man kan bygga FOMO genom att visa att till exempel 5 andra potentiella kunder tittar på denna produkt just nu.

Admin:
För admin/företaget kan också realtidsuppdateringar vara en fördel, man kan se ordrar komma in, användare som registrerar sig eller kanske vill använda chatten för att få support.
Förenklar analys och diagnostik.
Websockets kan även minska belastningen på servern jämfört med upprepade API-anrop.
