**Grupp 1 Backend utveckling**

Projektet använder en Express baserad server med konfigurerade routes för att hantera förfrågningar till en databas.
Middlewares används för att logga, autentisera och kontrollera anrop till databasen.

---

**Installation**

Klona repo:t:  
git clone https://github.com/Jonas-Eklof/Grupp-1-Back-end-utveckling.git

cd Grupp-1-Back-end-utveckling

node databasesetup.js (Kör databasesetup.js som skapar mappen db i vilken databasen och tabeller skapas)

node server.js (Startar express servern)

---

***Base URL:***
http://localhost:5000/

---

***Endpoints***

### GET `/about`
Returnerar information om företaget Airbean.

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





