# Registrera ny användare:

## POST "/register"

body:
{
"email": "test@test.com",
"password": "test",
"name": "Test Användare",
"address": "Testgatan 1"
}

### Möjlig respons:

201 Created
{
"message": "Användare skapad!"
}

400 Bad Request
{
"errors": [
{
"msg": "Ogiltig e-postadress",
"param": "email",
"location": "body"
}
]
}

# Logga in som användare

## POST "/login"

body:
{
"email": "test@test.com",
"password": "test"
}

### Möjlig respons:

200 OK
{
"message": "Inloggad!",
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
"user": {
"id": "123e4567-e89b-12d3-a456-426614174000",
"name": "Test Användare",
"email": "test@test.com"
}
}

400 Bad Request
{
"error": "Felaktig e-post eller lösenord"
}

# Se användares sida

## GET "/users/:id"

/users/<DITT_USER_ID> // user-id som du får vid inloggningen,

exempel: http://localhost:5000/users/123e4567-e89b-12d3-a456-426614174000

### Headers:

|Header| |Value|
Authorization Bearer <DIN_TOKEN> // Token som du får vid inloggningen

### Möjlig respons:

200 OK
{
"name": "Test Användare",
"address": "Testgatan 1",
"email": "test@test.com"
}

401 Unauthorized
{
"error": "Åtkomst nekad"
}

403 Forbidden
{
"error": "Åtkomst nekad"
}

404 Not Found
{
"error": "Användaren hittades inte"
}

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
