
import React from 'react';
import { ThumbsUp, ThumbsDown, MinusCircle } from 'lucide-react';

interface SentimentSummaryProps {
  summaries: {
    positive: string;
    neutral: string;
    negative: string;
  };
}

const SummaryCard: React.FC<{ icon: React.ElementType, title: string, text: string, colorClass: string }> = ({ icon: Icon, title, text, colorClass }) => (
    <div className="flex-1 min-w-[280px] p-4 rounded-lg bg-slate-50 border-l-4" style={{ borderColor: colorClass }}>
        <div className={`flex items-center space-x-2 mb-2`}>
            <Icon className={`w-5 h-5`} style={{ color: colorClass }} />
            <h4 className="font-bold text-slate-800">{title}</h4>
        </div>
        <p className="text-sm text-slate-600">{text}</p>
    </div>
);

const SentimentSummary: React.FC<SentimentSummaryProps> = ({ summaries }) => {
  return (
    <div className="mb-6 p-4 bg-slate-100 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">AI-Powered Summaries</h3>
        <div className="flex flex-wrap gap-4">
            <SummaryCard icon={ThumbsUp} title="Positive Feedback" text={summaries.positive} colorClass="#22c55e" />
            <SummaryCard icon={MinusCircle} title="Neutral Feedback" text={summaries.neutral} colorClass="#64748b" />
            <SummaryCard icon={ThumbsDown} title="Negative Feedback" text={summaries.negative} colorClass="#ef4444" />
        </div>
    </div>
  );
};

export default SentimentSummary;
