# Authentication Microservice

A robust RESTful API microservice built with TypeScript, featuring JWT authentication, rate limiting, Redis caching, and PostgreSQL database.

## Features

- **JWT Authentication**: Secure access and refresh token implementation
- **Rate Limiting**: Protect endpoints from abuse with configurable rate limits
- **Redis Caching**: Fast data retrieval with Redis integration
- **PostgreSQL Database**: Reliable data persistence with Prisma ORM
- **Security Best Practices**: Helmet, CORS, password hashing with bcrypt
- **Input Validation**: Request validation using express-validator
- **Comprehensive Logging**: Winston logger for debugging and monitoring
- **Docker Support**: Containerized application with Docker Compose
- **CI/CD Pipeline**: Automated testing and deployment with GitHub Actions
- **TypeScript**: Type-safe codebase

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Testing**: Jest with ts-jest
- **Logging**: Winston
- **Security**: Helmet, bcryptjs

## Prerequisites

- Node.js 20 or higher
- PostgreSQL 14 or higher
- Redis 7 or higher
- Docker and Docker Compose (optional)

## Installation

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd auth-microservice
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/auth_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
```

5. Generate Prisma Client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

7. Start development server:
```bash
npm run dev
```

### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. Run migrations inside container:
```bash
docker exec -it auth-microservice npm run prisma:migrate
```

## API Endpoints

### Public Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Protected Endpoints

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <access-token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Revoke All Tokens
```http
POST /api/auth/revoke-all
Authorization: Bearer <access-token>
```

### Health Check
```http
GET /health
```

## Project Structure

```
auth-microservice/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app setup
│   └── index.ts          # Entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── .github/
│   └── workflows/        # CI/CD pipelines
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── jest.config.js        # Jest configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | Access token expiry | 15m |
| `REFRESH_TOKEN_SECRET` | Refresh token secret | - |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiry | 7d |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## Security Features

- **Password Hashing**: Bcrypt with salt rounds of 12
- **JWT Tokens**: Secure token generation and validation
- **Rate Limiting**: Prevent brute force attacks
- **Helmet**: Security headers
- **Input Validation**: Sanitize and validate all inputs
- **CORS**: Configurable cross-origin policies
- **Session Management**: Track and revoke user sessions

## Database Schema

### Users Table
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `password`: String (Hashed)
- `firstName`: String (Optional)
- `lastName`: String (Optional)
- `isVerified`: Boolean
- `isActive`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `lastLoginAt`: DateTime (Optional)

### Refresh Tokens Table
- `id`: UUID (Primary Key)
- `token`: String (Unique)
- `userId`: UUID (Foreign Key)
- `expiresAt`: DateTime
- `isRevoked`: Boolean
- `createdAt`: DateTime

### Sessions Table
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `token`: String (Unique)
- `ipAddress`: String (Optional)
- `userAgent`: String (Optional)
- `expiresAt`: DateTime
- `createdAt`: DateTime

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Author

Your Name

## Acknowledgments

- Express.js community
- Prisma team
- TypeScript community
