# DrukMatch - Bhutan's Dating Application

DrukMatch is a full-stack dating application specifically designed for Bhutan, incorporating cultural considerations and featuring all 20 dzongkhags. Built with modern technologies, it offers a Tinder-like experience with real-time chat, matching, and a beautiful user interface inspired by Bhutanese culture.

## Features

### Core Functionality
- **User Authentication**: Secure email/password registration and login with JWT tokens
- **Profile Management**: Create and edit profiles with up to 6 photos, bio, interests, and preferences
- **Smart Matching**: Swipe left (pass) or right (like) with intelligent match discovery
- **Real-time Chat**: WebSocket-based messaging with typing indicators and read receipts
- **Cultural Integration**: All 20 Bhutanese dzongkhags, zodiac signs, and bilingual support

### Technical Highlights
- Modern React frontend with TypeScript and Tailwind CSS
- RESTful API backend with Node.js and Express
- PostgreSQL database with optimized schema
- Socket.io for real-time communication
- Comprehensive test coverage (>70%)
- Mobile-responsive design
- Rate limiting and security measures

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io Client** for real-time features
- **Vitest** and React Testing Library for testing

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **Socket.io** for WebSocket connections
- **JWT** for authentication
- **bcrypt** for password hashing
- **Jest** and Supertest for testing

## Project Structure

```
tinder/
├── backend/
│   ├── database/
│   │   ├── schema.sql          # Database schema
│   │   └── seed.sql            # Sample seed data
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js     # Database connection
│   │   │   └── constants.js    # Bhutan-specific constants
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── swipeController.js
│   │   │   └── messageController.js
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT authentication
│   │   │   ├── validation.js   # Input validation
│   │   │   └── rateLimit.js    # Rate limiting
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── swipeRoutes.js
│   │   │   └── messageRoutes.js
│   │   ├── socket/
│   │   │   └── chatSocket.js   # Socket.io handlers
│   │   └── server.js           # Main server file
│   ├── __tests__/
│   │   ├── auth.test.js
│   │   ├── swipe.test.js
│   │   └── message.test.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── SwipeCard.tsx
│   │   │   └── MatchModal.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Discover.tsx
│   │   │   ├── Matches.tsx
│   │   │   ├── Chat.tsx
│   │   │   └── Profile.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── constants.ts
│   │   ├── __tests__/
│   │   │   ├── Login.test.tsx
│   │   │   ├── SwipeCard.test.tsx
│   │   │   └── MatchModal.test.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 13+
- Git

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb drukmatch
```

2. Run the schema to create tables:
```bash
psql -d drukmatch -f backend/database/schema.sql
```

3. (Optional) Load sample seed data:
```bash
psql -d drukmatch -f backend/database/seed.sql
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=drukmatch
DB_USER=your_username
DB_PASSWORD=your_password

JWT_SECRET=your_very_secure_secret_key_here
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
```

5. Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create environment file if needed:
```bash
# Create .env.local for custom configuration
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
echo "VITE_SOCKET_URL=http://localhost:5000" >> .env.local
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Running Tests

### Backend Tests
```bash
cd backend
npm test

# With coverage
npm test -- --coverage
```

### Frontend Tests
```bash
cd frontend
npm test

# With coverage
npm run test:coverage
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "name": "Tashi Dorji",
  "age": 28,
  "gender": "male",
  "dzongkhag": "Thimphu",
  "bio": "Love hiking and exploring dzongs",
  "interests": ["Hiking", "Photography"],
  "preferred_gender": "female",
  "min_age": 24,
  "max_age": 32
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user": { "id": 1, "email": "user@example.com", "name": "Tashi Dorji" },
  "token": "jwt_token_here"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "user": { "id": 1, "email": "user@example.com", "name": "Tashi Dorji" },
  "token": "jwt_token_here"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer {token}

Response: 200 OK
{
  "user": { /* full user object */ }
}
```

### User Management Endpoints

#### Get User Profile
```http
GET /api/users/profile/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "user": { /* user profile data */ }
}
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "bio": "Updated bio",
  "interests": ["New", "Interests"],
  "occupation": "Software Engineer"
}

