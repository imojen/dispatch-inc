import { createRouter, createWebHistory } from 'vue-router'
import GamePage from '@/presentation/pages/GamePage.vue'
import HomePage from '@/presentation/pages/HomePage.vue'

export const ROUTE_HOME = 'home'
export const ROUTE_GAME = 'game'

export const appRouter = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: ROUTE_HOME,
      component: HomePage,
    },
    {
      path: '/game',
      name: ROUTE_GAME,
      component: GamePage,
    },
  ],
})
