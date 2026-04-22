import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from '@/App.vue'
import { APP_CONTAINER_KEY, appContainer } from '@/app/di'
import { appRouter } from '@/presentation/router'

export function bootstrap(): void {
  const app = createApp(App)

  app.use(createPinia())
  app.use(appRouter)
  app.provide(APP_CONTAINER_KEY, appContainer)
  app.mount('#app')
}
