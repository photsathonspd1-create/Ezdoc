'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface DonutChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b']

export default function DonutChart({ data }: DonutChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length]
  }))

  const formatTooltip = (value: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value)
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' 
            }} 
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
