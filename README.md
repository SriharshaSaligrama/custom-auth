# Custom Authentication System in Next.js

## Project Overview
This is a modern authentication system built with Next.js, featuring both traditional email/password authentication and OAuth integration (specifically Google OAuth). The project uses PostgreSQL for data storage, Redis for session management, and follows best practices for security and user management.

## Technical Stack
- **Frontend Framework**: Next.js 15.3 (Canary)
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Redis (Upstash/Redis)
- **Styling**: TailwindCSS
- **Form Validation**: Zod
- **UI Components**: Radix UI
- **TypeScript**: For type safety

## Core Features

### 1. Authentication Methods
- **Traditional Authentication**
  - Email/Password Sign Up
  - Email/Password Sign In
- **OAuth Authentication**
  - Google OAuth integration
  - Extensible structure for adding more providers

### 2. User Management

#### Database Schema
```typescript
Users Table:
- id: UUID (Primary Key)
- name: Text
- email: Text (Unique)
- password: Text (Hashed)
- salt: Text
- role: Enum ('admin' | 'user')
- createdAt: Timestamp
- updatedAt: Timestamp

OAuth Accounts Table:
- userId: UUID (Foreign Key)
- provider: Enum ('google')
- providerAccountId: Text
- createdAt: Timestamp
- updatedAt: Timestamp
```

### 3. Security Features
1. **Password Security**
   - Custom password hashing implementation
   - Unique salt per user
   - Secure password comparison

2. **Session Management**
   - Redis-based session storage
   - Secure session tokens
   - Automatic session cleanup

3. **OAuth Security**
   - Secure state management
   - Token validation
   - Scope-based permissions

## Application Flow

### 1. Traditional Authentication Flow

#### Sign Up Process:
1. User submits sign-up form with name, email, and password
2. Form data is validated using Zod schema
3. System checks for existing user with same email
4. If email is unique:
   - Generates salt
   - Hashes password with salt
   - Creates new user record
   - Creates session
   - Redirects to home page

#### Sign In Process:
1. User submits login form with email and password
2. System validates input
3. Finds user by email
4. Compares hashed password
5. If valid:
   - Creates session
   - Redirects to home page

### 2. OAuth Authentication Flow

#### Google OAuth Process:
1. User clicks "Sign in with Google" button
2. System redirects to Google OAuth consent screen
3. User authorizes application
4. Google redirects back with authorization code
5. System:
   - Validates OAuth state
   - Exchanges code for tokens
   - Fetches user information
   - Creates/Updates user record
   - Creates session
   - Redirects to home page

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   │   ├── sign-in/       # Sign in page
│   │   └── sign-up/       # Sign up page
│   └── api/               # API routes
├── auth/                  # Authentication logic
│   ├── core/             # Core authentication functionality
│   │   ├── oauth/        # OAuth implementations
│   │   ├── session.ts    # Session management
│   │   └── password-hasher.ts
│   └── nextjs/           # Next.js specific implementations
├── components/           # Reusable components
├── db/                  # Database configuration and schema
├── redis/              # Redis configuration
└── types/              # TypeScript type definitions
```

## Security Considerations
1. **Password Security**
   - Passwords are never stored in plain text
   - Each user has a unique salt
   - Industry-standard hashing algorithms

2. **Session Security**
   - Session tokens are securely generated
   - Sessions are stored in Redis
   - Automatic session expiration

3. **OAuth Security**
   - State parameter validation
   - Secure token handling
   - Limited scope access

## Frontend Components
1. **Authentication Forms**
   - Sign In Form
   - Sign Up Form
   - OAuth Login Button
   - Logout Button

2. **UI Components**
   - Custom Button
   - Form Input
   - Password Input
   - Form Error Message
   - Label
   - Card

## Getting Started

### Prerequisites
1. Node.js (version 18 or higher)
2. PostgreSQL database
3. Redis instance (can use Upstash Redis)
4. Google OAuth credentials

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Redis
REDIS_URL=your_redis_connection_string
REDIS_TOKEN=your_redis_token

# Google OAuth
OAUTH_REDIRECT_URL_BASE=your_oauth_redirect_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Installation
1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
pnpm install
```

3. Set up the database
```bash
pnpm drizzle-kit push:pg
```

4. Run the development server
```bash
pnpm dev
```

The application should now be running at `http://localhost:3000`

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
