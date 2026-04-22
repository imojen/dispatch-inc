<template>
  <RouterView />
  <ToastStack />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import ToastStack from '@/presentation/components/ToastStack.vue'
import { useUiStore } from '@/presentation/stores/uiStore'

const ui = useUiStore()

onMounted(async () => {
  if (!ui.hasLoaded) {
    await ui.initialize('fr-FR')
  }
})
</script>
