"use client";

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, PieChart, User } from 'lucide-react';

export const Topbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Budgets', href: '/budgets', icon: PieChart },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 md:px-8 z-20">
        <div className="flex items-center md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-foreground p-2">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="ml-2 text-xl font-bold text-primary">FinTrack</span>
        </div>
        
        <div className="hidden md:flex items-center justify-between w-full">
          <h2 className="text-lg font-medium text-foreground capitalize">
            {pathname.split('/')[1] || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Hello, {user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background z-10 p-4 border-t border-border flex flex-col">
          <nav className="flex-1 space-y-2 mt-4">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
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
          <div className="p-4 border-t border-border mt-auto">
             <div className="flex items-center space-x-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                 {user?.name?.[0]?.toUpperCase()}
               </div>
               <div>
                 <p className="text-sm font-medium">{user?.name}</p>
                 <p className="text-xs text-muted-foreground">{user?.email}</p>
               </div>
             </div>
             <button
               onClick={() => {
                 setMobileMenuOpen(false);
                 logout();
               }}
               className="w-full text-center px-4 py-2 text-sm text-destructive border border-destructive/30 rounded-md hover:bg-destructive/10 transition-colors"
             >
               Logout
             </button>
          </div>
        </div>
      )}
    </>
  );
};
