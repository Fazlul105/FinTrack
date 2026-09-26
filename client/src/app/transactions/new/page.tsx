"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api, { getErrorMessage } from '@/lib/api';
import { useRouter } from 'next/navigation';

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  transactionDate: z.string().min(1, 'Date is required'),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Housing', 'Utilities', 'Education', 'Healthcare', 'Shopping', 'Entertainment', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Other'];

export default function NewTransactionPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      transactionDate: new Date().toISOString().split('T')[0],
    }
  });

  const type = watch('type');
  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const onSubmit = async (data: TransactionFormValues) => {
    setError('');
    try {
      await api.post('/transactions', data);
      router.push('/transactions');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create transaction'));
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Add Transaction</h1>

        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
          {error && <div className="p-4 mb-6 text-destructive bg-destructive/10 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select 
                  {...register('type')}
                  className="w-full bg-input border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
                {errors.type && <p className="mt-1 text-sm text-destructive">{errors.type.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  className="w-full bg-input border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
                {errors.amount && <p className="mt-1 text-sm text-destructive">{errors.amount.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select 
                  {...register('category')}
                  className="w-full bg-input border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input 
                  type="date"
                  {...register('transactionDate')}
                  className="w-full bg-input border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.transactionDate && <p className="mt-1 text-sm text-destructive">{errors.transactionDate.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <textarea 
                {...register('description')}
                className="w-full bg-input border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                placeholder="What was this for?"
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
