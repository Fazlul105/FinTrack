"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number | string;
  category: string;
  description?: string | null;
  transactionDate: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [sortBy, setSortBy] = useState('transactionDate');
  const [order, setOrder] = useState('desc');

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await api.get('/transactions', {
        params: { page, limit: 10, search, type, sortBy, order }
      });
      setTransactions(res.data.data);
      setTotalPages(res.data.meta.totalPages);
      setError('');
    } catch {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [page, search, type, sortBy, order]);

  useEffect(() => {
    let ignore = false;
    api.get('/transactions', {
      params: { page, limit: 10, search, type, sortBy, order }
    }).then((res) => {
      if (!ignore) {
        setTransactions(res.data.data);
        setTotalPages(res.data.meta.totalPages);
        setError('');
        setLoading(false);
      }
    }).catch(() => {
      if (!ignore) {
        setError('Failed to fetch transactions');
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [page, search, type, sortBy, order]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch {
      alert('Failed to delete transaction');
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <Link 
          href="/transactions/new" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          <span>Add Transaction</span>
        </Link>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="Search descriptions or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
          />
        </div>
        
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="bg-input border border-border text-foreground py-2 px-4 rounded-lg w-full md:w-auto outline-none"
        >
          <option value="">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>

        <select 
          value={`${sortBy}-${order}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split('-');
            setSortBy(s);
            setOrder(o);
          }}
          className="bg-input border border-border text-foreground py-2 px-4 rounded-lg w-full md:w-auto outline-none"
        >
          <option value="transactionDate-desc">Newest First</option>
          <option value="transactionDate-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      {error && <div className="p-4 mb-4 text-destructive bg-destructive/10 rounded-lg">{error}</div>}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="animate-pulse flex space-x-4 justify-center">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((t: Transaction) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">{format(new Date(t.transactionDate), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 font-medium">
                      <span className="bg-secondary px-2 py-1 rounded-md text-xs">{t.category}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{t.description || '-'}</td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? 'text-accent' : 'text-foreground'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/transactions/${t.id}/edit`}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-muted-foreground">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </AppLayout>
  );
}
