<template>
  <section
    class="toast-stack"
    aria-live="polite"
    aria-atomic="false"
  >
    <article
      v-for="toast in ui.toasts"
      :key="toast.id"
      class="toast-item"
      :class="toastToneClass(toast.tone)"
      role="status"
    >
      <p class="toast-item-message">
        <i
          :class="toastToneIcon(toast.tone)"
          aria-hidden="true"
        />
        {{ t(toast.messageKey) }}
      </p>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { UiToastTone } from "@/presentation/stores/uiStore";
import { useUiStore } from "@/presentation/stores/uiStore";

const ui = useUiStore();

function t(key: string): string {
  return ui.t(key);
}

function toastToneClass(tone: UiToastTone): string {
  return `toast-item-${tone}`;
}

function toastToneIcon(tone: UiToastTone): string {
  switch (tone) {
    case "success":
      return "fa-solid fa-circle-check";
    case "error":
      return "fa-solid fa-triangle-exclamation";
    default:
      return "fa-solid fa-circle-info";
  }
}
</script>
