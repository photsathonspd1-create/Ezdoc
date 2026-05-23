'use client'

import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

interface TrendItem {
  month: string
  income: number
  expense: number
  profit: number
}

interface TooltipPayloadEntry {
  name: string
  value: number
  color?: string
}

interface TrendChartProps {
  data: TrendItem[]
}

const formatNumber = (val: number) => {
  return new Intl.NumberFormat('th-TH').format(val)
}

export default function TrendChart({ data }: TrendChartProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="h-[320px] w-full min-h-[320px]">
      {mounted && (
        <ResponsiveContainer width="99%" height="100%" minWidth={0}>
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${formatNumber(value / 1000)}k`}
            dx={-10}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-lg space-y-1.5 select-none">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{label}</p>
                    <div className="space-y-1">
                      {(payload as unknown as TooltipPayloadEntry[]).map((entry) => (
                        <div key={entry.name} className="flex items-center gap-6 text-xs justify-between">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name}
                          </span>
                          <span className="font-extrabold text-slate-850 dark:text-slate-100">
                            ฿{formatNumber(entry.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            verticalAlign="top"
            height={40}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                {value}
              </span>
            )}
          />
          <Line
            type="monotone"
            dataKey="income"
            name="รายรับ (Income)"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="รายจ่าย (Expense)"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            name="กำไรสุทธิ (Net Profit)"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
