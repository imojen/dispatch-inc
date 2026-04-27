<template>
  <main class="page-shell game-shell">
    <section
      v-if="!game.current"
      class="panel-card"
    >
      <p class="message message-empty">
        {{ t("game.state.noSession") }}
      </p>
      <div class="empty-session-actions">
        <button
          class="button button-small button-ghost"
          @click="goHome"
        >
          {{ t("game.action.backHome") }}
        </button>
      </div>
    </section>

    <template v-else>
      <aside class="dev-cheat-panel">
        <p class="dev-cheat-title">
          {{ t("game.devtools.title") }}
        </p>
        <div class="dev-cheat-actions">
          <button
            class="button button-ghost dev-cheat-button"
            @click="applyDevMoneyCheat"
          >
            +10M €
          </button>
          <button
            class="button button-ghost dev-cheat-button"
            @click="applyDevSkillPointCheat"
          >
            +1 CP
          </button>
        </div>
      </aside>

      <section class="game-layout">
        <section class="game-simulation-panel">
          <div class="warehouse-stage-frame">
            <div class="warehouse-stage warehouse-stage-list">
              <header class="terminal-header">
                <div class="terminal-frame-line">
                  <span>{{ t("game.terminal.brand") }}</span>
                  <span class="terminal-function-bar">dispatch-inc_v0.1</span>
                </div>
                <div class="terminal-frame-body terminal-frame-body-header">
                  <div class="terminal-title-block">
                    <pre
                      class="terminal-title-ascii"
                      aria-hidden="true"
                    >{{ warehouseAsciiArt }}</pre>
                    <div class="terminal-title-copy">
                      <h1 class="warehouse-stage-title">
                        {{ t("game.header.warehouseLevel") }}
                        {{ game.current.progression.warehouseLevel }}
                      </h1>
                      <p class="terminal-title-subline">
                        {{ t("game.header.nextWarehouseMoveCost") }}:
                        {{ formatCurrency(nextWarehouseCost) }}
                        <span
                          class="terminal-cursor"
                          aria-hidden="true"
                        >_</span>
                      </p>
                    </div>
                  </div>

                  <div class="warehouse-stage-heading-actions">
                    <button
                      class="button button-ghost warehouse-stage-action-link"
                      :aria-label="t('game.action.openSkills')"
                      :title="t('game.action.openSkills')"
                      @click="isSkillTreeOpen = true"
                    >
                      <span class="warehouse-stage-action-bracket">[</span>
                      <span
                        class="warehouse-stage-action-caret"
                        aria-hidden="true"
                      >&gt;</span>
                      <span class="warehouse-stage-action-label">
                        {{ t("game.action.openSkills") }}
                        ({{ game.current.progression.skillPoints }})
                      </span>
                      <span class="warehouse-stage-action-bracket">]</span>
                    </button>
                    <button
                      class="button button-ghost warehouse-stage-action-link"
                      :aria-label="t('game.action.resetWarehouse')"
                      :title="t('game.action.resetWarehouse')"
                      :disabled="!canTriggerWarehouseReset"
                      @click="triggerWarehouseResetAction"
                    >
                      <span class="warehouse-stage-action-bracket">[</span>
                      <span
                        class="warehouse-stage-action-caret"
                        aria-hidden="true"
                      >&gt;</span>
                      <span class="warehouse-stage-action-label">{{ t("game.action.resetWarehouse") }}</span>
                      <span class="warehouse-stage-action-bracket">]</span>
                    </button>
                    <button
                      class="button button-ghost warehouse-stage-action-link"
                      :aria-label="t('game.action.backHome')"
                      :title="t('game.action.backHome')"
                      @click="goHome"
                    >
                      <span class="warehouse-stage-action-bracket">[</span>
                      <span
                        class="warehouse-stage-action-caret"
                        aria-hidden="true"
                      >&gt;</span>
                      <span class="warehouse-stage-action-label">{{ t("game.action.backHome") }}</span>
                      <span class="warehouse-stage-action-bracket">]</span>
                    </button>
                  </div>
                </div>
              </header>

              <section class="game-resource-bar terminal-stats-frame">
                <article class="game-resource-chip">
                  <div class="game-resource-head">
                    <pre
                      class="game-resource-ascii"
                      aria-hidden="true"
                    >{{ statAsciiArt.money }}</pre>
                    <p class="game-resource-title">
                      {{ t("game.stats.money") }}
                    </p>
                  </div>
                  <div class="game-resource-copy">
                    <p class="game-resource-value">
                      {{ formatWholeCurrency(displayedMoney) }}
                    </p>
                    <p class="game-resource-subvalue">
                      {{ t("game.stats.moneyPerSec") }}:
                      {{ formatCurrency(moneyPerSecond) }}
                    </p>
                  </div>
                </article>
                <article class="game-resource-chip">
                  <div class="game-resource-head">
                    <pre
                      class="game-resource-ascii"
                      aria-hidden="true"
                    >{{ statAsciiArt.packages }}</pre>
                    <p class="game-resource-title">
                      {{ t("game.stats.packages") }}
                    </p>
                  </div>
                  <div class="game-resource-copy">
                    <p class="game-resource-value">
                      {{ formatWholeCompact(displayedPackages) }}
                    </p>
                    <p class="game-resource-subvalue">
                      {{ t("game.stats.packagesPerSec") }}:
                      {{ formatCompact(packagesPerSecond) }}
                    </p>
                  </div>
                </article>
                <article class="game-resource-chip">
                  <div class="game-resource-head">
                    <pre
                      class="game-resource-ascii"
                      aria-hidden="true"
                    >{{ statAsciiArt.team }}</pre>
                    <p class="game-resource-title">
                      {{ t("game.stats.team") }}
                    </p>
                  </div>
                  <div class="game-resource-copy">
                    <p class="game-resource-value">
                      {{ employeesCount }}/{{ warehouseCapacity }}
                    </p>
                    <p class="game-resource-subvalue">
                      {{ t("game.stats.capacityShort") }}:
                      {{ warehouseCapacity }}
                    </p>
                  </div>
                </article>
                <article class="game-resource-chip">
                  <div class="game-resource-head">
                    <pre
                      class="game-resource-ascii"
                      aria-hidden="true"
                    >{{ statAsciiArt.pace }}</pre>
                    <p class="game-resource-title">
                      {{ t("game.stats.pace") }}
                    </p>
                  </div>
                  <div class="game-resource-copy">
                    <p class="game-resource-value">
                      {{ formatCadencePercent(tickDurationMs) }}
                    </p>
                    <p class="game-resource-subvalue">
                      {{ t("game.stats.tickDuration") }}:
                      {{ Math.round(tickDurationMs) }} ms
                    </p>
                  </div>
                </article>
              </section>

              <section class="terminal-upgrade-list">
                <article
                  v-for="card in upgradeCards"
                  :key="card.id"
                  class="warehouse-hotspot-button warehouse-hotspot-button-list terminal-upgrade-row"
                  :class="{
                    'warehouse-hotspot-button-disabled': !card.canBuy,
                    'terminal-upgrade-row-active': card.canBuy,
                  }"
                >
                  <div class="terminal-upgrade-row-main">
                    <div class="terminal-upgrade-identity">
                      <pre
                        class="terminal-upgrade-ascii"
                        aria-hidden="true"
                      >{{ upgradeAsciiArt(card.id) }}</pre>
                      <div class="warehouse-hotspot-head-text">
                        <span class="warehouse-hotspot-name">{{
                          t(card.titleKey)
                        }}</span>
                        <span class="warehouse-hotspot-level">
                          {{ t("game.upgrades.levelShort") }}
                          {{ formatUpgradeLevel(card) }}
                        </span>
                      </div>
                    </div>
                    <div class="warehouse-hotspot-details warehouse-hotspot-details-static">
                      <p class="warehouse-hotspot-description">
                        {{ t(`game.upgrades.${card.id}.description`) }}
                      </p>
                      <p>
                        {{ t("game.upgrades.baseEffect") }}:
                        {{ formatUpgradeEffect(card.id, card.baseCurrentEffect) }}
                        <span
                          v-if="hasUpgradeSkillMultiplier(card)"
                          class="skill-effect-badge"
                        >
                          {{ formatUpgradeSkillMultiplier(card) }}
                        </span>
                        <span aria-hidden="true"> | </span>
                        <template v-if="card.isMaxLevel">
                          {{ t("game.upgrades.maxLevelInline") }}
                        </template>
                        <template v-else>
                          {{ t("game.upgrades.nextPurchaseEffect") }}:
                          {{ formatUpgradeEffect(card.id, card.currentEffect) }}
                          →
                          {{ formatUpgradeEffect(card.id, card.nextEffect) }}
                        </template>
                      </p>
                    </div>
                  </div>
                  <button
                    class="button button-small terminal-upgrade-status terminal-upgrade-action-link"
                    :class="{
                      'terminal-upgrade-status-ok': card.canBuy,
                      'terminal-upgrade-status-ko': !card.canBuy,
                    }"
                    :disabled="!card.canBuy"
                    :title="card.canBuy ? formatCurrency(card.currentCost) : t(card.reasonKey ?? 'game.upgrades.status.blocked')"
                    @click="onWarehouseZoneAction(card.id)"
                  >
                    <span class="warehouse-stage-action-bracket">[</span>
                    <span
                      class="warehouse-stage-action-caret"
                      aria-hidden="true"
                    >&gt;</span>
                    <span class="warehouse-stage-action-label">
                      Acheter : {{ formatCurrency(card.currentCost) }}
                    </span>
                    <span class="warehouse-stage-action-bracket">]</span>
                  </button>
                </article>
              </section>

              <footer class="terminal-footer">
                <div class="terminal-frame-line">
                  <span>
                    &gt; {{ terminalStatusMessage }}
                    <span
                      class="terminal-cursor"
                      aria-hidden="true"
                    >_</span>
                  </span>
                </div>
              </footer>
            </div>
          </div>
        </section>
      </section>
    </template>

    <section
      v-if="isSkillTreeOpen && game.current"
      class="overlay"
    >
      <article class="overlay-card overlay-card-large skill-tree-modal">
        <header class="panel-header panel-header-popup">
          <div class="popup-title-stack">
            <h2 class="popup-title">
              {{ t("game.skills.title") }}
            </h2>
            <p class="popup-subtitle">
              {{ t("game.skills.subtitle") }}
            </p>
          </div>
          <button
            class="button button-ghost button-icon"
            :aria-label="t('common.close')"
            :title="t('common.close')"
            @click="isSkillTreeOpen = false"
          >
            <i
              class="fa-solid fa-xmark"
              aria-hidden="true"
            />
          </button>
        </header>

        <div class="overlay-card-large-body skill-tree-body">
          <div class="skill-tree-grid">
            <article
              v-for="branch in skillBranchCards"
              :key="branch.id"
              class="skill-branch-card"
              :class="{ 'skill-branch-card-locked': branch.isHiddenLocked }"
            >
              <div class="skill-branch-layout">
                <header class="skill-branch-header">
                  <i
                    :class="branch.iconClass"
                    aria-hidden="true"
                  />
                  <div class="skill-branch-content">
                    <h3>{{ t(branch.titleKey) }}</h3>
                    <template v-if="branch.skillId === 'offline.resilience'">
                      <p
                        class="skill-branch-meta"
                        :title="offlineTooltip(branch)"
                      >
                        {{ t("game.skills.effect.offline.efficiency") }}
                        {{ formatPercent(branch.offlineCurrentEfficiency) }}
                        →
                        {{ formatPercent(branch.offlineNextEfficiency) }}
                        ·
                        {{ formatHours(branch.offlineCurrentDurationHours) }}
                        h
                        →
                        {{ formatHours(branch.offlineNextDurationHours) }}
                        h
                      </p>
                    </template>
                    <p
                      v-else-if="branch.effectLabelKey"
                      class="skill-branch-meta"
                    >
                      {{ t(branch.effectLabelKey) }}:
                      {{ formatSkillEffect(branch.currentEffect) }}
                      →
                      {{ formatSkillEffect(branch.nextEffect) }}
                    </p>
                    <p
                      v-else
                      class="skill-branch-meta"
                    >
                      {{ t("game.skills.effect.placeholder") }}
                    </p>
                  </div>
                </header>

                <div class="skill-branch-controls">
                  <span class="skill-branch-level-badge">
                    {{ branch.level }}/{{ branch.maxLevel }}
                  </span>
                  <div class="skill-level-track skill-level-track-compact">
                    <span
                      v-for="level in branch.maxLevel"
                      :key="`${branch.id}-node-${level}`"
                      class="skill-level-node"
                      :class="{ 'skill-level-node-active': level <= branch.level }"
                    />
                  </div>
                  <button
                    class="button button-small button-icon skill-branch-plus"
                    :aria-label="skillUnlockTitle()"
                    :title="skillUnlockTitle()"
                    :disabled="!branch.canUnlock || !branch.skillId"
                    @click="
                      branch.skillId ? unlockSkillAction(branch.skillId) : undefined
                    "
                  >
                    +
                  </button>
                </div>
              </div>

              <p
                v-if="branch.statusKey"
                class="skill-branch-state"
              >
                {{ t(branch.statusKey) }}
              </p>
            </article>
          </div>
        </div>
      </article>
    </section>

    <section
      v-if="warehouseResetRecap && game.current"
      class="overlay"
    >
      <article class="overlay-card">
        <header class="panel-header panel-header-popup">
          <h2 class="popup-title">
            {{ t("game.reset.title") }}
          </h2>
          <button
            class="button button-ghost button-icon"
            :aria-label="t('common.close')"
            :title="t('common.close')"
            @click="warehouseResetRecap = null"
          >
            <i
              class="fa-solid fa-xmark"
              aria-hidden="true"
            />
          </button>
        </header>
        <p class="reset-recap-value">
          {{ t("game.reset.recap.warehouseLevel") }}:
          {{ warehouseResetRecap.nextWarehouseLevel }}
        </p>
        <p class="reset-recap-value">
          {{ t("game.reset.recap.spent") }}:
          {{ formatCurrency(warehouseResetRecap.spentMoney) }}
        </p>
        <p class="reset-recap-value">
          {{ t("game.reset.recap.skillGain") }}: +{{
            warehouseResetRecap.gainedSkillPoints
          }}
          {{ t("game.skills.pointShort") }}
        </p>
        <div class="confirm-actions">
          <button
            class="button button-primary"
            @click="warehouseResetRecap = null"
          >
            {{ t("game.reset.recap.continue") }}
          </button>
        </div>
      </article>
    </section>

    <section
      v-if="isIdleRestOpen"
      class="overlay idle-rest-backdrop"
    >
      <article class="overlay-card idle-rest-modal">
        <p class="idle-rest-title">
          {{ t("game.idle.status") }}
        </p>
        <div class="confirm-actions">
          <button
            class="button button-primary"
            @click="resumeFromIdleRest"
          >
            {{ t("game.idle.resume") }}
          </button>
        </div>
      </article>
    </section>

    <section
      v-if="game.shouldShowOfflinePopup && game.offlineReport"
      class="overlay offline-summary-backdrop"
    >
      <article class="overlay-card offline-modal offline-summary-modal">
        <header class="panel-header panel-header-popup">
          <h2 class="popup-title">
            {{ t("offline.report.title") }}
          </h2>
          <button
            class="button button-ghost button-icon"
            :aria-label="t('common.close')"
            :title="t('common.close')"
            @click="game.dismissOfflinePopup"
          >
            <i
              class="fa-solid fa-xmark"
              aria-hidden="true"
            />
          </button>
        </header>

        <p class="offline-key-value">
          <span>{{ t("offline.report.durationLabel") }}</span>
          <strong>{{
            formatDuration(game.offlineReport.countedOfflineDurationMs)
          }}</strong>
        </p>
        <p class="offline-key-value">
          <span>{{ t("game.idle.report.efficiencyLabel") }}</span>
          <strong>{{ formatPercent(offlineEfficiencyMultiplier) }}</strong>
        </p>
        <p class="offline-key-value">
          <span>{{ t("offline.report.packagesLabel") }}</span>
          <strong>{{
            formatCompact(
              toFiniteNumber(game.offlineReport.offlinePackagesDispatched),
            )
          }}</strong>
        </p>
        <p class="offline-key-value">
          <span>{{ t("offline.report.moneyLabel") }}</span>
          <strong>{{
            formatCurrency(
              toFiniteNumber(game.offlineReport.offlineMoneyGained),
            )
          }}</strong>
        </p>
        <div class="confirm-actions">
          <button
            class="button button-primary"
            @click="game.dismissOfflinePopup"
          >
            {{ t("offline.report.continue") }}
          </button>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import type { BalanceCatalogDto } from "@/application/dto/balance";
