---

##  **Endpoints**

---
**Beskrivning:**  
Denna del av API:t hanterar produkter (kaffesorter) i databasen. Data är hårdkodad i databasesetup.js och sparas i tabellen Products. Den här routen ger möjlighet att hämta hela menyn eller en enskild produkt via ID.

###  GET /products

**Svar – (200 OK)**

```
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

**Fel (500 Internal Server Error):**

```
{ "error": "Kunde inte hämta menyn" }

```

###  GET /products/:id

**Svar - (200 OK):**
```
{
  "product_id": 2,
  "name": "Cappuccino",
  "description": "Perfekt balans mellan espresso, mjölk och mjölkskum.",
  "price": 49
}

```

**Fel – (400 Bad Request)

```

{ "error": "Ogiltigt ID-format. ID måste vara ett positivt heltal." }

```

**Fel (404 Not Found):**

```json

{ "error": "Produkten hittades inte" }

```

**Fel (500 Internal Server Error):**

```json

{ "error": "Fel vid hämtning av produkt" }

```
