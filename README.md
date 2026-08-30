# LuxeDrive - Car Rental SaaS Platform

## Executive Overview

LuxeDrive is a scalable, multi-tenant SaaS platform built to revolutionize the car rental market in the Dominican Republic. This Next.js application provides a comprehensive solution for car rental businesses, offering both an intuitive customer-facing booking system and a robust admin dashboard for fleet management.

![LuxeDrive Platform](https://via.placeholder.com/800x400?text=LuxeDrive+Platform)

## 🏗️ Architecture & Tech Stack

### Core Architecture
- **Frontend**: Next.js 14 with TypeScript and React 18
- **Styling**: Tailwind CSS with Shadcn/UI component library
- **Backend**: Next.js API routes (serverless functions)
- **Database**: MongoDB (document-based NoSQL)
- **Authentication**: NextAuth.js with JWT
- **State Management**: React Context API
- **Forms & Validation**: React Hook Form with Yup/Zod schemas
- **API Communication**: Axios with interceptors

### Infrastructure
- **Deployment**: Containerized with Docker (development & production)
- **Database**: MongoDB Atlas (cloud-hosted)
- **Hosting**: AWS infrastructure (planned)
- **CI/CD**: GitHub Actions (planned)

## 🚀 Core Features

### Customer Portal
- **Vehicle Discovery**: Search, filter, and browse available vehicles
- **Booking System**: Complete rental reservation flow
- **User Management**: Registration, profiles, booking history
- **Multilingual Support**: English/Spanish localization

### Admin Dashboard
- **Fleet Management**: CRUD operations for vehicles
- **Rental Oversight**: Monitor and manage customer rentals
- **Analytics & Insights**: Performance metrics and reports
- **Staff Access Control**: Role-based permissions

## 🛠️ Development Environment Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- MongoDB 6+ (local or Atlas)
- Docker (optional for containerization)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/luxedrive.git
   cd luxedrive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the project root:
   ```
   MONGODB_URI=mongodb://localhost:27017/luxedrive
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Create an admin user**
   ```bash
   npm run create-admin
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Support (Optional)

For containerized development:
```bash
# Start MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Start the application
npm run dev
```

## 📦 Project Structure

The application follows a modular, feature-based architecture to enable maintainability and scalability:

```
luxedrive/
├── src/
│   ├── components/        # UI components
│   │   ├── admin/         # Admin dashboard components
│   │   ├── customers/     # Customer-facing components
│   │   └── ui/            # Shadcn/UI components
│   ├── lib/               # Core utilities
│   │   ├── api.ts         # API client functions
│   │   ├── db.ts          # Database connection
│   │   └── utils.ts       # Shared utilities
│   ├── middleware/        # Express middleware functions
│   │   ├── auth.ts        # Authentication middleware
│   │   ├── cors.ts        # CORS configuration
│   │   └── rateLimit.ts   # Rate limiting protection
│   ├── models/            # Mongoose data models
│   │   ├── Rental.ts      # Rental schema & model
│   │   ├── User.ts        # User schema & model
│   │   └── Vehicle.ts     # Vehicle schema & model
│   ├── pages/             # Next.js pages
│   │   ├── api/           # API routes
│   │   ├── admin/         # Admin dashboard routes
│   │   └── customer/      # Customer-facing routes
│   ├── styles/            # Global styles
│   └── utils/             # Helper functions
├── public/                # Static assets
└── tests/                 # Test suite
```

## 🧩 Key Components & Architecture

### Authentication Flow
The application uses NextAuth.js with a JWT strategy, supporting email/password authentication and role-based authorization (admin vs customer). Session management controls access to protected routes and API endpoints.

### Database Schema
MongoDB schemas are defined using Mongoose with TypeScript interfaces to provide type safety and data validation. Key models include:

- **User**: Authentication, profile, and role management
- **Vehicle**: Fleet management with availability tracking
- **Rental**: Booking records with associated user and vehicle

### API Architecture
The API follows REST principles with consistent error handling and response formatting:

- **Middleware Pipeline**: Authentication, rate limiting, CORS, request validation
- **Controlled Access**: Role-based permissions for different endpoints
- **Error Handling**: Standardized error responses with appropriate status codes

### UI Component Design
The UI follows a component-based architecture using Shadcn/UI primitives with Tailwind CSS for styling:

- **Atomic Design**: Building complex interfaces from simple components
- **Responsive Design**: Mobile-first approach for all interfaces
- **Accessibility**: WAI-ARIA compliant components

## 🧪 Testing Strategy

- **Unit Tests**: Jest for testing individual components and utilities
- **API Tests**: End-to-end testing of API endpoints
- **Integration Tests**: Testing component interactions

To run tests:
```bash
npm test
```

## 📈 Deployment & Scalability

### Deployment Options
- **Development**: Local environment with hot-reloading
- **Staging**: Containerized deployment with GitHub Actions
- **Production**: AWS infrastructure with load balancing

### Scaling Considerations
- **Horizontal Scaling**: Stateless architecture enables multiple instances
- **Database Scaling**: MongoDB Atlas with sharding capabilities
- **Caching Strategy**: API response caching and static generation where appropriate

## 🛣️ Roadmap & Future Enhancements

### Phase 1: Core Platform (Current)
- ✅ Basic vehicle management
- ✅ Customer booking flow
- ✅ Admin dashboard

### Phase 2: Enhanced Features
- ⬜ Analytics dashboard with actionable insights
- ⬜ Advanced filtering and search capabilities
- ⬜ Payment processing integration
- ⬜ PDF invoice generation

### Phase 3: Optimization & Expansion
- ⬜ Mobile application (React Native)
- ⬜ Damage assessment system with AI
- ⬜ Integration with local tourism platforms
- ⬜ Multi-tenant SaaS platform for multiple car rental businesses

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style (Prettier and ESLint configured)
- Write tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support & Contact

For support or inquiries about the platform, please contact:
- Technical Support: tech@luxedrive.com
- Business Inquiries: info@luxedrive.com

---

© 2025 LuxeDrive Car Rentals | Transforming the Car Rental Experience
