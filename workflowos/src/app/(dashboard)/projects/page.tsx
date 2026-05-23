'use client'

import React, { useState, useEffect } from 'react'
import { useOrg } from '@/hooks/use-org'
import useSWR from 'swr'
import PageHeader from '@/components/shared/page-header'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Search, 
  Filter, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Tag, 
  Edit2, 
  Trash2, 
  FolderGit2, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ProjectForm } from '@/components/projects/project-form'
import { KanbanBoard } from '@/components/projects/kanban-board'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { ProjectStatus, PayStatus } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProjectsPage() {
  const { currentOrg, isLoading: loadingOrg } = useOrg()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'list'|'kanban'>('kanban')

  const { data: projects = [], isLoading: loadingProjects, mutate } = useSWR(
    currentOrg ? `/api/projects?orgId=${currentOrg.id}` : null,
    fetcher,
    { keepPreviousData: true }
  )

  const { data: clients = [], isLoading: loadingClients } = useSWR(
    currentOrg ? `/api/contacts?orgId=${currentOrg.id}` : null,
    fetcher,
    { keepPreviousData: true }
  )

  const loading = loadingProjects || loadingClients

  const handleCreateOrUpdate = async (formData: any) => {
    if (!currentOrg) return
    
    const url = editingProject 
      ? `/api/projects/${editingProject.id}`
      : '/api/projects'
    
    const method = editingProject ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          orgId: currentOrg.id
        }),
      })

      if (res.ok) {
        toast.success(editingProject ? 'แก้ไขโครงการสำเร็จ' : 'สร้างโครงการใหม่สำเร็จ')
        setIsFormOpen(false)
        setEditingProject(null)
        mutate()
      } else {
        const err = await res.json()
        toast.error(err.error || 'เกิดข้อผิดพลาดในการบันทึก')
      }
    } catch (error) {
      toast.error('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้')
    }
  }

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    if (!currentOrg) return
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, orgId: currentOrg.id })
      })
      if (res.ok) {
        toast.success('เปลี่ยนสถานะโครงการสำเร็จ')
        mutate()
      } else {
        toast.error('ไม่สามารถเปลี่ยนสถานะได้')
      }
    } catch (e) {
      toast.error('ข้อผิดพลาดเซิร์ฟเวอร์')
    }
  }

  const handleEdit = (project: any) => {
    setEditingProject(project)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!currentOrg) return
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้? การลบโครงการจะไม่ลบเอกสารที่เชื่อมโยงอยู่')) return

    try {
      const res = await fetch(`/api/projects/${id}?orgId=${currentOrg.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('ลบโครงการสำเร็จ')
        mutate()
      } else {
        const err = await res.json()
        toast.error(err.error || 'ไม่สามารถลบโครงการได้')
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบ')
    }
  }

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-amber-500" />
      case 'ACTIVE': return <FolderGit2 className="h-4 w-4 text-blue-500" />
      case 'COMPLETED': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-rose-500" />
      default: return null
    }
  }

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">รอดำเนินการ</Badge>
      case 'ACTIVE': return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">กำลังทำ</Badge>
      case 'COMPLETED': return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">เสร็จสิ้น</Badge>
      case 'CANCELLED': return <Badge variant="destructive">ยกเลิก</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPayStatusBadge = (status: PayStatus) => {
    switch (status) {
      case 'UNPAID': return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">ยังไม่ชำระ</Badge>
      case 'PARTIAL': return <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">ชำระบางส่วน</Badge>
      case 'PAID': return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">ชำระแล้ว</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.client?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.budget ? Number(p.budget) : 0), 0)
  const totalPaid = projects.reduce((sum: number, p: any) => sum + Number(p.paidAmount), 0)
  const totalRemaining = totalBudget - totalPaid

  if (loadingOrg || (loading && projects.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
        <LoadingSkeleton variant="card" count={3} />
      </div>
    )
  }

  if (!currentOrg) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-10 w-10 text-slate-400" />}
        title="ไม่พบข้อมูลองค์กร"
        description="กรุณาเลือกหรือสร้างองค์กรก่อนเพื่อจัดการโครงการ"
      />
    )
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="งาน / โครงการ (Projects)" 
          subtitle="วางแผน ติดตามงบประมาณรายจ่ายและยอดชำระของแต่ละโปรเจกต์"
        />
        <Button 
          onClick={() => {
            setEditingProject(null)
            setIsFormOpen(true)
          }}
          size="sm"
          className="h-9 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          สร้างโครงการใหม่
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">โครงการทั้งหมด</p>
              <h3 className="text-2xl font-black">{projects.length} โครงการ</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">งบประมาณโครงการรวม</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(totalBudget)}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">รับชำระเงินแล้ว</p>
              <h3 className="text-2xl font-black text-green-600 dark:text-green-400">{formatCurrency(totalPaid)}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-sm rounded-2xl flex flex-col justify-between">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ยอดค้างจ่ายคงเหลือ</p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(totalRemaining)}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
          <div className="px-5 pb-4">
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                className={`flex-1 h-8 text-xs ${viewMode === 'kanban' ? 'rounded-lg shadow-sm' : 'rounded-lg'}`}
                onClick={() => setViewMode('kanban')}
              >
                กระดาน
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className={`flex-1 h-8 text-xs ${viewMode === 'list' ? 'rounded-lg shadow-sm' : 'rounded-lg'}`}
                onClick={() => setViewMode('list')}
              >
                รายการ
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="ค้นหาชื่อโครงการ ลูกค้า หรือแท็ก..." 
            className="pl-9 h-10 rounded-xl text-xs font-semibold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button 
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ALL')}
            size="sm"
            className="h-9 rounded-lg text-xs font-bold"
          >
            ทั้งหมด
          </Button>
          <Button 
            variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ACTIVE')}
            size="sm"
            className="h-9 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900"
          >
            กำลังดำเนินการ
          </Button>
          <Button 
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PENDING')}
            size="sm"
            className="h-9 rounded-lg text-xs font-bold text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900"
          >
            รอดำเนินการ
          </Button>
          <Button 
            variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('COMPLETED')}
            size="sm"
            className="h-9 rounded-lg text-xs font-bold text-green-600 dark:text-green-400 border-green-200 dark:border-green-900"
          >
            เสร็จสิ้น
          </Button>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        viewMode === 'kanban' ? (
          <KanbanBoard 
            projects={filteredProjects}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any) => {
            const budgetNum = project.budget ? Number(project.budget) : 0
            const paidNum = Number(project.paidAmount)
            const payPercent = budgetNum > 0 ? Math.min(Math.round((paidNum / budgetNum) * 100), 100) : 0
            
            return (
              <Card key={project.id} className="border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-sm rounded-2xl flex flex-col justify-between overflow-hidden hover:shadow-md transition duration-200">
                <CardHeader className="p-6 pb-2">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(project.status)}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {project.client?.name || 'ทั่วไป'}
                      </span>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                  <CardTitle className="text-base font-black leading-tight line-clamp-2">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-semibold">
                    <Calendar className="h-3 w-3" />
                    {project.startDate ? formatDate(project.startDate) : 'ไม่ระบุ'} - {project.dueDate ? formatDate(project.dueDate) : 'ไม่ระบุ'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-5 pt-0 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>รับชำระเงินแล้ว ({payPercent}%)</span>
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">{formatCurrency(paidNum)} / {budgetNum > 0 ? formatCurrency(budgetNum) : 'ไม่ระบุ'}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          project.paymentStatus === 'PAID' ? 'bg-green-500' :
                          project.paymentStatus === 'PARTIAL' ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                        style={{ width: `${payPercent}%` }}
                      />
                    </div>
                  </div>

                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-[9px] px-2 py-0 font-semibold bg-slate-50 dark:bg-slate-900 border text-slate-400 border-slate-200 dark:border-slate-800 rounded-md">
                          <Tag className="h-2 w-2 mr-1 text-slate-400" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {project.notes && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-450 leading-relaxed font-semibold italic bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/30">
                      {project.notes}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/10">
                  <div className="flex items-center gap-1">
                    {getPayStatusBadge(project.paymentStatus)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-250"
                      onClick={() => {
                        setEditingProject(project)
                        setIsFormOpen(true)
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
        )
      ) : (
        <EmptyState
          icon={<Briefcase className="h-10 w-10 text-slate-300" />}
          title="ไม่พบงานหรือโครงการ"
          description={searchQuery ? 'ลองค้นหาด้วยคำอื่น หรือยกเลิกตัวกรอง' : 'เริ่มต้นสร้างโครงการแรกเพื่อวางแผนและจัดการเงินของคุณ'}
        />
      )}

      {/* FORM DIALOG */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">
              {editingProject ? 'แก้ไขข้อมูลโครงการ' : 'สร้างโครงการใหม่'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              กรอกข้อมูลเพื่อติดตามงบประมาณ รายรับ-รายจ่าย และความก้าวหน้าโครงการของบริษัท
            </DialogDescription>
          </DialogHeader>
          <ProjectForm 
            initialData={editingProject}
            clients={clients}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingProject(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
