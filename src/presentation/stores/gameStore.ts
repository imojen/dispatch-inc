import { defineStore } from 'pinia'
import type { GameStateDto, OfflineReportDto } from '@/application/dto/game'

interface GameState {
  current: GameStateDto | null
  offlineReport: OfflineReportDto | null
  shouldShowOfflinePopup: boolean
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    current: null,
    offlineReport: null,
    shouldShowOfflinePopup: false,
  }),

  actions: {
    setCurrentState(state: GameStateDto): void {
      this.current = state
    },

    setOfflineReport(report: OfflineReportDto | null, shouldShowPopup: boolean): void {
      this.offlineReport = report
      this.shouldShowOfflinePopup = shouldShowPopup && report !== null
    },

    dismissOfflinePopup(): void {
      this.shouldShowOfflinePopup = false
    },

    resetSession(): void {
      this.current = null
      this.offlineReport = null
      this.shouldShowOfflinePopup = false
    },
  },
})
