import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error';
import authRouter from './routes/auth';
import transactionsRouter from './routes/transactions';
import budgetsRouter from './routes/budgets';
import dashboardRouter from './routes/dashboard';
import usersRouter from './routes/users';

dotenv.config();

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Centralized error handler — must be last
app.use(errorHandler);

export default app;
