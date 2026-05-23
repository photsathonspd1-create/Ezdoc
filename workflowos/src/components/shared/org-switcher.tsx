'use client'

// Organization switcher dropdown for sidebar
import React, { useState, useEffect } from 'react'
import { useOrg } from '@/hooks/use-org'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { ChevronsUpDown, Plus, Building, Check, Loader2 } from 'lucide-react'

export default function OrgSwitcher() {
  const router = useRouter()
  const { currentOrg, orgs, isLoading, fetchUserOrgs, switchOrg, setCurrentOrg } = useOrg()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [creating, setCreating] = useState(false)

  // Fetch user organizations on mount
  useEffect(() => {
    fetchUserOrgs()
  }, [fetchUserOrgs])

  // Handle create new organization
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim()) return

    setCreating(true)
    try {
      const res = await fetch('/api/orgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newOrgName }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'เกิดข้อผิดพลาดในการสร้างองค์กร')
      }

      const org = await res.json()
      toast.success(`สร้างองค์กร "${org.name}" สำเร็จ`)
      setNewOrgName('')
      setIsDialogOpen(false)
      
      // Refresh list and switch to new org
      await fetchUserOrgs()
      setCurrentOrg(org)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'ไม่สามารถสร้างองค์กรได้')
    } finally {
      setCreating(false)
    }
  }

  if (isLoading && !currentOrg) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 animate-pulse bg-slate-50 dark:bg-slate-900/50 w-full h-11">
        <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 shrink-0"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
      </div>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center justify-between w-full px-3 py-6 rounded-xl border border-slate-200/50 hover:bg-slate-50/80 dark:border-slate-800/50 dark:hover:bg-slate-900/50 transition duration-250 select-none text-left bg-white dark:bg-slate-950 font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar className="h-7 w-7 rounded-lg border border-slate-100 dark:border-slate-900 shrink-0">
                <AvatarImage src={currentOrg?.logoUrl || ''} className="rounded-lg object-contain" />
                <AvatarFallback className="bg-primary/10 text-primary rounded-lg text-xs font-bold font-sans">
                  {currentOrg?.name?.substring(0, 2).toUpperCase() || 'WO'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden text-sm">
                <span className="font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
                  {currentOrg?.name || 'กรุณาเลือกองค์กร'}
                </span>
                <span className="text-[10px] text-slate-400 font-sans tracking-wide leading-none mt-0.5">
                  {currentOrg?.planTier || 'FREE'} PLAN
                </span>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" side="bottom" sideOffset={6}>
          <DropdownMenuLabel className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-sans">
            องค์กรของคุณ (Organizations)
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="max-h-[200px] overflow-y-auto space-y-0.5 py-1">
            {orgs.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => switchOrg(org.id)}
                className="flex items-center justify-between cursor-pointer py-2 rounded-lg text-sm"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Avatar className="h-6 w-6 rounded border border-slate-100 dark:border-slate-800 shrink-0">
                    <AvatarImage src={org.logoUrl || ''} className="rounded object-contain" />
                    <AvatarFallback className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded text-[10px] font-bold">
                      {org.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-slate-700 dark:text-slate-200 font-medium">
                    {org.name}
                  </span>
                </div>
                {currentOrg?.id === org.id && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem className="flex items-center gap-2 text-primary font-medium focus:text-primary cursor-pointer py-2 rounded-lg text-sm">
              <Plus className="h-4 w-4" />
              สร้างองค์กรใหม่
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleCreateOrg}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              สร้างองค์กร/บริษัทใหม่
            </DialogTitle>
            <DialogDescription>
              สร้างประวัติบริษัทเพิ่มเติมสำหรับการแยกเอกสารและรายการเงินทางการเงิน
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">ชื่อบริษัท / ร้านค้า <span className="text-red-500">*</span></Label>
              <Input
                id="orgName"
                placeholder="เช่น บริษัท ยูนิซิน จำกัด"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} disabled={creating}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={creating} className="gap-1">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              {creating ? 'กำลังสร้าง...' : 'สร้างองค์กร'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
