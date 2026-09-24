import { SummaryCard } from '@/components/SummaryCard';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardPage() {
  // INI PERHITUNGAN DUMMY, JANGAN LUPA DIHAPUS NANTI
  const balance = 1500000;
  const totalIncome = 3000000;
  const totalExpense = 1500000;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard 
        title="Total Saldo" 
        amount={balance} 
        icon={Wallet} 
      />
      <SummaryCard 
        title="Total Pemasukan" 
        amount={totalIncome} 
        icon={TrendingUp} 
        type="income" 
      />
      <SummaryCard 
        title="Total Pengeluaran" 
        amount={totalExpense} 
        icon={TrendingDown} 
        type="expense" 
      />
    </div>
  );
}