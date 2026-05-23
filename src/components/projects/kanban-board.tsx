'use client'

import React, { useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Calendar, Edit2, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

// Column mapping
const STATUSES = ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'รอดำเนินการ',
  ACTIVE: 'กำลังดำเนินการ',
  COMPLETED: 'เสร็จสิ้น',
  CANCELLED: 'ยกเลิก',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20',
  ACTIVE: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
}

function SortableProjectCard({ project, onEdit, onDelete }: { project: any, onEdit: (p: any) => void, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const payPercent = project.budget ? Math.min(Math.round((Number(project.paidAmount) / Number(project.budget)) * 100), 100) : 0

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none mb-3">
      <Card className="cursor-grab active:cursor-grabbing hover:border-blue-500/50 hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">{project.name}</h3>
            <div className="flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
              <button onClick={() => onEdit(project)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors">
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Briefcase className="w-3 h-3" />
            <span className="truncate">{project.client?.name || 'ไม่ระบุลูกค้า'}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Calendar className="w-3 h-3" />
            <span>{project.dueDate ? formatDate(project.dueDate) : '-'}</span>
          </div>

          {Number(project.budget) > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500">รับชำระแล้ว</span>
                <span className={payPercent === 100 ? 'text-emerald-500' : 'text-blue-600'}>
                  {payPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${payPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                  style={{ width: `${payPercent}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function KanbanColumn({ id, title, projects, onEdit, onDelete }: { id: string, title: string, projects: any[], onEdit: (p: any) => void, onDelete: (id: string) => void }) {
  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm text-slate-700 dark:text-slate-300">{title}</h2>
        <Badge variant="secondary" className="rounded-xl">{projects.length}</Badge>
      </div>
      
      <SortableContext id={id} items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1">
          {projects.map(project => (
            <SortableProjectCard 
              key={project.id} 
              project={project} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

interface KanbanBoardProps {
  projects: any[]
  onStatusChange: (projectId: string, newStatus: string) => void
  onEdit: (project: any) => void
  onDelete: (id: string) => void
}

export function KanbanBoard({ projects, onStatusChange, onEdit, onDelete }: KanbanBoardProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const columns = useMemo(() => {
    const cols: Record<string, any[]> = {
      PENDING: [],
      ACTIVE: [],
      COMPLETED: [],
      CANCELLED: []
    }
    projects.forEach(p => {
      if (cols[p.status]) {
        cols[p.status].push(p)
      }
    })
    return cols
  }, [projects])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeProjectId = active.id as string
    const overId = over.id as string

    // Find what column we dropped over
    let targetStatus = overId
    
    // If dropped over a project, find that project's status
    if (!STATUSES.includes(overId as any)) {
      const targetProject = projects.find(p => p.id === overId)
      if (targetProject) {
        targetStatus = targetProject.status
      }
    }

    const activeProject = projects.find(p => p.id === activeProjectId)
    if (activeProject && activeProject.status !== targetStatus && STATUSES.includes(targetStatus as any)) {
      onStatusChange(activeProjectId, targetStatus)
    }
  }

  const activeProject = activeId ? projects.find(p => p.id === activeId) : null

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {STATUSES.map(status => (
          <KanbanColumn 
            key={status}
            id={status}
            title={STATUS_LABELS[status]}
            projects={columns[status]}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProject ? (
          <div className="opacity-80 scale-105 rotate-2">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-sm line-clamp-2">{activeProject.name}</h3>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
