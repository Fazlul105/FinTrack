import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@fintrack.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@fintrack.com',
      passwordHash,
    },
  });

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Budgets
  await prisma.budget.createMany({
    data: [
      { userId: user.id, category: 'Food', monthlyLimit: 500, month: currentMonth, year: currentYear },
      { userId: user.id, category: 'Transport', monthlyLimit: 200, month: currentMonth, year: currentYear },
      { userId: user.id, category: 'Entertainment', monthlyLimit: 150, month: currentMonth, year: currentYear },
    ],
    skipDuplicates: true,
  });

  // Transactions
  await prisma.transaction.createMany({
    data: [
      { userId: user.id, type: 'INCOME', amount: 3000, category: 'Salary', description: 'Monthly Salary', transactionDate: new Date(currentYear, currentMonth - 1, 1) },
      { userId: user.id, type: 'EXPENSE', amount: 45.5, category: 'Food', description: 'Groceries', transactionDate: new Date(currentYear, currentMonth - 1, 5) },
      { userId: user.id, type: 'EXPENSE', amount: 15.0, category: 'Transport', description: 'Uber', transactionDate: new Date(currentYear, currentMonth - 1, 8) },
      { userId: user.id, type: 'EXPENSE', amount: 120.0, category: 'Entertainment', description: 'Concert Tickets', transactionDate: new Date(currentYear, currentMonth - 1, 12) },
      { userId: user.id, type: 'EXPENSE', amount: 35.0, category: 'Food', description: 'Dinner out', transactionDate: new Date(currentYear, currentMonth - 1, 15) },
    ],
    skipDuplicates: true,
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
