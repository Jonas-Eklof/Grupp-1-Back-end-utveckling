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

---

## **Endpoints**

---

### GET/user/:user_id
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

### GET/orders/:order_id 
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

### PUT/orders/:id/delivery_status
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

##  **Endpoints**

---
**Beskrivning:**  
Denna del av API:t hanterar produkter (kaffesorter) i databasen. Data är hårdkodad i databasesetup.js och sparas i tabellen Products. Den här routen ger möjlighet att hämta hela menyn eller en enskild produkt via ID.

###  GET /products

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

###  GET /products/:id

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
