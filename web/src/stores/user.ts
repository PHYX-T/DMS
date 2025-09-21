import { defineStore } from 'pinia'
import type { User } from '@/types/strict'

export const useUserStore = defineStore('user', {
  state: (): { current: User | null } => ({ current: null }),
  actions: { set(user: User | null) { this.current = user } },
})

