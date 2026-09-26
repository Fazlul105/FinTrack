import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { TransactionType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

type TransactionQuery = {
  page?: string | string[];
  limit?: string | string[];
  type?: string | string[];
  category?: string | string[];
  search?: string | string[];
  month?: string | string[];
  year?: string | string[];
  sortBy?: string | string[];
  order?: string | string[];
};

const str = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

export const createTransaction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, amount, category, description, transactionDate } = req.body as {
      type: TransactionType;
      amount: number;
      category: string;
      description?: string;
      transactionDate: string;
    };

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user!.userId,
        type,
        amount,
        category,
        description,
        transactionDate: new Date(transactionDate),
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      type,
      category,
      search,
      month,
      year,
      sortBy = 'transactionDate',
      order = 'desc',
    } = req.query as TransactionQuery;

    const pageNumber = Math.max(1, parseInt(str(page) ?? '1'));
    const limitNumber = Math.min(50, Math.max(1, parseInt(str(limit) ?? '10')));
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause: Record<string, unknown> = { userId: req.user!.userId };

    const typeVal = str(type);
    if (typeVal === 'INCOME' || typeVal === 'EXPENSE') {
      whereClause.type = typeVal as TransactionType;
    }
    const categoryVal = str(category);
    if (categoryVal) whereClause.category = categoryVal;

    const searchVal = str(search);
    if (searchVal) {
      whereClause.OR = [
        { description: { contains: searchVal, mode: 'insensitive' } },
        { category: { contains: searchVal, mode: 'insensitive' } },
      ];
    }

    const monthVal = str(month);
    const yearVal = str(year);
    if (monthVal && yearVal) {
      const startDate = new Date(parseInt(yearVal), parseInt(monthVal) - 1, 1);
      const endDate = new Date(parseInt(yearVal), parseInt(monthVal), 0, 23, 59, 59);
      whereClause.transactionDate = { gte: startDate, lte: endDate };
    } else if (yearVal) {
      const startDate = new Date(parseInt(yearVal), 0, 1);
      const endDate = new Date(parseInt(yearVal), 11, 31, 23, 59, 59);
      whereClause.transactionDate = { gte: startDate, lte: endDate };
    }

    const allowedSortFields = ['transactionDate', 'amount', 'createdAt'];
    const sortByVal = str(sortBy);
    const sortField = sortByVal && allowedSortFields.includes(sortByVal) ? sortByVal : 'transactionDate';
    const sortOrder = str(order) === 'asc' ? 'asc' : 'desc';

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limitNumber,
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    res.json({
      data: transactions,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { type, amount, category, description, transactionDate } = req.body as {
      type?: TransactionType;
      amount?: number;
      category?: string;
      description?: string;
      transactionDate?: string;
    };

    const existing = await prisma.transaction.findFirst({ where: { id, userId: req.user!.userId } });
    if (!existing) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        type: type ?? existing.type,
        amount: amount ?? existing.amount,
        category: category ?? existing.category,
        description: description !== undefined ? description : existing.description,
        transactionDate: transactionDate ? new Date(transactionDate) : existing.transactionDate,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.transaction.findFirst({ where: { id, userId: req.user!.userId } });
    if (!existing) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    await prisma.transaction.delete({ where: { id } });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};
