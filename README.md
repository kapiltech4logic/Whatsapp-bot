# UniServe - WhatsApp User Journey Platform

Complete implementation of UniServe MVP with MongoDB, WhatsApp Bot Backend, and Vue.js Frontend.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- Git

### Start All Services

```bash
# Clone and navigate to project
cd UniServe

# Copy environment file
cp .env.example .env

# Edit .env and add your WhatsApp API credentials

# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### Services

| Service | URL | Description |
|---------|-----|-------------|
| MongoDB | `mongodb://localhost:27017` | Database |
| WhatsApp Bot API | `http://localhost:3000` | Backend API |
| Frontend UI | `http://localhost:5173` | Vue.js Dashboard |
| Nginx (optional) | `http://localhost:80` | Reverse Proxy |

## 📦 Project Structure

```
UniServe/
├── docker-compose.yml       # Multi-service orchestration
├── nginx.conf              # Nginx reverse proxy config
├── init-db.sql            # (Deprecated - using MongoDB)
├── .env                   # Environment variables
│
├── Whatsapp-bot/          # Backend API
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── controllers/   # API controllers
│   │   ├── routes/        # Express routes
│   │   ├── config/        # Configuration
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utilities
│   ├── index.js           # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── API_DOCUMENTATION.md
│
└── Uniserve_ui/           # Frontend Dashboard
    ├── src/
    │   ├── components/    # Vue components
    │   ├── pages/        # Page views
    │   └── composables/  # Vue composables
    ├── package.json
    ├── vite.config.js
    └── Dockerfile
```

## 🗄️ Database Schema

The application uses **MongoDB** with the following collections based on the MVP Database Schema:

### Collections:
1. **users** - User profiles and authentication
2. **user_preferences** - User settings and preferences
3. **sessions** - User session tracking
4. **session_flows** - User journey flow steps
5. **chat_messages** - WhatsApp conversation history
6. **analytics_events** - Event tracking for analytics
7. **dashboard_metrics** - Pre-aggregated metrics

See [MVP_DATABASE_SCHEMA.md](MVP_DATABASE_SCHEMA.md) for detailed schema documentation.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=adminpassword

# WhatsApp API
VERIFY_TOKEN=your_verify_token
PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_TOKEN=your_whatsapp_token

# Application
NODE_ENV=production
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### WhatsApp Business API Setup

1. Create a Meta (Facebook) Business Account
2. Set up WhatsApp Business API
3. Get your credentials:
   - Phone Number ID
   - WhatsApp Token
   - Verify Token (create your own)
4. Configure webhook URL: `http://your-domain:3000/webhook`

## 📚 API Documentation

See [Whatsapp-bot/API_DOCUMENTATION.md](Whatsapp-bot/API_DOCUMENTATION.md) for complete API reference.

### Quick API Examples

**Create a user:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "name": "John Doe",
    "language": "en"
  }'
```

**Create a session:**
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_here",
    "source": "QR_CODE",
    "channel": "WHATSAPP"
  }'
```

**Track an event:**
```bash
curl -X POST http://localhost:3000/api/analytics/events \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "eventCategory": "Engagement",
    "eventAction": "Button_Click",
    "eventLabel": "Browse_Products"
  }'
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild services
docker-compose up -d --build

# Remove volumes (⚠️ deletes data)
docker-compose down -v

# Access MongoDB shell
docker exec -it uniserve-mongodb mongosh -u admin -p adminpassword

# Access backend container
docker exec -it uniserve-whatsapp-bot sh
```

## 💻 Local Development

### Backend Development

```bash
cd Whatsapp-bot
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Frontend Development

```bash
cd Uniserve_ui
npm install
npm run dev
```

## 🔍 Features

### User Management
- ✅ User registration via phone number (E.164 format)
- ✅ User preferences and settings
- ✅ Automatic user type classification (NEW, RETURNING, ACTIVE, INACTIVE)
- ✅ Multi-language support

### Session Tracking
- ✅ Session lifecycle management
- ✅ Multi-channel support (WhatsApp, Web, Mobile)
- ✅ Source attribution (QR Code, Direct Link, Ad Click, etc.)
- ✅ Session duration tracking

### User Journey
- ✅ Flow step tracking
- ✅ Funnel analysis
- ✅ Journey reconstruction
- ✅ Conversion tracking

### Chat Management
- ✅ Complete conversation history
- ✅ Multi-format messages (text, image, interactive, etc.)
- ✅ Read receipts
- ✅ Bot/Agent/User differentiation

### Analytics
- ✅ Real-time event tracking
- ✅ Active user monitoring
- ✅ Event aggregation and statistics
- ✅ Pre-calculated daily metrics
- ✅ Real-time dashboard

## 📊 Dashboard Metrics

The system automatically calculates daily metrics:

- **Daily Active Users** - Unique users per day with breakdown by type
- **New Users** - New registrations
- **Total Sessions** - Session count with source breakdown
- **Average Session Duration** - Mean session length
- **Messages Sent** - Message volume by sender type
- **Bot Response Time** - Average response latency
- **User Retention** - 7-day retention rate

Calculate metrics manually:
```bash
curl -X POST http://localhost:3000/api/analytics/metrics/calculate \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-12-27"}'
```

## 🔐 Security Notes

- Change default MongoDB credentials in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement rate limiting for APIs
- Validate WhatsApp webhook signatures
- Use secure tokens for verify token

## 🚦 Health Checks

All services include health checks:

```bash
# Backend health
curl http://localhost:3000/health

# Check all services
docker-compose ps
```

## 📈 Monitoring

View real-time metrics:
```bash
curl http://localhost:3000/api/analytics/realtime
```

## 🛠️ Troubleshooting

**MongoDB connection issues:**
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

**Backend not starting:**
```bash
# Check logs
docker-compose logs whatsapp-bot

# Verify environment variables
docker exec uniserve-whatsapp-bot env | grep MONGODB
```

**Frontend build issues:**
```bash
# Rebuild frontend
docker-compose up -d --build uniserve-ui
```

## 📝 License

MIT

## 👥 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for UniServe MVP
