# ☕ AirBean API – Kundvagn & Order

Detta API hanterar användares kundvagnar och beställningar i projektet **AirBean**. Det innehåller endpoints för att visa, lägga till, ta bort och beställa produkter – både för inloggade användare och gäster.

---

## Validering (Middleware)

Alla `POST`-förfrågningar till `/carts` valideras med middleware innan de behandlas:

- **user_id** eller **guest_id** måste skickas (minst ett krävs)
- `product_id` måste vara ett heltal som existerar i menyn (Products-tabellen)
- `quantity` måste vara ett heltal större än 0

Om något av dessa krav inte uppfylls returneras ett tydligt felmeddelande.

---

## **Endpoints**

---

### GET `/guest-id`

**Beskrivning:**  
Genererar ett unikt `guest_id` som används av gästanvändare för att hantera sin kundvagn.

**Svar – 200 OK**

```json
{
  "guest_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

### POST `/users/from-guest`

**Beskrivning:**  
Används när en gäst vill slutföra sin beställning. Skapar en ny användare baserat på inskickade uppgifter och överför varukorgen från `guest_id` till `user_id`.

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

### POST `/carts`

**Beskrivning:**  
Lägger till en produkt i kundvagnen. Gäller både `user_id` och `guest_id`. Om produkten redan finns uppdateras kvantiteten.

**Request Body:**

```json
{
  "guest_id": "123e4567...",
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