import { appContainer } from "@/app/di";
import { mapGameErrorToUiTextKey } from "@/application/useCases/game/contracts";
import { GameViewModelResolver } from "@/application/useCases/game/viewModel";
import { mapSaveErrorToUiTextKey } from "@/application/useCases/save/contracts";
import { ROUTE_HOME } from "@/presentation/router";
import { useGameStore } from "@/presentation/stores/gameStore";
import { useSaveMenuStore } from "@/presentation/stores/saveMenuStore";
import { useUiStore } from "@/presentation/stores/uiStore";

const DEFAULT_TICK_INTERVAL_MS = 200;
const MIN_TICK_INTERVAL_MS = 120;
const MAX_TICK_INTERVAL_MS = 1000;
const AUTOSAVE_INTERVAL_MS = 10000;
const IDLE_REST_DELAY_MS = 5000;
const MAIN_BRANCH_MAX_LEVEL = 5;
const LOOP_ERROR_TOAST_COOLDOWN_MS = 5000;

type UpgradeId = "employees" | "scanners" | "conveyors" | "carts" | "trucks";

interface UpgradeDefinition {
  id: UpgradeId;
  iconClass: string;
  titleKey: string;
}

interface UpgradeCardVm extends UpgradeDefinition {
  currentLevel: number;
  nextLevel: number;
  currentCost: number;
  skillMultiplier: number;
  baseCurrentEffect: number;
  baseNextEffect: number;
  currentEffect: number;
  nextEffect: number;
  canBuy: boolean;
  isMaxLevel: boolean;
  maxLevel?: number;
  reasonKey?: string;
}

