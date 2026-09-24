// components/SummaryCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  type?: 'default' | 'income' | 'expense';
}

export function SummaryCard({ title, amount, icon: Icon, type = 'default' }: SummaryCardProps) {
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

  const amountColor = {
    default: 'text-foreground',
    income: 'text-emerald-600',
    expense: 'text-rose-600',
  }[type];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', amountColor)}>
          {formattedAmount}
        </div>
      </CardContent>
    </Card>
  );
}