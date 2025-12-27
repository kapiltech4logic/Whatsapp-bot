# UniServe Backend API

Complete backend implementation based on the MVP Database Schema for WhatsApp-based user interaction platform.

## 🚀 Features

- **User Profile Management** - User registration, preferences, and profile management
- **Session Tracking** - Complete session lifecycle and user journey tracking  
- **Analytics & Events** - Comprehensive event tracking and analytics
- **Real-time Dashboard** - Pre-aggregated metrics for fast dashboard loading
- **Chat Messages** - Full conversation history with read receipts

## 📦 Tech Stack

- Node.js (v20+)
- Express.js
- MongoDB with Mongoose ODM
- Docker & Docker Compose

## 🗂️ Project Structure

```
Whatsapp-bot/
├── src/
│   ├── config/
│   │   ├── config.js          # Environment configuration
│   │   └── database.js        # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── UserPreference.js  # User preferences
│   │   ├── Session.js         # Session model
│   │   ├── SessionFlow.js     # Session flow tracking
│   │   ├── ChatMessage.js     # Chat messages
│   │   ├── AnalyticsEvent.js  # Analytics events
│   │   └── DashboardMetric.js # Dashboard metrics
│   ├── controllers/
│   │   ├── userController.js     # User management
│   │   ├── sessionController.js  # Session management
│   │   └── analyticsController.js # Analytics
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── sessionRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── webhookRoutes.js
│   ├── middleware/
│   │   └── logger.js
│   └── utils/
│       ├── constants.js
│       └── whatsapp.js
├── index.js                    # Entry point
├── package.json
└── Dockerfile
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### User Management (`/api/users`)

#### Get All Users
```http
GET /api/users?page=1&limit=20&userType=ACTIVE&search=John
```

#### Get User by ID
```http
GET /api/users/:id
```

#### Create or Get User
```http
POST /api/users
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "name": "John Doe",
  "language": "en"
}
```

#### Update User
```http
PUT /api/users/:id
Content-Type: application/json

{
  "name": "John Updated",
  "language": "hi"
}
```

#### Get User Preferences
```http
GET /api/users/:id/preferences
```

#### Set User Preference
```http
POST /api/users/:id/preferences
Content-Type: application/json

{
  "preferenceKey": "notifications_enabled",
  "preferenceValue": true
}
```

#### Update Multiple Preferences
```http
PUT /api/users/:id/preferences
Content-Type: application/json

{
  "preferences": {
    "notifications_enabled": true,
    "preferred_time_slot": "morning",
    "interests": ["electronics", "fashion"]
  }
}
```

#### Get User Stats
```http
GET /api/users/stats
```

### Session Management (`/api/sessions`)

#### Create Session
```http
POST /api/sessions
Content-Type: application/json

{
  "userId": "user_id_here",
  "source": "QR_CODE",
  "channel": "WHATSAPP",
  "metadata": {
    "device": "mobile"
  }
}
```

#### Get All Sessions
```http
GET /api/sessions?userId=xxx&source=QR_CODE&isActive=true
```

#### Get Session by ID
```http
GET /api/sessions/:id
```

#### End Session
```http
PUT /api/sessions/:id/end
```

#### Add Flow Step
```http
POST /api/sessions/:id/flows
Content-Type: application/json

{
  "flowStep": "MENU_MAIN",
  "stepData": {
    "selection": "Browse Products"
  }
}
```

#### Get Session Journey
```http
GET /api/sessions/:id/journey
```

#### Get Funnel Analysis
```http
GET /api/sessions/funnel?startDate=2025-01-01&endDate=2025-12-31
```

#### Add Message
```http
POST /api/sessions/:id/messages
Content-Type: application/json

{
  "sender": "USER",
  "messageType": "text",
  "contentPayload": {
    "body": "Hello, I need help"
  }
}
```

#### Get Conversation
```http
GET /api/sessions/:id/messages?limit=100
```

#### Mark Messages as Read
```http
PUT /api/sessions/:id/messages/read
```

### Analytics & Dashboard (`/api/analytics`)

#### Track Event
```http
POST /api/analytics/events
Content-Type: application/json

{
  "sessionId": "session_id",
  "userId": "user_id",
  "eventCategory": "Engagement",
  "eventAction": "Button_Click",
  "eventLabel": "Browse_Products",
  "eventValue": 1,
  "metadata": {
    "screen": "main_menu"
  }
}
```

#### Get Events
```http
GET /api/analytics/events?eventCategory=User&startDate=2025-01-01
```

#### Get Active Users
```http
GET /api/analytics/active-users?minutes=5
```

#### Get Event Stats
```http
GET /api/analytics/events/stats?startDate=2025-01-01&endDate=2025-12-31
```

#### Get Top Events
```http
GET /api/analytics/events/top?limit=10
```

#### Get Dashboard Metrics
```http
GET /api/analytics/metrics?startDate=2025-01-01&endDate=2025-12-31&category=Users
```

#### Get Today's Metrics
```http
GET /api/analytics/metrics/today
```

#### Calculate Daily Metrics
```http
POST /api/analytics/metrics/calculate
Content-Type: application/json

{
  "date": "2025-12-27"
}
```

#### Get Real-time Dashboard
```http
GET /api/analytics/realtime
```

#### Get User Engagement Metrics
```http
GET /api/analytics/engagement?startDate=2025-01-01
```

## 🔧 Environment Variables

Create a `.env` file in the `Whatsapp-bot` directory:

```env
# MongoDB
MONGODB_URI=mongodb://admin:adminpassword@localhost:27017/uniserve_mvp_db?authSource=admin

# WhatsApp
VERIFY_TOKEN=your_verify_token
PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_TOKEN=your_whatsapp_token

# Server
NODE_ENV=development
PORT=3000
```

## 🐳 Docker Setup

From the root directory:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f whatsapp-bot

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## 💻 Local Development

```bash
cd Whatsapp-bot

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## 📊 Database Models

### User
- Phone number (E.164 format)
- Name, language, user type
- First seen, last active timestamps
- Automatic user type classification

### Session
- User reference
- Source (QR_CODE, DIRECT_LINK, etc.)
- Channel (WHATSAPP, WEB, etc.)
- Start/end time, duration
- Active status, metadata

### SessionFlow
- Flow step tracking
- Step order and timestamp
- Custom step data

### ChatMessage
- Sender (USER, BOT, AGENT)
- Message type (text, image, interactive, etc.)
- Content payload
- Read status

### AnalyticsEvent
- Event category & action
- User and session references
- Event value and metadata
- Automatic user last_active update

### DashboardMetric
- Pre-aggregated daily metrics
- Metric category and name
- Breakdown data
- Automatic calculation support

## 🔍 Key Features

### Automatic User Type Classification
Users are automatically classified based on session count:
- **NEW**: 0-1 sessions
- **RETURNING**: 2-5 sessions
- **ACTIVE**: 6+ sessions
- **INACTIVE**: No activity in 30+ days

### Session Tracking
- Automatic session lifecycle management
- Flow step tracking for user journey analysis
- Complete conversation history

### Analytics
- Real-time active user tracking
- Event aggregation and statistics
- Funnel analysis
- Pre-calculated daily metrics

### Performance
- Indexed queries for fast lookups
- Pre-aggregated metrics for dashboard
- Efficient pagination support

## 📝 License

MIT