interface WarehouseResetRecap {
  nextWarehouseLevel: number;
  spentMoney: number;
  gainedSkillPoints: number;
}

interface SkillBranchDescriptor {
  id: string;
  skillId?: string;
  iconClass: string;
  titleKey: string;
  descriptionKey: string;
  maxLevel: number;
  hidden?: boolean;
}

interface SkillBranchVm extends SkillBranchDescriptor {
  level: number;
  canUnlock: boolean;
  nextCost: number | null;
  statusKey?: string;
  isHiddenLocked: boolean;
  effectLabelKey?: string;
  currentEffect: number;
  nextEffect: number;
  offlineCurrentEfficiency: number;
  offlineNextEfficiency: number;
  offlineCurrentDurationHours: number;
  offlineNextDurationHours: number;
}

const UPGRADE_DEFINITIONS: readonly UpgradeDefinition[] = [
  {
    id: "employees",
    iconClass: "fa-solid fa-users",
    titleKey: "game.upgrades.employees.title",
  },
  {
    id: "scanners",
    iconClass: "fa-solid fa-barcode",
    titleKey: "game.upgrades.scanners.title",
  },
  {
    id: "conveyors",
    iconClass: "fa-solid fa-gears",
    titleKey: "game.upgrades.conveyors.title",
  },
  {
    id: "carts",
    iconClass: "fa-solid fa-cart-flatbed",
    titleKey: "game.upgrades.carts.title",
  },
  {
    id: "trucks",
    iconClass: "fa-solid fa-truck-fast",
    titleKey: "game.upgrades.trucks.title",
  },
];

