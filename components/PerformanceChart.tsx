import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DailyMetric } from '../types';
// Fix: Import date-fns functions from their specific submodules to resolve module loading issues.
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';

interface PerformanceChartProps {
  data: DailyMetric[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const formattedData = data.map(item => ({
      ...item,
      date: format(parseISO(item.date), 'MMM d'),
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Performance Over Time</h3>
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                data={formattedData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tick={{ fill: '#64748b' }} />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip
                    contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '0.5rem',
                    }}
                />
                <Legend />
                <Line type="monotone" dataKey="searches" name="Searches" stroke="#4285F4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mapViews" name="Map Views" stroke="#34A853" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="websiteClicks" name="Website Clicks" stroke="#FBBC05" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="calls" name="Calls" stroke="#EA4335" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="directionRequests" name="Directions" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-96 text-slate-500">
                <p>No data available for the selected period.</p>
            </div>
        )}
    </div>
  );
};

export default PerformanceChart;