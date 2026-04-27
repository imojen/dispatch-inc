<template>
  <main class="page-shell home-minimal-page">
    <section class="home-terminal-shell">
      <header class="home-terminal-header terminal-header">
        <div class="terminal-frame-line">
          <span>{{ t('home.terminal.brand') }}</span>
          <nav class="terminal-function-bar">
            <span>{{ t('home.terminal.help') }}</span>
            <span>{{ t('home.terminal.stats') }}</span>
            <span>{{ t('home.terminal.options') }}</span>
          </nav>
        </div>
      </header>

      <section class="home-terminal-hero">
        <div class="home-logo-wrap home-terminal-logo-panel">
          <img
            class="home-logo home-terminal-logo"
            :src="heroMainImage"
            alt="Dispatch Inc"
          >
        </div>

        <p class="home-terminal-tagline">
          {{ t('home.tagline') }}
        </p>

        <div class="home-main-actions home-terminal-actions">
          <button
            v-if="hasSaves"
            class="button button-primary button-lg home-terminal-action home-terminal-action-primary"
            :disabled="saveMenu.isWorking"
            @click="onContinue"
          >
            <span class="home-terminal-action-bracket">[</span>
            <span class="home-terminal-action-copy">
              > {{ t('home.cta.continue') }}
            </span>
            <span class="home-terminal-action-bracket">]</span>
          </button>
          <button
            class="button button-lg home-terminal-action"
            :disabled="saveMenu.isWorking"
            @click="openCreateModal"
          >
            <span class="home-terminal-action-bracket">[</span>
            <span class="home-terminal-action-copy">
              {{ t('home.cta.newRun') }}
            </span>
            <span class="home-terminal-action-bracket">]</span>
          </button>
          <button
            class="button button-lg home-terminal-action"
            @click="saveMenu.openLoadView"
          >
            <span class="home-terminal-action-bracket">[</span>
            <span class="home-terminal-action-copy">
              {{ t('home.cta.load') }}
            </span>
            <span class="home-terminal-action-bracket">]</span>
          </button>
        </div>
      </section>

      <footer class="home-terminal-footer terminal-footer">
        <div class="terminal-frame-body home-terminal-footer-grid">
          <div class="home-terminal-footer-block">
            <p>{{ t('home.terminal.systemOk') }}</p>
            <p>{{ t('home.terminal.connection') }}</p>
            <p>
              {{ t('home.terminal.status') }}
              <span
                class="terminal-cursor"
                aria-hidden="true"
              >_</span>
            </p>
          </div>
          <div class="home-terminal-footer-block home-terminal-footer-block-right">
            <p>{{ t('home.terminal.hintNavigate') }}</p>
            <p>{{ t('home.terminal.hintSelect') }}</p>
            <p>{{ t('home.terminal.hintQuit') }}</p>
          </div>
        </div>
      </footer>
    </section>

    <section
      v-if="isCreateModalOpen"
      class="overlay"
    >
      <article class="overlay-card home-terminal-modal">
        <header class="panel-header panel-header-popup">
          <h2 class="popup-title">
            {{ t('home.newRun.modalTitle') }}
          </h2>
          <button
            class="button button-ghost button-icon"
            :aria-label="t('common.close')"
            :title="t('common.close')"
            @click="closeCreateModal"
          >
            <i
              class="fa-solid fa-xmark"
              aria-hidden="true"
            />
          </button>
        </header>
        <div class="form-field-industrial">
          <label
            class="input-label"
            for="new-run-label"
          >
            {{ t('home.newRun.label') }}
          </label>
          <input
            id="new-run-label"
            v-model="newRunLabel"
            class="text-input"
            type="text"
            required
          >
        </div>

        <div class="confirm-actions">
          <button
            class="button button-primary"
            :disabled="!canCreateRun"
            @click="confirmCreateRun"
          >
            {{ t('home.newRun.confirm') }}
          </button>
        </div>
      </article>
    </section>

    <section
      v-if="saveMenu.isLoadViewOpen"
      class="overlay"
    >
      <article class="overlay-card overlay-card-large home-terminal-modal">
        <header class="panel-header panel-header-popup">
          <h2 class="popup-title">
            {{ t('home.load.title') }}
          </h2>
          <button
            class="button button-ghost button-icon"
            :aria-label="t('common.close')"
            :title="t('common.close')"
            @click="saveMenu.closeLoadView"
          >
            <i
              class="fa-solid fa-xmark"
              aria-hidden="true"
            />
          </button>
        </header>

        <div class="overlay-card-large-body">
          <p
            v-if="saveMenu.slots.length === 0"
            class="message message-empty"
          >
            {{ t('save.empty.none') }}
          </p>

          <ul
            v-else
            class="slot-list"
          >
            <li
              v-for="slot in saveMenu.slots"
              :key="slot.id"
              class="slot-item"
              :class="slotClass(slot.id)"
            >
              <div class="slot-main">
                <p class="slot-title">
                  {{ slot.label }}
                </p>
                <p class="slot-meta">
                  {{ t('save.slot.createdAt') }}: {{ formatDate(slot.createdAt) }} ·
                  {{ t('save.slot.lastPlayedAt') }}: {{ formatDate(slot.lastPlayedAt) }} ·
                  {{ t('save.slot.version') }}: v{{ slot.version }}
                </p>
                <p
                  v-if="slot.id === saveMenu.activeSlotId"
                  class="slot-badge"
                >
                  {{ t('save.slot.active') }}
                </p>
                <p
                  v-if="saveMenu.slotIssues[slot.id]"
                  class="slot-badge slot-badge-warning"
                >
                  {{ t(issueKey(saveMenu.slotIssues[slot.id])) }}
                </p>
              </div>

              <div class="slot-actions">
                <button
                  class="button button-small"
                  :disabled="saveMenu.isWorking || Boolean(saveMenu.slotIssues[slot.id])"
                  @click="saveMenu.playSlot(slot.id)"
                >
                  {{ t('save.action.play') }}
                </button>
                <button
                  class="button button-small button-icon"
                  :disabled="saveMenu.isWorking"
                  :aria-label="t('save.action.export')"
                  :title="t('save.action.export')"
                  @click="saveMenu.exportSlot(slot.id)"
                >
                  <i
                    class="fa-solid fa-download"
                    aria-hidden="true"
                  />
                </button>
                <button
                  class="button button-small button-danger button-icon"
                  :disabled="saveMenu.isWorking"
                  :aria-label="t('save.action.delete')"
                  :title="t('save.action.delete')"
                  @click="saveMenu.askDelete(slot.id)"
                >
                  <i
                    class="fa-solid fa-trash-can"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </li>
          </ul>

          <div class="load-actions-row">
            <button
              class="button"
              @click="openImportPicker"
            >
              {{ t('home.load.import') }}
            </button>
          </div>

          <input
            ref="importInputRef"
            class="hidden-input"
            type="file"
            accept="application/json,.json"
            @change="onImportFileSelected"
          >

          <div
            v-if="saveMenu.pendingDeleteSlotId"
            class="confirm-box"
          >
            <p>{{ t('save.delete.confirmation') }}</p>
            <div class="confirm-actions">
              <button
                class="button button-small"
                @click="saveMenu.cancelDelete"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                class="button button-small button-danger"
                @click="saveMenu.confirmDelete"
              >
                {{ t('common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import heroMainImage from '../../../assets/dispatch-inc-transparent-v2.png'
import { useSaveMenuStore } from '@/presentation/stores/saveMenuStore'
import { useUiStore } from '@/presentation/stores/uiStore'

const saveMenu = useSaveMenuStore()
const ui = useUiStore()
const isCreateModalOpen = ref(false)
const newRunLabel = ref('')
const importInputRef = ref<{ click: () => void } | null>(null)

const hasSaves = computed(() => saveMenu.slots.length > 0)
const canCreateRun = computed(() => !saveMenu.isWorking && newRunLabel.value.trim().length > 0)

function t(key: string): string {
  return ui.t(key)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR')
}

function issueKey(issue: 'corrupted' | 'migrationFailure'): string {
  return issue === 'corrupted' ? 'save.state.corrupted' : 'save.state.migrationFailure'
}

function slotClass(slotId: string): string {
  if (slotId === saveMenu.highlightedSlotId) {
    return 'slot-item-highlighted'
  }

  return ''
}

function openImportPicker(): void {
  importInputRef.value?.click()
}

function buildDefaultRunLabel(): string {
  return `Dispatch Inc - Corp try # ${saveMenu.slots.length}`
}

function openCreateModal(): void {
  newRunLabel.value = buildDefaultRunLabel()
  isCreateModalOpen.value = true
}

function closeCreateModal(): void {
  isCreateModalOpen.value = false
  newRunLabel.value = ''
}

async function confirmCreateRun(): Promise<void> {
  const label = newRunLabel.value.trim()
  if (label.length === 0) {
    return
  }

  const success = await saveMenu.createNewRun(label)
  if (success) {
    closeCreateModal()
  }
}

async function onContinue(): Promise<void> {
  await saveMenu.continueLatest()
}

async function onImportFileSelected(event: { target: unknown }): Promise<void> {
  const target = event.target as
    | { files?: { [index: number]: unknown }; value?: string }
    | null
  const file = target?.files?.[0]

  if (!file || typeof file !== 'object' || !('text' in file)) {
    return
  }

  await saveMenu.importFromFile(file as { text: () => Promise<string> })
  if (target) {
    target.value = ''
  }
}

onMounted(async () => {
  if (!ui.hasLoaded) {
    await ui.initialize('fr-FR')
  }

  await saveMenu.refreshSlots()
})
</script>
