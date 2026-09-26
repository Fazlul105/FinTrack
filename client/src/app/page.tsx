import Link from 'next/link';
import { ArrowRight, ShieldCheck, PieChart, Wallet } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="px-6 py-4 flex justify-between items-center border-b border-border">
        <div className="text-2xl font-bold text-primary">FinTrack</div>
        <div className="space-x-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Log in</Link>
          <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">Sign up</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Master Your <span className="text-primary">Finances</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          Securely record your income and expenses, manage monthly budgets, and analyze your spending habits with our powerful and intuitive dashboard.
        </p>
        <Link href="/register" className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 transition-transform hover:scale-105">
          <span>Get Started</span>
          <ArrowRight size={20} />
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto text-left">
          <div className="p-6 rounded-2xl bg-card border border-border glass">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Wallet className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Everything</h3>
            <p className="text-muted-foreground">Log your daily transactions effortlessly and keep your balances always up to date.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border glass">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <PieChart className="text-accent" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Budgets</h3>
            <p className="text-muted-foreground">Set category limits and get visual warnings before you overspend your monthly limits.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border glass">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="text-blue-500" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Bank-Grade Security</h3>
            <p className="text-muted-foreground">Your data is secured with strong hashing algorithms and HTTP-only JWT cookies.</p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        &copy; {new Date().getFullYear()} FinTrack. All rights reserved.
      </footer>
    </div>
  );
}
