# FinTrack - Personal Finance Dashboard

FinTrack is a robust, full-stack personal finance application designed to help users track their income and expenses, set monthly budgets, and analyze their spending habits with intuitive visual dashboards.

## Main Features
- **User Authentication**: Secure registration and login using JWT stored in HTTP-only cookies and bcrypt password hashing.
- **Transaction Management**: Full CRUD operations for income and expense transactions with date, category, and description.
- **Budgeting**: Set, update, and monitor monthly spending limits for various expense categories with progress indicators.
- **Dashboard**: Real-time financial summaries (Total Balance, Monthly Income, Monthly Expense), spending breakdown charts (Recharts), and budget progress bars.
- **Search, Filtering & Pagination**: Filter transactions by date, category, and type (income/expense), plus keyword search and sorting.
- **Profile Management**: View account information and update personal profile details.

## Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript (strict mode), Tailwind CSS, Recharts, React Hook Form, Zod.
- **Backend**: Express.js 5, Node.js, TypeScript (strict mode), PostgreSQL, Prisma ORM 5.
- **Security**: Helmet, CORS with credentials, HTTP-only Cookies, bcrypt password hashing, express-rate-limit.
- **Testing**: 
  - **Backend**: Jest & Supertest (Auth, Transactions, Budgets API suites).
  - **Frontend**: Vitest & React Testing Library (API client, error handling, component testing).

## Architecture Overview
FinTrack follows a decoupled client-server architecture within a monorepo setup:
- `client/`: Next.js App Router frontend communicating with the API via Axios (`withCredentials: true`).
- `server/`: Express REST API interfacing with PostgreSQL via Prisma ORM.
- Schema validation is unified using **Zod** on both backend route handlers and frontend React Hook Form inputs.

---

## Local Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL server running locally (port `5432`)

### 1. Database & Server Setup
```bash
cd server
npm install

# Verify server/.env configuration:
# DATABASE_URL="postgresql://postgres:<password>@localhost:5432/fintrack?schema=public"
# JWT_SECRET="your_jwt_secret"
# PORT=5000

# Push Prisma schema to PostgreSQL & generate client
npx prisma db push

# Seed demo user and sample transactions/budgets
npx prisma db seed

# Run the backend dev server
npm run dev
```

### 2. Frontend Setup
```bash
cd ../client
npm install

# Verify client/.env.local configuration:
# NEXT_PUBLIC_API_URL="http://localhost:5000/api"

# Run the frontend dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials
After running `npx prisma db seed`:
- **Email**: `demo@fintrack.com`
- **Password**: `demo1234`

---

## Testing & Quality Assurance

### Run Backend Tests (Jest & Supertest)
```bash
cd server
npm test
```
*Runs all test suites: authentication, transaction CRUD & filtering, budget management & compound constraints (19 tests passed).*

### Run Frontend Tests (Vitest & React Testing Library)
```bash
cd client
npm test
```
*Runs all unit and component tests: API client, error extraction helpers, and UI navigation components (7 tests passed).*

### Run Type-Checking & Linting
- **Server type-check & build**:
  ```bash
  cd server
  npm run build
  ```
- **Client type-check & lint**:
  ```bash
  cd client
  npx tsc --noEmit
  npm run lint
  ```

---

## Production Build Commands

**Backend**:
```bash
cd server
npm run build
npm start
```

**Frontend**:
```bash
cd client
npm run build
npm start
```

---

## API Endpoint Summary
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & set HTTP-only cookie
- `POST /api/auth/logout` - Invalidate session & clear cookie
- `GET /api/auth/me` - Get authenticated user profile
- `PATCH /api/users/profile` - Update profile details
- `GET /api/transactions` - Paginated transactions with search, filters & sort
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Fetch single transaction
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/budgets` - Get monthly budgets with category breakdown
- `POST /api/budgets` - Create monthly budget
- `PATCH /api/budgets/:id` - Update budget limit
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/dashboard/summary` - Aggregate metrics, chart data & budget progress
