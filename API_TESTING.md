# DrukMatch API Testing Guide

This guide provides example requests for testing the DrukMatch API using curl, Postman, or any HTTP client.

## Base URL
```
http://localhost:5000/api
```

## 1. Authentication Flow

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User",
    "age": 28,
    "gender": "male",
    "dzongkhag": "Thimphu",
    "bio": "Testing DrukMatch API",
    "interests": ["Hiking", "Photography"],
    "preferred_gender": "female",
    "min_age": 24,
    "max_age": 32
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User",
    "age": 28,
    "gender": "male",
    "dzongkhag": "Thimphu"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Save the token for subsequent requests!

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Get Current User Profile
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 2. Profile Management

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio text",
    "occupation": "Software Engineer",
    "interests": ["Hiking", "Photography", "Cooking"]
  }'
```

### Upload Photo (Base64)
```bash
curl -X POST http://localhost:5000/api/users/upload-photo \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "photoData": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

### Delete Photo
```bash
curl -X DELETE http://localhost:5000/api/users/photo/0 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 3. Discovery & Swiping

### Get Potential Matches
```bash
curl -X GET "http://localhost:5000/api/discover?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "users": [
    {
      "id": 2,
      "name": "Deki Lhamo",
      "age": 26,
      "gender": "female",
      "dzongkhag": "Paro",
      "bio": "Teacher who loves reading",
      "profile_photos": ["photo1.jpg"],
      "interests": ["Reading", "Dancing"],
      "occupation": "Teacher",
      "zodiac_sign": "Rabbit"
    }
  ],
  "count": 1
}
```

### Swipe Right (Like)
```bash
curl -X POST http://localhost:5000/api/swipe \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUserId": 2,
    "swipeType": "like"
  }'
```

**Expected Response (No Match):**
```json
{
  "message": "Swipe recorded successfully",
  "swipeType": "like",
  "isMatch": false
}
```

**Expected Response (Match!):**
```json
{
  "message": "Swipe recorded successfully",
  "swipeType": "like",
  "isMatch": true,
  "matchId": 5
}
```

### Swipe Left (Pass)
```bash
curl -X POST http://localhost:5000/api/swipe \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUserId": 3,
    "swipeType": "pass"
  }'
```

## 4. Matches

### Get All Matches
```bash
curl -X GET http://localhost:5000/api/matches \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "matches": [
    {
      "match_id": 5,
      "matched_at": "2024-01-15T10:30:00.000Z",
      "matched_user_id": 2,
      "name": "Deki Lhamo",
      "age": 26,
      "gender": "female",
      "dzongkhag": "Paro",
      "bio": "Teacher who loves reading",
      "profile_photos": ["photo1.jpg"],
      "interests": ["Reading", "Dancing"],
      "occupation": "Teacher",
      "zodiac_sign": "Rabbit",
      "unread_count": 3
    }
  ],
  "count": 1
}
```

### Unmatch
```bash
curl -X DELETE http://localhost:5000/api/matches/5 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 5. Messaging

### Get Messages for a Match
```bash
curl -X GET "http://localhost:5000/api/messages/5?limit=50&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "sender_id": 2,
      "sender_name": "Deki Lhamo",
      "message_text": "Hello! How are you?",
      "sent_at": "2024-01-15T10:35:00.000Z",
      "read_at": null
    },
    {
      "id": 2,
      "sender_id": 1,
      "sender_name": "Test User",
      "message_text": "Hi! I'm good, thanks!",
      "sent_at": "2024-01-15T10:36:00.000Z",
      "read_at": "2024-01-15T10:36:30.000Z"
    }
  ],
  "count": 2
}
```

### Send Message
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": 5,
    "messageText": "Would you like to grab coffee sometime?"
  }'
```

### Mark Message as Read
```bash
curl -X PUT http://localhost:5000/api/messages/1/read \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Delete Message
```bash
curl -X DELETE http://localhost:5000/api/messages/2 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 6. Testing Complete Flow

Here's a complete test scenario using two users:

### Create User 1 (Tashi)
```bash
# Register
USER1_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tashi@test.com",
    "password": "Password123",
    "name": "Tashi",
    "age": 28,
    "gender": "male",
    "dzongkhag": "Thimphu",
    "preferred_gender": "female"
  }' | jq -r '.token')

echo "User 1 Token: $USER1_TOKEN"
```

### Create User 2 (Deki)
```bash
# Register
USER2_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "deki@test.com",
    "password": "Password123",
    "name": "Deki",
    "age": 26,
    "gender": "female",
    "dzongkhag": "Thimphu",
    "preferred_gender": "male"
  }' | jq -r '.token')

echo "User 2 Token: $USER2_TOKEN"
```

### User 1 discovers User 2
```bash
curl -X GET http://localhost:5000/api/discover \
  -H "Authorization: Bearer $USER1_TOKEN"
```

### User 1 likes User 2
```bash
curl -X POST http://localhost:5000/api/swipe \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetUserId": 2, "swipeType": "like"}'
```

### User 2 likes User 1 (Creates Match!)
```bash
MATCH_RESPONSE=$(curl -s -X POST http://localhost:5000/api/swipe \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetUserId": 1, "swipeType": "like"}')

MATCH_ID=$(echo $MATCH_RESPONSE | jq -r '.matchId')
echo "Match ID: $MATCH_ID"
```

### User 1 sends message
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"matchId\": $MATCH_ID, \"messageText\": \"Hi Deki! Nice to match with you!\"}"
```

### User 2 gets messages
```bash
curl -X GET "http://localhost:5000/api/messages/$MATCH_ID" \
  -H "Authorization: Bearer $USER2_TOKEN"
```

## Error Responses

### 400 Bad Request
```json
{
  "errors": [
    {
      "msg": "Valid email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Socket.io Testing

To test Socket.io connections, you can use a Socket.io client or the browser console:

```javascript
// In browser console (on frontend)
const socket = io('http://localhost:5000', {
  auth: { token: 'YOUR_TOKEN_HERE' }
});

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('join_match', 5); // Join match room
});

socket.on('new_message', (message) => {
  console.log('New message:', message);
});

socket.emit('send_message', {
  matchId: 5,
  messageText: 'Hello via Socket.io!'
});
```

## Postman Collection

Import these as a Postman collection for easier testing:

1. Create environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (will be set automatically)

2. Add to registration/login test scripts:
```javascript
// Save token from response
pm.environment.set("token", pm.response.json().token);
```

3. Use `{{token}}` in Authorization headers

Happy testing! 🎉
