
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface ReviewsChartProps {
  data: ChartDataPoint[];
  isComparing: boolean;
}

const ReviewsChart: React.FC<ReviewsChartProps> = ({ data, isComparing }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Daily Reviews</h3>
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                data={data}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="dayLabel" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                    contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '0.5rem',
                    }}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Bar dataKey="reviews" name="Reviews" fill="#6366f1" />
                {isComparing && (
                    <Bar dataKey="compareReviews" name="Reviews (Comp)" fill="#6366f1" fillOpacity={0.5} />
                )}
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-72 text-slate-500">
                <p>No review data available for the selected period.</p>
            </div>
        )}
    </div>
  );
};

export default ReviewsChart;
