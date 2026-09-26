"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, PieChart, User } from 'lucide-react';
import { useAuth } from './AuthProvider';

export const Sidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Budgets', href: '/budgets', icon: PieChart },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen hidden md:flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">FinTrack</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};
