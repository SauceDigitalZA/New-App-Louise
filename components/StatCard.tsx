
import React from 'react';
import { LucideProps } from 'lucide-react';

interface StatCardProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  value: string | number;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-start space-x-4">
      <div className="bg-slate-100 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-slate-600" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{Number(value).toLocaleString()}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
};

export default StatCard;
