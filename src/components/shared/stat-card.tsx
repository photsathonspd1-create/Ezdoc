import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  className?: string
  color?: 'primary' | 'success' | 'destructive' | 'warning' | 'info' | 'neutral'
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  className,
  color = 'primary',
}: StatCardProps) {
  const getColors = () => {
    switch (color) {
      case 'success':
        return {
          bg: 'bg-green-50/50 dark:bg-green-950/15',
          border: 'border-green-150/40 dark:border-green-900/30',
          text: 'text-green-600 dark:text-green-400',
          iconBg: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        }
      case 'destructive':
        return {
          bg: 'bg-red-50/50 dark:bg-red-950/15',
          border: 'border-red-150/40 dark:border-red-900/30',
          text: 'text-red-600 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        }
      case 'warning':
        return {
          bg: 'bg-amber-50/50 dark:bg-amber-950/15',
          border: 'border-amber-150/40 dark:border-amber-900/30',
          text: 'text-amber-600 dark:text-amber-400',
          iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        }
      case 'info':
        return {
          bg: 'bg-blue-50/50 dark:bg-blue-950/15',
          border: 'border-blue-100 dark:border-blue-900/30',
          text: 'text-blue-700 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        }
      case 'neutral':
        return {
          bg: 'bg-white dark:bg-slate-900',
          border: 'border-slate-200 dark:border-slate-800',
          text: 'text-slate-900 dark:text-white',
          iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
        }
      default:
        return {
          bg: 'bg-white dark:bg-slate-950',
          border: 'border-slate-200/60 dark:border-slate-800/60',
          text: 'text-slate-900 dark:text-white',
          iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        }
    }
  }

  const styles = getColors()

  return (
    <Card className={cn('overflow-hidden border shadow-sm premium-card', styles.border, styles.bg, className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 break-words line-clamp-2 leading-snug">{title}</p>
          {icon && (
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition duration-200', styles.iconBg)}>
              {icon}
            </div>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <h3 className={cn('text-xl sm:text-2xl font-bold tracking-tight', styles.text)}>
            {value}
          </h3>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span
                className={cn(
                  'flex items-center text-xs font-medium px-1.5 py-0.5 rounded-md border',
                  trend >= 0
                    ? 'text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-950 dark:bg-green-950/20'
                    : 'text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-950 dark:bg-red-950/20'
                )}
              >
                {trend >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 shrink-0 mr-0.5" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 shrink-0 mr-0.5" />
                )}
                {Math.abs(trend)}%
              </span>
              {trendLabel && (
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
          {!trend && subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 font-normal pt-0.5">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
