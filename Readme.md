---

**Installation**

---

Klona repo:t:  
git clone https://github.com/Jonas-Eklof/Grupp-1-Back-end-utveckling.git

cd Grupp-1-Back-end-utveckling

node databasesetup.js (Kör databasesetup.js som skapar databasen och tabeller)
node server.js (Startar express servern)

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





