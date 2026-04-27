import { defineStore } from 'pinia'
import type { GameStateDto, OfflineReportDto } from '@/application/dto/game'

interface GameState {
  current: GameStateDto | null
  offlineReport: OfflineReportDto | null
  shouldShowOfflinePopup: boolean
  pendingOfflineSync: boolean
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    current: null,
    offlineReport: null,
    shouldShowOfflinePopup: false,
    pendingOfflineSync: false,
  }),

  actions: {
    setCurrentState(state: GameStateDto): void {
      this.current = state
      this.pendingOfflineSync = false
    },

    setLoadedStateForGameEntry(state: GameStateDto): void {
      this.current = state
      this.offlineReport = null
      this.shouldShowOfflinePopup = false
      this.pendingOfflineSync = true
    },

    setOfflineReport(report: OfflineReportDto | null, shouldShowPopup: boolean): void {
      this.offlineReport = report
      this.shouldShowOfflinePopup = shouldShowPopup && report !== null
    },

    markOfflineSyncHandled(): void {
      this.pendingOfflineSync = false
    },

    dismissOfflinePopup(): void {
      this.shouldShowOfflinePopup = false
    },

    resetSession(): void {
      this.current = null
      this.offlineReport = null
      this.shouldShowOfflinePopup = false
      this.pendingOfflineSync = false
    },
  },
})
