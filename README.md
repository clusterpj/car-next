# LuxeDrive Car Rental App

## Overview

LuxeDrive is a modern, full-stack car rental application built for the Dominican Republic market. It provides an efficient admin dashboard for car rental businesses and an intuitive interface for customers to rent luxury vehicles.

### Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **API**: RESTful API with advanced features
- **Testing**: Jest
- **Deployment**: Docker (planned)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- Docker (for running MongoDB, optional)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/luxedrive-car-rental.git
   cd luxedrive-car-rental
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```
   MONGODB_URI=mongodb://localhost:27017/car_rental_db
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Features

- User authentication (admin and customer roles)
- Vehicle management (CRUD operations)
- Booking system
- Admin dashboard
- Customer-facing car browsing and reservation
- Advanced filtering and pagination for vehicle listings
- Rate limiting and CORS protection
- Comprehensive error handling and logging

## Project Structure

```
luxedrive-car-rental/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── CarManagement.tsx
│   │   │   └── RentalManagement.tsx
│   │   ├── customer/
│   │   │   ├── BookingForm.tsx
│   │   │   └── CarList.tsx
│   │   └── Layout.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── db.ts
│   │   └── mongodb.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── cors.ts
│   │   ├── rateLimit.ts
│   │   └── validateRequest.ts
│   ├── models/
│   │   ├── Rental.ts
│   │   ├── User.ts
│   │   └── Vehicle.ts
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth].ts
│   │   │   └── vehicles/
│   │   │       └── index.ts
│   │   ├── admin/
│   │   │   ├── dashboard.tsx
│   │   │   ├── cars.tsx
│   │   │   └── rentals.tsx
│   │   ├── customer/
│   │   │   ├── booking.tsx
│   │   │   └── search.tsx
│   │   ├── _app.tsx
│   │   └── index.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── auth.ts
│       ├── helpers.ts
│       └── logger.ts
├── public/
├── tests/
│   └── api/
│       └── vehicles.test.ts
├── .env.local
├── next.config.js
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Development Guidelines

### Code Style

- We use ESLint for linting and Prettier for code formatting.
- Run `npm run lint` to check for linting errors.
- Run `npm run format` to automatically format code.

### API Development

- All API routes should be placed in the `src/pages/api` directory.
- Use the provided middleware (auth, rate limiting, CORS) for all API routes.
- Implement proper error handling and use the custom logger for all API operations.

### Testing

- Write unit tests for all API routes and utility functions.
- Place test files in the `tests` directory, mirroring the `src` directory structure.
- Run tests using `npm test`.

### Commit Guidelines

- Use conventional commit messages: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore

## Deployment

(Instructions for deployment will be added in future updates)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.