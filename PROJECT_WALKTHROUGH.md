# FinTrack Project Walkthrough

This document breaks down the FinTrack application to help explain the architecture, design choices, and technical details during an interview.

## 1. Overall Architecture
FinTrack uses a decoupled Client-Server architecture within a monorepo setup. 
- **Frontend**: Next.js App Router providing a highly interactive SPA-like experience for authenticated routes.
- **Backend**: Express.js REST API providing data via JSON.
- **Database**: PostgreSQL interfaced using Prisma ORM.

## 2. Authentication & Authorization
- **Authentication**: When a user logs in, the Express server verifies the credentials and creates a JWT (JSON Web Token). This token is signed with a secret and sent back to the browser inside an **HTTP-only cookie**. This prevents cross-site scripting (XSS) attacks since JavaScript cannot access the token.
- **Authorization**: Every protected route uses an `auth` middleware that verifies the JWT cookie. If valid, it attaches the `userId` to the request. For data requests (like updating a transaction), the server checks if the requested record's `userId` matches the authenticated `userId`.

## 3. Frontend-Backend Communication
The Next.js frontend uses `axios` to make HTTP requests. The axios client (`lib/api.ts`) is configured with `withCredentials: true`, ensuring that the HTTP-only JWT cookie is automatically sent with every cross-origin request to the API.

## 4. PostgreSQL Relations & Prisma
Prisma models abstract the SQL structure:
- A `User` has a one-to-many relation with `Transaction` and `Budget`.
- `Transaction` and `Budget` models store the `userId` as a foreign key.
- A unique compound constraint (`@@unique([userId, category, month, year])`) on the `Budget` model ensures a user cannot accidentally create duplicate budgets for the same category in a given month.

## 5. Why Prisma was selected
Prisma offers excellent type safety out of the box, generating a TypeScript client based on the database schema. It reduces boilerplate, prevents SQL injection by default, and makes writing complex database queries straightforward compared to raw SQL or traditional ORMs like Sequelize.

## 6. Pagination, Filtering, and Sorting
The `/api/transactions` endpoint handles pagination via `page` and `limit` query parameters, calculated as `skip` and `take` in Prisma. Filtering (by `type`, `category`, `search`) creates a dynamic `where` clause. Sorting utilizes an `orderBy` clause based on query strings (e.g., `transactionDate-desc`).

## 7. Calculating Monthly Financial Summaries
The `dashboardController` calculates summaries by fetching transactions between the first and last day of a specific month using JavaScript `Date` objects. It iterates through the transactions array in memory to tally `monthlyIncome`, `monthlyExpense`, and groups spending by `category` to build chart data.

## 8. Safe Money Handling
Money values are stored using the PostgreSQL `Decimal(12, 2)` type mapped via Prisma. On the Node.js backend, JavaScript's generic `Number` is used cautiously for simple summations. In a massive enterprise system, a library like `currency.js` or `BigInt` would be used for strict precision to avoid floating-point math issues.

## 9. Server vs. Client Components
Since this is an interactive dashboard heavily relying on React state, hooks (`useState`, `useEffect`), and browser APIs (`localStorage`/`cookies`), the UI heavily uses Client Components (`"use client"` directive). The Next.js layout (`layout.tsx`) and standard HTML shell remain Server Components.

## 10. Five Important Technical Decisions
1. **HTTP-only Cookies over LocalStorage**: Used for storing JWTs to prevent XSS attacks.
2. **Next.js App Router**: Chosen for modern routing and potential SSR benefits, even though the dashboard is highly client-side.
3. **Zod Validation**: Unified validation logic ensuring runtime safety for both Express inputs and React Hook Form inputs.
4. **Prisma ORM**: Provided rapid schema iteration and strict type safety across the backend.
5. **Tailwind CSS**: Allowed for rapid, atomic styling of a premium UI without relying on heavy third-party UI component libraries.

## 11. Five Bugs or Common Problems & Debugging Strategies
1. **CORS Errors**: Caused when frontend and backend origins don't match. Debug by checking the Express `cors()` config and ensuring `credentials: true`.
2. **Prisma Can't Reach Database**: Usually a wrong `DATABASE_URL` or PostgreSQL not running. Debug by verifying the connection string and using `psql` locally.
3. **JWT Verification Fails**: Usually due to an expired token or mismatched `JWT_SECRET`. Debug by inspecting the request headers/cookies in the network tab.
4. **TypeScript Type Mismatches with Prisma**: Happens when the DB schema changes. Fix by running `npx prisma generate` to update the types.
5. **State Sticking on Logout**: React state not clearing. Debug by ensuring `setUser(null)` and `router.push('/login')` are properly executed in the `AuthContext`.

## 12. 20 Likely Interview Questions

1. **Why did you use Next.js for this project?** -> For its built-in routing, optimized rendering, and ease of building modern React apps.
2. **How does your JWT authentication work?** -> A token is generated on login, stored in an HTTP-only cookie, and validated via middleware on protected routes.
3. **Why use HTTP-only cookies?** -> To mitigate XSS (Cross-Site Scripting) attacks from stealing the token.
4. **How do you protect users from accessing others' data?** -> Backend logic strictly filters queries using the `userId` decoded from the JWT.
5. **Why use Prisma instead of raw SQL?** -> Type safety, faster development speed, and easier migrations.
6. **Explain the `@@unique` constraint in your Budget model.** -> It guarantees no duplicate budgets exist for a specific user, category, and month combination.
7. **How is the dashboard data calculated?** -> Aggregating transactions in memory for the selected month to build income/expense totals and category groupings.
8. **How did you implement pagination?** -> Using `skip` and `take` in Prisma based on query parameters.
9. **Why use Zod?** -> For strict, declarative schema validation on both the client (forms) and server (API requests).
10. **How do you handle error states in React?** -> Using `try/catch` blocks around API calls and storing error messages in local component state to display to the user.
11. **Explain the difference between Client and Server components.** -> Client components execute in the browser (handling state/effects), while Server components render on the server (good for SEO/data fetching).
12. **What is Tailwind CSS and why use it?** -> A utility-first CSS framework allowing rapid, inline styling without context switching to CSS files.
13. **How did you handle floating-point precision?** -> Used PostgreSQL's `Decimal` type to store values exactly.
14. **What is CORS?** -> Cross-Origin Resource Sharing. A security feature that restricts how resources are requested from another domain.
15. **How would you scale this application?** -> Introduce Redis for caching dashboard summaries and rate-limiting.
16. **How do you manage environmental secrets?** -> `.env` files not committed to version control, storing database URLs and JWT secrets.
17. **What is `bcrypt` used for?** -> Hashing user passwords with a salt before storing them in the database.
18. **Why use a monorepo structure?** -> Keeps client and server code closely aligned and simplifies full-stack development locally.
19. **How did you make the UI responsive?** -> Used Tailwind's mobile-first breakpoints (e.g., `md:`, `lg:` prefixes).
20. **What was the hardest part of building this?** -> Managing complex dashboard state calculations and ensuring synchronized validation between frontend and backend.
