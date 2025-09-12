
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface ActionsChartProps {
  data: ChartDataPoint[];
  isComparing: boolean;
}

const ActionsChart: React.FC<ActionsChartProps> = ({ data, isComparing }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Daily Customer Actions</h3>
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                data={data}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="dayLabel" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                    contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '0.5rem',
                    }}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Bar dataKey="websiteClicks" name="Website Clicks" fill="#FBBC05" />
                <Bar dataKey="calls" name="Calls" fill="#EA4335" />
                <Bar dataKey="directionRequests" name="Directions" fill="#8b5cf6" />
                <Bar dataKey="orderClicks" name="Order Clicks" fill="#a855f7" />
                {isComparing && (
                    <>
                        <Bar dataKey="compareWebsiteClicks" name="Website Clicks (Comp)" fill="#FBBC05" fillOpacity={0.5} />
                        <Bar dataKey="compareCalls" name="Calls (Comp)" fill="#EA4335" fillOpacity={0.5} />
                        <Bar dataKey="compareDirectionRequests" name="Directions (Comp)" fill="#8b5cf6" fillOpacity={0.5} />
                        <Bar dataKey="compareOrderClicks" name="Order Clicks (Comp)" fill="#a855f7" fillOpacity={0.5} />
                    </>
                )}
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-72 text-slate-500">
                <p>No action data available for the selected period.</p>
            </div>
        )}
    </div>
  );
};

export default ActionsChart;