const SKILL_BRANCHES: readonly SkillBranchDescriptor[] = [
  {
    id: "staff",
    skillId: "staff.mastery",
    iconClass: "fa-solid fa-helmet-safety",
    titleKey: "game.skills.branch.staff.title",
    descriptionKey: "game.skills.branch.staff.description",
    maxLevel: 5,
  },
  {
    id: "scan",
    skillId: "scan.mastery",
    iconClass: "fa-solid fa-qrcode",
    titleKey: "game.skills.branch.scan.title",
    descriptionKey: "game.skills.branch.scan.description",
    maxLevel: 5,
  },
  {
    id: "conveyor",
    skillId: "conveyor.mastery",
    iconClass: "fa-solid fa-gears",
    titleKey: "game.skills.branch.conveyor.title",
    descriptionKey: "game.skills.branch.conveyor.description",
    maxLevel: 5,
  },
  {
    id: "sorting",
    skillId: "sorting.mastery",
    iconClass: "fa-solid fa-layer-group",
    titleKey: "game.skills.branch.sorting.title",
    descriptionKey: "game.skills.branch.sorting.description",
    maxLevel: 5,
  },
  {
    id: "shipping",
    skillId: "shipping.mastery",
    iconClass: "fa-solid fa-truck-ramp-box",
    titleKey: "game.skills.branch.shipping.title",
    descriptionKey: "game.skills.branch.shipping.description",
    maxLevel: 5,
  },
  {
    id: "warehouse",
    skillId: "warehouse.mastery",
    iconClass: "fa-solid fa-warehouse",
    titleKey: "game.skills.branch.warehouse.title",
    descriptionKey: "game.skills.branch.warehouse.description",
    maxLevel: 5,
  },
  {
    id: "offline",
    skillId: "offline.resilience",
    iconClass: "fa-solid fa-moon",
    titleKey: "game.skills.branch.offline.title",
    descriptionKey: "game.skills.branch.offline.description",
    maxLevel: 5,
  },
  {
    id: "cheat",
    skillId: "cheat.optimization",
    iconClass: "fa-solid fa-flask-vial",
    titleKey: "game.skills.branch.cheat.title",
    descriptionKey: "game.skills.branch.cheat.description",
    maxLevel: 5,
    hidden: true,
  },
];

const router = useRouter();
const game = useGameStore();
const saveMenu = useSaveMenuStore();
const ui = useUiStore();

