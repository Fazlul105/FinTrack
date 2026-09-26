import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getDashboardSummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { month, year } = req.query as { month?: string; year?: string };
    const userId = req.user!.userId;

    if (!month || !year) {
      res.status(400).json({ error: 'Month and year are required' });
      return;
    }

    const currentMonth = parseInt(month);
    const currentYear = parseInt(year);

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Compute total balance across ALL time (not just current month)
    const allTransactions = await prisma.transaction.findMany({
      where: { userId },
      select: { type: true, amount: true },
    });

    // Use string-based arithmetic to avoid floating-point issues
    let totalBalance = 0;
    for (const t of allTransactions) {
      const amt = Number(t.amount);
      totalBalance = t.type === 'INCOME' ? totalBalance + amt : totalBalance - amt;
    }
    // Round to 2 decimal places
    totalBalance = Math.round(totalBalance * 100) / 100;

    // Monthly transactions
    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: { gte: startDate, lte: endDate },
      },
    });

    let monthlyIncome = 0;
    let monthlyExpense = 0;
    const spendingByCategory: Record<string, number> = {};

    for (const t of monthlyTransactions) {
      const amt = Number(t.amount);
      if (t.type === 'INCOME') {
        monthlyIncome += amt;
      } else {
        monthlyExpense += amt;
        spendingByCategory[t.category] = (spendingByCategory[t.category] ?? 0) + amt;
      }
    }

    monthlyIncome = Math.round(monthlyIncome * 100) / 100;
    monthlyExpense = Math.round(monthlyExpense * 100) / 100;

    // Budgets for the period
    const budgets = await prisma.budget.findMany({
      where: { userId, month: currentMonth, year: currentYear },
    });

    let totalBudgetLimit = 0;
    const budgetProgress = budgets.map((b) => {
      const limit = Number(b.monthlyLimit);
      totalBudgetLimit += limit;
      const spent = Math.round((spendingByCategory[b.category] ?? 0) * 100) / 100;
      return {
        categoryId: b.id,
        category: b.category,
        limit: Math.round(limit * 100) / 100,
        spent,
        percentageUsed: limit > 0 ? Math.round((spent / limit) * 10000) / 100 : 0,
      };
    });

    const remainingBudget = Math.round((totalBudgetLimit - monthlyExpense) * 100) / 100;

    // Recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { transactionDate: 'desc' },
      take: 5,
    });

    // Spending chart data
    const spendingChartData = Object.entries(spendingByCategory).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));

    res.json({
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      remainingBudget,
      recentTransactions,
      spendingByCategory: spendingChartData,
      budgetProgress,
    });
  } catch (error) {
    next(error);
  }
};
