import { useOrgStore } from '@/stores/org-store'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useOrg() {
  const router = useRouter()
  const { currentOrg, orgs, isLoading, setCurrentOrg, setOrgs, setLoading } = useOrgStore()

  const fetchUserOrgs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orgs')
      if (res.ok) {
        const data = await res.json()
        setOrgs(data)
        const activeOrg = useOrgStore.getState().currentOrg
        if (data.length > 0 && !activeOrg) {
          setCurrentOrg(data[0])
        }
      }
    } catch (e) {
      console.error('Error fetching orgs:', e)
    } finally {
      setLoading(false)
    }
  }, [setCurrentOrg, setLoading, setOrgs])

  const switchOrg = useCallback(async (orgId: string) => {
    const activeOrgs = useOrgStore.getState().orgs
    const selected = activeOrgs.find((o) => o.id === orgId)
    if (selected) {
      setCurrentOrg(selected)
      router.refresh()
    }
  }, [setCurrentOrg, router])

  return {
    currentOrg,
    orgs,
    isLoading,
    fetchUserOrgs,
    switchOrg,
    setCurrentOrg,
  }
}

