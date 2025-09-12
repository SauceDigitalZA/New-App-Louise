
import React from 'react';
import { LucideProps, ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  value: string | number;
  description: string;
  compareValue?: number | null;
}

const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};


const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, description, compareValue }) => {
  const numericValue = Number(value);
  const hasCompare = typeof compareValue === 'number';
  const change = hasCompare ? calculatePercentageChange(numericValue, compareValue) : 0;
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm flex items-start gap-4">
      <div className="bg-slate-100 p-3 rounded-lg flex-shrink-0">
        <Icon className="w-6 h-6 text-slate-600" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-800">{numericValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
            {hasCompare && (
                <span className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-500' : ''} ${isNegative ? 'text-red-500' : 'text-slate-500'}`}>
                    {isPositive && <ArrowUp className="w-4 h-4" />}
                    {isNegative && <ArrowDown className="w-4 h-4" />}
                    {Math.abs(change).toFixed(1)}%
                </span>
            )}
        </div>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
};

export default StatCard;