const getBalanceCatalog = appContainer.useCases.createGetBalanceCatalog();
const runTickUseCase = appContainer.useCases.createRunTick();
const applyOfflineProgressUseCase = appContainer.useCases.createApplyOfflineProgress();
const autosaveUseCase = appContainer.useCases.createAutosaveActiveSlot();
const purchaseUpgradeUseCase = appContainer.useCases.createPurchaseUpgrade();
const unlockSkillUseCase = appContainer.useCases.createUnlockSkill();
const triggerWarehouseResetUseCase =
  appContainer.useCases.createTriggerWarehouseReset();

const compactFormatter = new Intl.NumberFormat("fr-FR", {
  notation: "compact",
  maximumFractionDigits: 2,
});
const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  notation: "compact",
  maximumFractionDigits: 2,
});
const percentFormatter = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 0,
});

const balanceCatalog = ref<BalanceCatalogDto | null>(null);
const isSkillTreeOpen = ref(false);
const warehouseResetRecap = ref<WarehouseResetRecap | null>(null);
const isIdleRestOpen = ref(false);
const terminalStatusMessage = ref("");
const displayedMoney = ref(0);
const displayedPackages = ref(0);
const warehouseAsciiArt = String.raw`
   /\    
  /__\   
 | [] |  
 |____|  
`;
const statAsciiArt = {
  money: String.raw`(€)`,
  packages: String.raw`[#]`,
  team: String.raw`o o o`,
  pace: String.raw`|:|`,
} as const;

let tickTimer: number | undefined;
let autosaveTimer: number | undefined;
let idleRestTimer: number | undefined;
let tickInFlight = false;
let autosaveInFlight = false;
let lastTickErrorToastAt = 0;
let lastAutosaveErrorToastAt = 0;

const gameViewResolver = computed(() => {
  if (!balanceCatalog.value) {
    return null;
  }

  return new GameViewModelResolver(balanceCatalog.value);
});

const gameSnapshot = computed(() => {
  if (!game.current || !gameViewResolver.value) {
    return null;
  }

  try {
    return gameViewResolver.value.createSnapshot(game.current);
  } catch {
    return null;
  }
});

const money = computed(() => gameSnapshot.value?.money ?? 0);
const packages = computed(() => gameSnapshot.value?.packages ?? 0);
const packagesPerSecond = computed(
  () => gameSnapshot.value?.packagesPerSecond ?? 0,
);
const moneyPerSecond = computed(() => gameSnapshot.value?.moneyPerSecond ?? 0);
const employeesCount = computed(() => gameSnapshot.value?.employees ?? 0);
const warehouseCapacity = computed(
  () => gameSnapshot.value?.warehouseCapacity ?? 0,
);
const tickDurationMs = computed(() => gameSnapshot.value?.tickDurationMs ?? 0);
const nextWarehouseCost = computed(
  () => gameSnapshot.value?.nextWarehouseCost ?? 0,
);
const offlineEfficiencyMultiplier = computed(() =>
  resolveCurrentIdleEfficiency(),
);

const tickLoopDelayMs = computed(() => {
  if (!Number.isFinite(tickDurationMs.value) || tickDurationMs.value <= 0) {
    return DEFAULT_TICK_INTERVAL_MS;
  }

  return Math.max(
    MIN_TICK_INTERVAL_MS,
    Math.min(MAX_TICK_INTERVAL_MS, Math.round(tickDurationMs.value)),
  );
});

const canTriggerWarehouseReset = computed(() => {
  return (
    game.current !== null &&
    money.value >= nextWarehouseCost.value &&
    nextWarehouseCost.value > 0
  );
});

const mainBranchLevels = computed(() =>
  SKILL_BRANCHES.filter((branch) => !branch.hidden).map((branch) =>
    branch.skillId ? (game.current?.skills[branch.skillId]?.level ?? 0) : 0,
  ),
);

const hiddenBranchUnlocked = computed(() => {
  return areAllMainBranchesUnlocked(mainBranchLevels.value);
});

const upgradeCards = computed<UpgradeCardVm[]>(() => {
  if (!game.current || !gameSnapshot.value) {
    return [];
  }

  return UPGRADE_DEFINITIONS.map((definition) => {
    const snapshot = gameSnapshot.value?.upgrades[definition.id];
    if (!snapshot) {
      return {
        ...definition,
        currentLevel: 0,
        nextLevel: 1,
        currentCost: 0,
        skillMultiplier: 1,
        baseCurrentEffect: 0,
        baseNextEffect: 0,
        currentEffect: 0,
        nextEffect: 0,
        canBuy: false,
        isMaxLevel: false,
      };
    }

    const maxLevel = snapshot.maxLevel;
    const currentLevel = snapshot.currentLevel;
    const isMaxLevel = maxLevel !== undefined && currentLevel >= maxLevel;
    const isEmployeesAtCapacity =
      definition.id === "employees" &&
      employeesCount.value >= warehouseCapacity.value;

    const hasEnoughMoney = money.value >= snapshot.currentCost;
    const canBuy = !isMaxLevel && hasEnoughMoney && !isEmployeesAtCapacity;

    let reasonKey: string | undefined;
    if (isMaxLevel) {
      reasonKey = "errors.maxLevelReached";
    } else if (isEmployeesAtCapacity) {
      reasonKey = "errors.capacityReached";
    } else if (!hasEnoughMoney) {
      reasonKey = "errors.insufficientFunds";
    }

    return {
      ...definition,
      currentLevel,
      nextLevel: snapshot.nextLevel,
      currentCost: snapshot.currentCost,
      skillMultiplier: snapshot.skillMultiplier,
      baseCurrentEffect: snapshot.baseCurrentEffect,
      baseNextEffect: snapshot.baseNextEffect,
      currentEffect: snapshot.currentEffect,
      nextEffect: snapshot.nextEffect,
      canBuy,
      isMaxLevel,
      maxLevel,
      reasonKey,
    };
  });
});

