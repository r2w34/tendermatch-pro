# TenderMatch Pro

A comprehensive Indian government tender aggregation platform built with React frontend and Node.js backend.

## 🚀 Features

### ✅ Phase 1 - UI Structure (Completed)
- **Responsive React Frontend**: Modern, mobile-first design
- **Tender Cards**: Detailed tender information with status indicators
- **Advanced Filtering**: Search by state, category, budget, department
- **Real-time Data**: Connected to backend API
- **User Authentication**: Login/register functionality

### ✅ Phase 2 - Backend Development (Completed)
- **Node.js/Express API**: RESTful API with 15+ endpoints
- **PostgreSQL Database**: Robust data storage with proper indexing
- **JWT Authentication**: Secure user authentication with refresh tokens
- **Web Scraping Service**: Automated data collection from GeM and CPPP portals
- **Email Notifications**: User alerts and notifications
- **Admin Panel**: User and tender management

### ✅ Phase 3 - AI Integration (Completed)
- **AI Dashboard**: Comprehensive analytics with tender insights
- **Tender Analysis**: AI-powered evaluation and scoring
- **Bid Assistant**: Intelligent recommendations and guidance
- **Smart Alerts**: Personalized tender notifications
- **Gemini AI Integration**: Advanced natural language processing
- **Desktop Layout Optimization**: Fixed sidebar and modal coordination

### 📋 Phase 4 - Production Deployment (Planned)
- Cloud deployment (AWS/Azure/GCP)
- CI/CD pipeline with GitHub Actions
- Performance optimization and caching
- Security hardening and monitoring
- Load balancing and scaling

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Hooks
- Modern CSS with Flexbox/Grid
- Responsive design (Mobile-first)
- Component-based architecture

**Backend:**
- Node.js with Express.js
- PostgreSQL with connection pooling
- JWT authentication
- Bcrypt password hashing
- Winston logging
- Joi validation
- Rate limiting and security middleware
- Gemini AI integration
- Redis caching (optional)

**DevOps:**
- Git version control
- Environment-based configuration
- Database migrations
- Automated testing (Jest)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- PostgreSQL 12+
- Redis (optional, for AI caching)
- Gemini API key (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/r2w34/tendermatch-pro.git
cd tendermatch-pro
```

2. **Install dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

3. **Set up PostgreSQL**
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
sudo service postgresql start

# Create database
sudo -u postgres createdb tenderdb
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"
```

4. **Configure environment variables**
```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=TenderMatch Pro

# Backend (backend/.env) - Copy from .env.example
cp backend/.env.example backend/.env

# Edit backend/.env with your values:
DATABASE_URL=postgresql://postgres:password@localhost:5432/tenderdb
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
GEMINI_API_KEY=your-gemini-api-key-here
REDIS_URL=redis://localhost:6379  # Optional
```

5. **Initialize database and seed data**
```bash
cd backend
npm run seed
cd ..
```

6. **Start the application**
```bash
# Start backend (Terminal 1)
cd backend
npm start

# Start frontend (Terminal 2)
npm start
```

7. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

## 📁 Project Structure

```
tendermatch-pro/
├── src/                          # React frontend
│   ├── components/
│   │   ├── common/              # Header, Footer, Card components
│   │   ├── filters/             # FilterSidebar, SearchBar
│   │   ├── tenders/             # TenderList, TenderCard, TenderModal
│   │   └── ai/                  # AI Dashboard, Analysis, Assistant
│   ├── data/                    # Mock data and constants
│   ├── services/                # API service layer
│   ├── utils/                   # Utility functions
│   └── styles/                  # CSS styles
├── backend/                     # Node.js backend
│   ├── config/                  # Database and app configuration
│   ├── controllers/             # Route controllers
│   ├── models/                  # Database models
│   ├── routes/                  # API routes
│   ├── services/                # Business logic services
│   ├── middleware/              # Authentication and error handling
│   ├── utils/                   # Utility functions
│   └── scripts/                 # Database seeding scripts
└── public/                      # Static assets
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Tenders
- `GET /api/tenders` - Get all tenders with filtering
- `GET /api/tenders/:id` - Get tender by ID
- `GET /api/tenders/search` - Search tenders
- `GET /api/tenders/stats` - Get tender statistics
- `POST /api/tenders/:id/favorite` - Add to favorites
- `DELETE /api/tenders/:id/favorite` - Remove from favorites

### AI Features
- `POST /api/ai/analyze-tender` - AI-powered tender analysis
- `POST /api/ai/bid-assistance` - Get bid recommendations
- `GET /api/ai/dashboard-insights` - Get AI dashboard data
- `POST /api/alerts` - Create smart alert
- `GET /api/alerts` - Get user alerts
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### Admin (Protected)
- `POST /api/tenders` - Create tender
- `PUT /api/tenders/:id` - Update tender
- `DELETE /api/tenders/:id` - Delete tender
- `GET /api/auth/users` - Get all users
- `POST /api/scraper/run` - Run scraper

## 🧪 Testing

### Test Users
- **Admin**: admin@tendermatch.pro / admin123456
- **User**: user@example.com / user123456

### Sample Data
The database is seeded with 5 sample tenders covering:
- IT Equipment procurement
- Construction projects
- Medical equipment
- Software development
- Office supplies

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

### Database Operations
```bash
# Reset database
cd backend
npm run db:reset

# Seed database
npm run seed

# Run migrations
npm run migrate
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 🚀 Deployment

### Environment Setup
1. Set up production database
2. Configure environment variables
3. Build frontend assets
4. Deploy to cloud platform

### Production Commands
```bash
# Build frontend
npm run build

# Start production server
cd backend
npm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Government of India for open tender data
- GeM (Government e-Marketplace) portal
- CPPP (Central Public Procurement Portal)
- React and Node.js communities

## 📞 Support

For support, email support@tendermatch.pro or create an issue on GitHub.

---

**TenderMatch Pro** - Simplifying government tender discovery for businesses across India.