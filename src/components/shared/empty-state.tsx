import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-dashed">
      <CardContent className="flex flex-col items-center justify-center text-center p-12 space-y-4">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-2">
            {icon}
          </div>
        )}
        <div className="space-y-1.5 max-w-md">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {action && <div className="pt-2">{action}</div>}
      </CardContent>
    </Card>
  )
}