const skillBranchCards = computed<SkillBranchVm[]>(() => {
  return SKILL_BRANCHES.map((descriptor) => {
    const hasSkillInCatalog = descriptor.skillId
      ? (gameViewResolver.value?.hasSkill(descriptor.skillId) ?? false)
      : false;
    const level = descriptor.skillId
      ? (game.current?.skills[descriptor.skillId]?.level ?? 0)
      : 0;
    const isHiddenLocked =
      Boolean(descriptor.hidden) && !hiddenBranchUnlocked.value;

    let nextCost: number | null = null;
    if (
      hasSkillInCatalog &&
      descriptor.skillId &&
      level < descriptor.maxLevel &&
      gameViewResolver.value
    ) {
      const rawCost = gameViewResolver.value.resolveSkillCost(
        descriptor.skillId,
        level,
      );
      nextCost = Math.max(1, Math.ceil(rawCost));
    }

    const enoughSkillPoints =
      (game.current?.progression.skillPoints ?? 0) >= (nextCost ?? Infinity);
    const canUnlock =
      hasSkillInCatalog &&
      descriptor.skillId !== undefined &&
      nextCost !== null &&
      !isHiddenLocked &&
      level < descriptor.maxLevel &&
      enoughSkillPoints;

    let statusKey: string | undefined;
    if (!hasSkillInCatalog) {
      statusKey = "game.skills.state.unavailable";
    }

    const offlineCurrent = resolveOfflineAtLevel(level);
    const previewLevel = Math.min(level + 1, descriptor.maxLevel);
    const offlineNext = resolveOfflineAtLevel(previewLevel);
    const effectLabelKey = resolveSkillEffectLabelKey(descriptor.skillId);
    const currentEffect =
      descriptor.skillId && descriptor.skillId !== "offline.resilience" && gameViewResolver.value
        ? gameViewResolver.value.resolveSkillEffect(descriptor.skillId, level)
        : 0;
    const nextEffect =
      descriptor.skillId && descriptor.skillId !== "offline.resilience" && gameViewResolver.value
        ? gameViewResolver.value.resolveSkillEffect(descriptor.skillId, previewLevel)
        : 0;

    return {
      ...descriptor,
      level,
      canUnlock,
      nextCost,
      statusKey,
      isHiddenLocked,
      effectLabelKey,
      currentEffect,
      nextEffect,
      offlineCurrentEfficiency: offlineCurrent.efficiency,
      offlineNextEfficiency: offlineNext.efficiency,
      offlineCurrentDurationHours: offlineCurrent.durationHours,
      offlineNextDurationHours: offlineNext.durationHours,
    };
  });
});

function t(key: string): string {
  return ui.t(key);
}

function toFiniteNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return parsed;
}

function areAllMainBranchesUnlocked(levels: number[]): boolean {
  return (
    levels.length === 7 &&
    levels.every((level) => level >= MAIN_BRANCH_MAX_LEVEL)
  );
}

function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatWholeCurrency(value: number): string {
  return currencyFormatter.format(Math.floor(value));
}

function formatWholeCompact(value: number): string {
  return compactFormatter.format(Math.floor(value));
}

function formatPercent(value: number): string {
  return percentFormatter.format(value);
}

function formatSkillEffect(value: number): string {
  return `x${Math.round(value * 100) / 100}`;
}

function formatHours(value: number): string {
  return `${Math.round(value * 10) / 10}`;
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function formatCadencePercent(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return "0%";
  }

  return `${Math.min(199, Math.floor((1000 / durationMs) * 100))}%`;
}

function formatUpgradeEffect(upgradeId: UpgradeId, effect: number): string {
  switch (upgradeId) {
    case "employees":
      return `${Math.max(0, Math.round(effect - 1))}`;
    case "scanners":
      return formatPercent(effect);
    case "conveyors":
    case "carts":
    case "trucks":
      return `x${Math.round(effect * 100) / 100}`;
    default:
      return `${effect}`;
  }
}

function hasUpgradeSkillMultiplier(card: UpgradeCardVm): boolean {
  return Math.abs(card.skillMultiplier - 1) >= 1e-9;
}

function formatUpgradeSkillMultiplier(card: UpgradeCardVm): string {
  const multiplier = Math.round(card.skillMultiplier * 100) / 100;
  return `x${multiplier}`;
}

function formatUpgradeLevel(card: UpgradeCardVm): string {
  return card.maxLevel !== undefined
    ? `${card.currentLevel}/${card.maxLevel}`
    : `${card.currentLevel}`;
}

function upgradeAsciiArt(upgradeId: UpgradeId): string {
  switch (upgradeId) {
    case "employees":
      return String.raw`/o o\
{o|o}
o|o|o`;
    case "scanners":
      return String.raw`|||||||
|||||||
|||||||`;
    case "conveyors":
      return String.raw`[=o=o=]
[=o=o=]`;
    case "carts":
      return String.raw`__[]
o--o`;
    case "trucks":
      return String.raw`____
|__\_
o--o`;
    default:
      return "[]";
  }
}

function offlineTooltip(branch: SkillBranchVm): string {
  return `${t("game.skills.effect.offline.efficiency")}: ${formatPercent(branch.offlineCurrentEfficiency)} -> ${formatPercent(branch.offlineNextEfficiency)} | ${t("game.skills.effect.offline.duration")}: ${formatHours(branch.offlineCurrentDurationHours)} -> ${formatHours(branch.offlineNextDurationHours)}`;
}

function skillUnlockTitle(): string {
  return t("game.skills.action.unlock");
}

