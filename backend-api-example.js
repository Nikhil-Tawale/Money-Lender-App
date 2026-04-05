// Example Backend API Implementation for PUT /api/users/:id
// This is a reference for implementing the backend endpoint

/*
PUT /api/users/:id
Headers:
  - Authorization: Bearer <token>
  - Content-Type: application/json

Request Body (Partial<User>):
{
  "name": "John Doe Updated",
  "phone": "+1234567890",
  "email": "john@example.com",
  "borrowedAmount": 6000,
  "interestRate": 12,
  "returnDate": "2026-06-15T00:00:00.000Z",
  "reminderDay": 15,
  "enableReminder": true
}

Response (200 OK):
{
  "_id": "user_id_here",
  "id": "user_id_here",
  "name": "John Doe Updated",
  "phone": "+1234567890",
  "email": "john@example.com",
  "address": "123 Main St",
  "borrowedAmount": 6000,
  "interestRate": 12,
  "returnDate": "2026-06-15T00:00:00.000Z",
  "reminderDay": 15,
  "enableReminder": true,
  "payments": [...],
  "createdAt": "2026-01-01T00:00:00.000Z"
}

Error Responses:
401 Unauthorized: { "message": "Invalid or expired token" }
404 Not Found: { "message": "User not found" }
400 Bad Request: { "message": "Invalid data provided" }
500 Internal Server Error: { "message": "Failed to update user" }
*/