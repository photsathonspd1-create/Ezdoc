import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface LoadingSkeletonProps {
  variant?: 'card' | 'chart' | 'table-row'
  count?: number
}

export function LoadingSkeleton({ variant = 'card', count = 1 }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, idx) => (
          <Card key={idx} className="border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (variant === 'chart') {
    return (
      <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[280px] w-full flex items-end justify-between gap-4 pt-4">
            <Skeleton className="h-[40%] w-full rounded-md" />
            <Skeleton className="h-[75%] w-full rounded-md" />
            <Skeleton className="h-[55%] w-full rounded-md" />
            <Skeleton className="h-[90%] w-full rounded-md" />
            <Skeleton className="h-[30%] w-full rounded-md" />
            <Skeleton className="h-[65%] w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // default: table-row
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-white/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
