import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { Sidebar } from '../components/Sidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

// Mock AuthProvider hook
vi.mock('../components/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Demo User', email: 'demo@fintrack.com' },
    logout: vi.fn(),
  }),
}));

describe('Sidebar component', () => {
  it('renders application brand title', () => {
    render(<Sidebar />);
    expect(screen.getByText('FinTrack')).toBeInTheDocument();
  });

  it('renders all main navigation links', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Budgets')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<Sidebar />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
