// Zustand organization store
import { create } from 'zustand'
import { Organization } from '@/types/org'

export interface OrgState {
  currentOrg: Organization | null
  orgs: Organization[]
  isLoading: boolean
  setCurrentOrg: (org: Organization | null) => void
  setOrgs: (orgs: Organization[]) => void
  setLoading: (loading: boolean) => void
}

export const useOrgStore = create<OrgState>((set) => ({
  currentOrg: null,
  orgs: [],
  isLoading: false,
  setCurrentOrg: (currentOrg) => set({ currentOrg }),
  setOrgs: (orgs) => set({ orgs }),
  setLoading: (isLoading) => set({ isLoading }),
}))

