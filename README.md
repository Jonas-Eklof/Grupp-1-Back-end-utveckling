
# ☕ AirBean API – Kundvagn & Order

Detta API hanterar användares kundvagnar och beställningar i projektet **AirBean**. Det innehåller endpoints för att visa, lägga till, ta bort och beställa produkter från en användares kundvagn.

---

## Validering (Middleware)

Alla `POST`-förfrågningar till `/carts` valideras med middleware innan de behandlas:

- `user_id` måste vara en sträng (UUID-format)
- `product_id` måste vara ett heltal som existerar i menyn (Products-tabellen)
- `quantity` måste vara ett heltal större än 0

Om något av dessa krav inte uppfylls returneras ett tydligt felmeddelande.

---

## **Endpoints**

---

### GET `/carts/:user_id`

**Beskrivning:**  
Hämtar innehållet i en användares kundvagn inklusive totalpris, produktantal och eventuell rabatt (10% rabatt vid 3 eller fler produkter).

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

### POST `/carts`

**Beskrivning:**  
Lägger till en produkt i användarens kundvagn. Om produkten redan finns uppdateras kvantiteten.

**Request Body:**
```json
{
  "user_id": "uuid-här",
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
Tar bort en specifik produkt från användarens kundvagn baserat på `cart_id`.

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

### DELETE `/carts/user/:user_id`

**Beskrivning:**  
Tömmer hela kundvagnen för en specifik användare.

**Svar – 200 OK**
```json
{
  "message": "Kundvagn tömd!"
}
```

**Svar – 404 Not Found**
```json
{
  "message": "Ingen kundvagn att tömma"
}
```

---

### POST `/orders`

**Beskrivning:**  
Skapar en ny order från innehållet i användarens kundvagn. Om 3 eller fler produkter beställs, tillämpas 10% rabatt.

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