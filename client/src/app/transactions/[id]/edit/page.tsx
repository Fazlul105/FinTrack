"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api, { getErrorMessage } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

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

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
  });

  const type = watch('type');
  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await api.get(`/transactions/${id}`);
        const tx = res.data;
        reset({
          type: tx.type,
          amount: Number(tx.amount),
          category: tx.category,
          description: tx.description || '',
          transactionDate: new Date(tx.transactionDate).toISOString().split('T')[0],
        });
      } catch {
        setError('Failed to load transaction');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTx();
  }, [id, reset]);

  const onSubmit = async (data: TransactionFormValues) => {
    setError('');
    try {
      await api.patch(`/transactions/${id}`, data);
      router.push('/transactions');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update transaction'));
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Edit Transaction</h1>

        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
          {error && <div className="p-4 mb-6 text-destructive bg-destructive/10 rounded-lg text-sm">{error}</div>}

          {loading ? (
             <div className="animate-pulse space-y-6">
               <div className="h-10 bg-muted rounded"></div>
               <div className="h-10 bg-muted rounded"></div>
             </div>
          ) : (
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
                  {isSubmitting ? 'Saving...' : 'Update Transaction'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
