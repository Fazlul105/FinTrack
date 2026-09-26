import { z } from 'zod';

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  monthlyLimit: z.number().positive('Monthly limit must be positive'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100)
});
