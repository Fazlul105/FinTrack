import { z } from 'zod';
import { TransactionType } from '@prisma/client';

export const transactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional().transform(e => e?.trim() === '' ? undefined : e?.trim()),
  transactionDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});
