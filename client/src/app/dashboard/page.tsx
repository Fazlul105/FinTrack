"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import api from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { format } from 'date-fns';

interface SpendingCategory {
  name: string;
  value: number;
}

interface BudgetProgress {
  categoryId: string;
  category: string;
  spent: number;
  limit: number;
  percentageUsed: number;
}

interface RecentTransaction {
  id: string;
  transactionDate: string;
  category: string;
  description?: string | null;
  type: 'INCOME' | 'EXPENSE';
  amount: number | string;
}

interface DashboardSummary {
  totalBalance: number | string;
  monthlyIncome: number | string;
  monthlyExpense: number | string;
  spendingByCategory: SpendingCategory[];
  budgetProgress: BudgetProgress[];
  recentTransactions: RecentTransaction[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    let ignore = false;
    api.get(`/dashboard/summary?month=${month}&year=${year}`)
      .then((res) => {
        if (!ignore) {
          setData(res.data);
          setError('');
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Failed to load dashboard data');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [month, year]);

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <div className="flex gap-2">
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-input border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-input border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
          >
            {[...Array(5)].map((_, i) => (
              <option key={i} value={currentDate.getFullYear() - i}>
                {currentDate.getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card h-32 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-destructive bg-destructive/10 p-4 rounded-lg">{error}</div>
      ) : data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border glass">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold mt-4">${Number(data.totalBalance).toFixed(2)}</p>
            </div>
            
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border glass">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                <div className="p-2 bg-accent/10 rounded-full">
                  <ArrowUpRight className="w-5 h-5 text-accent" />
                </div>
              </div>
              <p className="text-3xl font-bold mt-4 text-accent">+${Number(data.monthlyIncome).toFixed(2)}</p>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border glass">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Monthly Expense</p>
                <div className="p-2 bg-destructive/10 rounded-full">
                  <ArrowDownRight className="w-5 h-5 text-destructive" />
                </div>
              </div>
              <p className="text-3xl font-bold mt-4 text-destructive">-${Number(data.monthlyExpense).toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Chart */}
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
              {data.spendingByCategory.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.spendingByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.spendingByCategory.map((_, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: unknown) => `$${Number(value || 0).toFixed(2)}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No expenses this month
                </div>
              )}
            </div>

            {/* Budget Progress */}
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h3 className="text-lg font-semibold mb-4">Budget Progress</h3>
              {data.budgetProgress.length > 0 ? (
                <div className="space-y-6">
                  {data.budgetProgress.map((budget: BudgetProgress) => (
                    <div key={budget.categoryId}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{budget.category}</span>
                        <span className="text-muted-foreground">
                          ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${budget.percentageUsed >= 100 ? 'bg-destructive' : budget.percentageUsed > 80 ? 'bg-orange-500' : 'bg-primary'}`} 
                          style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No budgets set for this month
                </div>
              )}
            </div>
            
            {/* Recent Transactions */}
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              {data.recentTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 rounded-l-lg">Date</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3 rounded-r-lg text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentTransactions.map((t: RecentTransaction) => (
                        <tr key={t.id} className="border-b border-border last:border-0">
                          <td className="px-6 py-4">{format(new Date(t.transactionDate), 'MMM d, yyyy')}</td>
                          <td className="px-6 py-4 font-medium">{t.category}</td>
                          <td className="px-6 py-4 text-muted-foreground">{t.description || '-'}</td>
                          <td className={`px-6 py-4 text-right font-semibold ${t.type === 'INCOME' ? 'text-accent' : 'text-foreground'}`}>
                            {t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent transactions found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