function resolveSkillEffectLabelKey(skillId?: string): string | undefined {
  switch (skillId) {
    case "staff.mastery":
      return "game.skills.effect.staff";
    case "scan.mastery":
      return "game.skills.effect.scan";
    case "conveyor.mastery":
      return "game.skills.effect.conveyor";
    case "sorting.mastery":
      return "game.skills.effect.sorting";
    case "shipping.mastery":
      return "game.skills.effect.shipping";
    case "warehouse.mastery":
      return "game.skills.effect.warehouse";
    case "cheat.optimization":
      return "game.skills.effect.cheat";
    default:
      return undefined;
  }
}

function resolveOfflineAtLevel(level: number): {
  efficiency: number;
  durationHours: number;
} {
  if (!gameViewResolver.value) {
    return {
      efficiency: 0.2,
      durationHours: 1,
    };
  }

  return gameViewResolver.value.resolveOfflineSkillAtLevel(level);
}

function notifyError(messageKey: string): void {
  terminalStatusMessage.value = t(messageKey);
  ui.notifyError(messageKey);
}

function notifySuccess(messageKey: string): void {
  terminalStatusMessage.value = t(messageKey);
  ui.notifySuccess(messageKey);
}

function syncSimulationTimestamp(nowMs = Date.now()): void {
  if (!game.current) {
    return;
  }

  game.setCurrentState({
    ...game.current,
    simulation: {
      ...game.current.simulation,
      lastSeenAt: new Date(nowMs).toISOString(),
    },
  });
}

function applyDevMoneyCheat(): void {
  if (!game.current) {
    return;
  }

  const currentMoney = Number(game.current.resources.money);
  const safeMoney = Number.isFinite(currentMoney) ? currentMoney : 0;

  game.setCurrentState({
    ...game.current,
    resources: {
      ...game.current.resources,
      money: String(safeMoney + 10_000_000),
    },
  });
  notifySuccess("game.devtools.moneyAdded");
}

function applyDevSkillPointCheat(): void {
  if (!game.current) {
    return;
  }

  game.setCurrentState({
    ...game.current,
    progression: {
      ...game.current.progression,
      skillPoints: game.current.progression.skillPoints + 1,
    },
  });
  notifySuccess("game.devtools.skillPointAdded");
}

function notifyLoopError(
  messageKey: string,
  lastToastAt: number,
): number {
  const now = Date.now();
  if (now - lastToastAt < LOOP_ERROR_TOAST_COOLDOWN_MS) {
    return lastToastAt;
  }

  terminalStatusMessage.value = t(messageKey);
  ui.notifyError(messageKey);
  return now;
}

async function autosaveNow(): Promise<void> {
  if (autosaveInFlight || !game.current) {
    return;
  }

  autosaveInFlight = true;
  const result = await autosaveUseCase({ state: game.current });
  autosaveInFlight = false;

  if (!result.ok) {
    const messageKey = mapSaveErrorToUiTextKey(result.error.code);
    lastAutosaveErrorToastAt = notifyLoopError(
      messageKey,
      lastAutosaveErrorToastAt,
    );
  }
}

async function tickOnce(): Promise<void> {
  if (tickInFlight || !game.current) {
    return;
  }

  tickInFlight = true;
  const result = await runTickUseCase({ state: game.current });
  tickInFlight = false;

  if (!result.ok) {
    const messageKey = mapGameErrorToUiTextKey(result.error.code);
    lastTickErrorToastAt = notifyLoopError(messageKey, lastTickErrorToastAt);
    return;
  }

  game.setCurrentState(result.value.state);
}

function syncDisplayedResources(): void {
  displayedMoney.value = money.value;
  displayedPackages.value = packages.value;
}

function scheduleNextTickLoop(delayMs = tickLoopDelayMs.value): void {
  if (tickTimer || !game.current || isIdleRestOpen.value) {
    return;
  }

  tickTimer = globalThis.setTimeout(async () => {
    tickTimer = undefined;
    await tickOnce();
    scheduleNextTickLoop();
  }, delayMs);
}

function restartTickLoop(): void {
  if (tickTimer) {
    globalThis.clearTimeout(tickTimer);
    tickTimer = undefined;
  }

  scheduleNextTickLoop();
}

function startLoops(): void {
  if (isIdleRestOpen.value) {
    return;
  }

  scheduleNextTickLoop();

  if (!autosaveTimer) {
    autosaveTimer = globalThis.setInterval(() => {
      void autosaveNow();
    }, AUTOSAVE_INTERVAL_MS);
  }
}

function stopLoops(): void {
  if (tickTimer) {
    globalThis.clearTimeout(tickTimer);
    tickTimer = undefined;
  }

  if (autosaveTimer) {
    globalThis.clearInterval(autosaveTimer);
    autosaveTimer = undefined;
  }
}

function clearIdleRestTimer(): void {
  if (!idleRestTimer) {
    return;
  }

  globalThis.clearTimeout(idleRestTimer);
  idleRestTimer = undefined;
}

async function enterIdleRest(): Promise<void> {
  clearIdleRestTimer();

  if (isIdleRestOpen.value || !game.current) {
    return;
  }

  stopLoops();
  game.dismissOfflinePopup();
  syncSimulationTimestamp();
  isIdleRestOpen.value = true;
  terminalStatusMessage.value = t("game.idle.status");
  await autosaveNow();
}

function resolveCurrentIdleEfficiency(): number {
  const offlineLevel = game.current?.skills["offline.resilience"]?.level ?? 0;
  return resolveOfflineAtLevel(offlineLevel).efficiency;
}

