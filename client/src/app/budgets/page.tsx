"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import api, { getErrorMessage } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trash2, Edit2, Plus, X } from 'lucide-react';

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  monthlyLimit: z.number().positive('Limit must be positive'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100)
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface Budget {
  id: string;
  category: string;
  monthlyLimit: number | string;
  month: number;
  year: number;
}

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Housing', 'Utilities', 'Education', 'Healthcare', 'Shopping', 'Entertainment', 'Other'];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month: selectedMonth,
      year: selectedYear,
    }
  });

  const fetchBudgets = useCallback(async () => {
    try {
      const res = await api.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`);
      setBudgets(res.data);
      setError('');
    } catch {
      setError('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    let ignore = false;
    api.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`)
      .then((res) => {
        if (!ignore) {
          setBudgets(res.data);
          setError('');
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Failed to fetch budgets');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedMonth, selectedYear]);

  const openModal = (budget: Budget | null = null) => {
    if (budget) {
      setEditingId(budget.id);
      reset({
        category: budget.category,
        monthlyLimit: Number(budget.monthlyLimit),
        month: budget.month,
        year: budget.year,
      });
    } else {
      setEditingId(null);
      reset({
        category: '',
        monthlyLimit: undefined,
        month: selectedMonth,
        year: selectedYear,
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setError('');
  };

  const onSubmit = async (data: BudgetFormValues) => {
    setError('');
    try {
      if (editingId) {
        await api.patch(`/budgets/${editingId}`, data);
      } else {
        await api.post('/budgets', data);
      }
      fetchBudgets();
      closeModal();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save budget'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch {
      alert('Failed to delete budget');
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-input border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-input border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
            >
              {[...Array(5)].map((_, i) => (
                <option key={i} value={currentDate.getFullYear() - i}>
                  {currentDate.getFullYear() - i}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            <Plus size={20} />
            <span className="hidden md:inline">Add Budget</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card h-32 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          No budgets set for this month. Create one to start tracking!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b: Budget) => (
            <div key={b.id} className="bg-card p-6 rounded-2xl shadow-sm border border-border glass relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(b)} className="text-muted-foreground hover:text-primary"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(b.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16}/></button>
              </div>
              <h3 className="text-xl font-semibold mb-2">{b.category}</h3>
              <p className="text-2xl font-bold">${Number(b.monthlyLimit).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">Monthly Limit</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 relative shadow-xl">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Budget' : 'Add Budget'}</h2>
            
            {error && <div className="p-3 mb-4 text-destructive bg-destructive/10 rounded-md text-sm">{error}</div>}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  {...register('category')}
                  className="w-full bg-input border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a category</option>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Monthly Limit ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  {...register('monthlyLimit', { valueAsNumber: true })}
                  className="w-full bg-input border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
                {errors.monthlyLimit && <p className="mt-1 text-sm text-destructive">{errors.monthlyLimit.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Month</label>
                  <select 
                    {...register('month', { valueAsNumber: true })}
                    className="w-full bg-input border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <select 
                    {...register('year', { valueAsNumber: true })}
                    className="w-full bg-input border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                  >
                     {[...Array(5)].map((_, i) => (
                      <option key={i} value={currentDate.getFullYear() - i + 2}>
                        {currentDate.getFullYear() - i + 2}
                      </option>
                    ))}
                    {[...Array(5)].map((_, i) => (
                      <option key={i + 5} value={currentDate.getFullYear() - i - 1}>
                        {currentDate.getFullYear() - i - 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
