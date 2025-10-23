

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_DATA_LEAD_SOURCE } from '../../constants.ts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const LeadSourceChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Origen de Leads</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={CHART_DATA_LEAD_SOURCE}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {CHART_DATA_LEAD_SOURCE.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LeadSourceChart;