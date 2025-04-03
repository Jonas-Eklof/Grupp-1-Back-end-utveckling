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