function shouldArmIdleRest(): boolean {
  return (
    game.current !== null &&
    !isIdleRestOpen.value &&
    typeof globalThis.document !== "undefined" &&
    (globalThis.document.hidden || !globalThis.document.hasFocus())
  );
}

function armIdleRestTimer(): void {
  if (!shouldArmIdleRest() || idleRestTimer) {
    return;
  }

  idleRestTimer = globalThis.setTimeout(() => {
    idleRestTimer = undefined;
    void enterIdleRest();
  }, IDLE_REST_DELAY_MS);
}

function handleVisibilityOrFocusChange(): void {
  if (shouldArmIdleRest()) {
    armIdleRestTimer();
    return;
  }

  clearIdleRestTimer();
}

async function resumeFromIdleRest(): Promise<void> {
  if (!isIdleRestOpen.value || !game.current) {
    return;
  }

  const resumeAtMs = Date.now();
  const result = await applyOfflineProgressUseCase({
    state: game.current,
    nowMs: resumeAtMs,
    triggerAfterMsOverride: 0,
  });

  isIdleRestOpen.value = false;

  if (!result.ok) {
    syncSimulationTimestamp(resumeAtMs);
    notifyError(mapGameErrorToUiTextKey(result.error.code));
    startLoops();
    return;
  }

  game.setCurrentState(result.value.state);
  game.setOfflineReport(result.value.report, true);
  terminalStatusMessage.value = t("game.terminal.ready");
  startLoops();
  await autosaveNow();
}

async function purchaseUpgradeAction(upgradeId: UpgradeId): Promise<void> {
  if (!game.current) {
    return;
  }

  const result = await purchaseUpgradeUseCase({
    state: game.current,
    upgradeId,
  });

  if (!result.ok) {
    notifyError(mapGameErrorToUiTextKey(result.error.code));
    return;
  }

  game.setCurrentState(result.value.state);
  restartTickLoop();
  notifySuccess("game.feedback.upgradePurchased");
  await autosaveNow();
}

async function onWarehouseZoneAction(upgradeId: UpgradeId): Promise<void> {
  await purchaseUpgradeAction(upgradeId);
}

async function unlockSkillAction(skillId: string): Promise<void> {
  if (!game.current) {
    return;
  }

  const result = await unlockSkillUseCase({ state: game.current, skillId });

  if (!result.ok) {
    notifyError(mapGameErrorToUiTextKey(result.error.code));
    return;
  }

  game.setCurrentState(result.value.state);
  restartTickLoop();
  notifySuccess("game.feedback.skillUnlocked");
  await autosaveNow();
}

async function triggerWarehouseResetAction(): Promise<void> {
  if (!game.current) {
    return;
  }

  const previousSkillPoints = game.current.progression.skillPoints;
  const result = await triggerWarehouseResetUseCase({ state: game.current });

  if (!result.ok) {
    notifyError(mapGameErrorToUiTextKey(result.error.code));
    return;
  }

  game.setCurrentState(result.value.state);
  restartTickLoop();
  warehouseResetRecap.value = {
    nextWarehouseLevel: result.value.nextWarehouseLevel,
    spentMoney: result.value.spentMoney,
    gainedSkillPoints:
      result.value.state.progression.skillPoints - previousSkillPoints,
  };
  notifySuccess("game.feedback.warehouseReset");
  await autosaveNow();
}

async function goHome(): Promise<void> {
  await router.push({ name: ROUTE_HOME });
}

async function autoResumeLatestSaveOnGameEntry(): Promise<void> {
  if (game.current) {
    return;
  }

  await saveMenu.refreshSlots();
  const latestSlot = saveMenu.slots[0];
  if (!latestSlot) {
    return;
  }

  await saveMenu.playSlot(latestSlot.id);
}

async function syncOfflineOnGameEntry(): Promise<void> {
  if (!game.current || !game.pendingOfflineSync || game.shouldShowOfflinePopup) {
    return;
  }

  const result = await applyOfflineProgressUseCase({
    state: game.current,
  });

  if (!result.ok) {
    notifyError(mapGameErrorToUiTextKey(result.error.code));
    return;
  }

  game.setCurrentState(result.value.state);
  game.markOfflineSyncHandled();
  if (result.value.report.countedOfflineDurationMs > 0) {
    game.setOfflineReport(result.value.report, true);
  } else {
    game.setOfflineReport(null, false);
  }
  await autosaveNow();
}

watch(
  money,
  (nextMoney) => {
    displayedMoney.value = nextMoney;
  },
  { immediate: true },
);

watch(
  packages,
  (nextPackages) => {
    displayedPackages.value = nextPackages;
  },
  { immediate: true },
);

onMounted(async () => {
  if (!ui.hasLoaded) {
    await ui.initialize("fr-FR");
  }

  terminalStatusMessage.value = t("game.terminal.ready");

  await autoResumeLatestSaveOnGameEntry();

  try {
    balanceCatalog.value = await getBalanceCatalog();
    syncDisplayedResources();
  } catch {
    notifyError("game.error.balanceLoadFailed");
  }

  await syncOfflineOnGameEntry();

  startLoops();

  globalThis.addEventListener("blur", handleVisibilityOrFocusChange);
  globalThis.addEventListener("focus", handleVisibilityOrFocusChange);
  globalThis.document.addEventListener(
    "visibilitychange",
    handleVisibilityOrFocusChange,
  );
});

onUnmounted(() => {
  clearIdleRestTimer();
  stopLoops();
  globalThis.removeEventListener("blur", handleVisibilityOrFocusChange);
  globalThis.removeEventListener("focus", handleVisibilityOrFocusChange);
  globalThis.document.removeEventListener(
    "visibilitychange",
    handleVisibilityOrFocusChange,
  );
});
</script>
