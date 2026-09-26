import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

const str = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

export const createBudget = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, monthlyLimit, month, year } = req.body as {
      category: string;
      monthlyLimit: number;
      month: number;
      year: number;
    };

    const existing = await prisma.budget.findUnique({
      where: {
        userId_category_month_year: {
          userId: req.user!.userId,
          category,
          month,
          year,
        },
      },
    });

    if (existing) {
      res.status(400).json({ error: 'Budget already exists for this category in the specified month and year' });
      return;
    }

    const budget = await prisma.budget.create({
      data: {
        userId: req.user!.userId,
        category,
        monthlyLimit,
        month,
        year,
      },
    });

    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

export const getBudgets = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { month, year } = req.query as { month?: string | string[]; year?: string | string[] };

    const whereClause: Record<string, unknown> = { userId: req.user!.userId };
    const monthVal = str(month);
    const yearVal = str(year);
    if (monthVal) whereClause.month = parseInt(monthVal);
    if (yearVal) whereClause.year = parseInt(yearVal);

    const budgets = await prisma.budget.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.json(budgets);
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { category, monthlyLimit, month, year } = req.body as {
      category?: string;
      monthlyLimit?: number;
      month?: number;
      year?: number;
    };

    const existing = await prisma.budget.findFirst({ where: { id, userId: req.user!.userId } });
    if (!existing) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    // Check if new combination creates a duplicate
    const checkCategory = category ?? existing.category;
    const checkMonth = month ?? existing.month;
    const checkYear = year ?? existing.year;

    const duplicate = await prisma.budget.findUnique({
      where: {
        userId_category_month_year: {
          userId: req.user!.userId,
          category: checkCategory,
          month: checkMonth,
          year: checkYear,
        },
      },
    });

    if (duplicate && duplicate.id !== id) {
      res.status(400).json({ error: 'Another budget already exists for this category in the specified month and year' });
      return;
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: {
        category: checkCategory,
        monthlyLimit: monthlyLimit ?? existing.monthlyLimit,
        month: checkMonth,
        year: checkYear,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.budget.findFirst({ where: { id, userId: req.user!.userId } });
    if (!existing) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    await prisma.budget.delete({ where: { id } });
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    next(error);
  }
};
