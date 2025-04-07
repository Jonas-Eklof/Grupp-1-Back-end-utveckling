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