Response: 200 OK
{
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

#### Upload Photo
```http
POST /api/users/upload-photo
Authorization: Bearer {token}
Content-Type: application/json

{
  "photoData": "base64_encoded_image_data"
}

Response: 200 OK
{
  "message": "Photo uploaded successfully",
  "photos": ["photo1", "photo2", ...]
}
```

### Swipe & Match Endpoints

#### Get Discover Users
```http
GET /api/discover?limit=10
Authorization: Bearer {token}

Response: 200 OK
{
  "users": [ /* array of potential matches */ ],
  "count": 10
}
```

#### Record Swipe
```http
POST /api/swipe
Authorization: Bearer {token}
Content-Type: application/json

{
  "targetUserId": 2,
  "swipeType": "like"
}

Response: 200 OK
{
  "message": "Swipe recorded successfully",
  "swipeType": "like",
  "isMatch": true,
  "matchId": 5
}
```

#### Get Matches
```http
GET /api/matches
Authorization: Bearer {token}

Response: 200 OK
{
  "matches": [ /* array of matches */ ],
  "count": 3
}
```

#### Unmatch
```http
DELETE /api/matches/:matchId
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Unmatched successfully"
}
```

### Message Endpoints

#### Get Messages
```http
GET /api/messages/:matchId?limit=100&offset=0
Authorization: Bearer {token}

Response: 200 OK
{
  "messages": [ /* array of messages */ ],
  "count": 15
}
```

#### Send Message
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "matchId": 5,
  "messageText": "Hello! How are you?"
}

Response: 201 Created
{
  "message": "Message sent successfully",
  "data": { /* message object */ }
}
```

## Socket.io Events

### Client → Server Events
- `join_match` - Join a match room for real-time updates
- `leave_match` - Leave a match room
- `send_message` - Send a message (also persisted via API)
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `new_match` - Notify other user of new match

### Server → Client Events
- `new_message` - Receive new message in real-time
- `message_notification` - Notification for messages in other matches
- `match_notification` - Notification of new match
- `user_typing` - Other user is typing
- `user_stopped_typing` - Other user stopped typing

## Bhutan-Specific Data

### 20 Dzongkhags (Districts)
Bumthang, Chhukha, Dagana, Gasa, Haa, Lhuntse, Mongar, Paro, Pemagatshel, Punakha, Samdrup Jongkhar, Samtse, Sarpang, Thimphu, Trashigang, Trashiyangtse, Trongsa, Tsirang, Wangdue Phodrang, Zhemgang

### Zodiac Signs
- Aries
- Taurus
- Gemini
- Cancer
- Leo
- Virgo
- Libra
- Scorpio
- Sagittarius
- Capricorn
- Aquarius
- Pisces

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- SQL injection prevention with parameterized queries
- XSS protection

## Design Considerations

- **Colors**: Bhutanese flag-inspired (yellow, orange, red)
- **Mobile-first**: Responsive design for all screen sizes
- **Accessibility**: Semantic HTML and ARIA labels
- **Performance**: Optimized images, code splitting, lazy loading
- **UX**: Smooth animations, loading states, error handling

## Sample Seed Data

The database includes 6 sample users for testing:
- Tashi Dorji (28, Male, Thimphu)
- Deki Lhamo (26, Female, Paro)
- Karma Tenzin (30, Male, Punakha)
- Pema Yangchen (25, Female, Thimphu)
- Sonam Wangchuk (32, Male, Bumthang)
- Choden Wangmo (27, Female, Paro)

Default test password: `Password123!`

## Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Update `JWT_SECRET` to a strong, random value
3. Configure PostgreSQL connection for production
4. Set up SSL/TLS certificates
5. Use a process manager like PM2

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Serve the `dist` folder with a static server
3. Update API URLs in environment variables
4. Configure CORS on backend for production domain

## Contributing

This is a demonstration project showcasing full-stack development capabilities with cultural awareness for Bhutanese users.

## License

MIT License - Educational/Portfolio Project

## Author

Built as a comprehensive full-stack dating application for Bhutan

---

For questions or issues, please refer to the documentation above or check the inline code comments.
