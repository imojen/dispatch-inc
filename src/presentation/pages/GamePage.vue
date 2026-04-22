<template>
  <main class="page-shell game-shell">
    <section v-if="!game.current" class="panel-card">
      <p class="message message-empty">
        {{ t("game.state.noSession") }}
      </p>
      <div class="empty-session-actions">
        <button class="button button-small button-ghost" @click="goHome">
          {{ t("game.action.backHome") }}
        </button>
      </div>
    </section>

    <template v-else>
      <section class="game-layout">
        <aside class="panel-card game-stats-panel">
          <p class="game-save-name">
            {{ activeSaveLabel }}
          </p>

          <div class="game-stats-actions-inline">
            <button
              class="button button-small game-stats-action-button"
              @click="isSkillTreeOpen = true"
            >
              {{ t("game.action.openSkills") }}
            </button>
            <button
              class="button button-small button-primary game-stats-action-button"
              :disabled="!canTriggerWarehouseReset"
              @click="triggerWarehouseResetAction"
            >
              {{ t("game.action.resetWarehouse") }}
            </button>
          </div>

          <div class="game-stats-list">
            <article class="game-stats-line">
              <p class="game-stats-cell-label">{{ t("game.stats.money") }}</p>
              <p class="game-stats-cell-value">
                {{ formatCurrency(displayedMoney) }}
              </p>
            </article>
            <article class="game-stats-line">
              <p class="game-stats-cell-label">
                {{ t("game.stats.moneyPerSec") }}
              </p>
              <p class="game-stats-cell-value">
                {{ formatCurrency(moneyPerSecond) }}
              </p>
            </article>
            <article class="game-stats-line">
              <p class="game-stats-cell-label">{{ t("game.stats.packages") }}</p>
              <p class="game-stats-cell-value">
                {{ formatCompact(displayedPackages) }}
              </p>
            </article>
            <article class="game-stats-line">
              <p class="game-stats-cell-label">
                {{ t("game.stats.packagesPerSec") }}
              </p>
              <p class="game-stats-cell-value">
                {{ formatCompact(packagesPerSecond) }}
              </p>
            </article>
            <article class="game-stats-line">
              <p class="game-stats-cell-label">
                {{ t("game.stats.tickDuration") }}
              </p>
              <p class="game-stats-cell-value">
                {{ formatDurationMs(tickDurationMs) }}
              </p>
            </article>
            <article class="game-stats-line">
              <p class="game-stats-cell-label">
                {{ t("game.stats.warehouseLevel") }}
              </p>
              <p class="game-stats-cell-value">
                {{ game.current.progression.warehouseLevel }}
              </p>
            </article>
          </div>

          <div class="game-stats-footer">
            <button
              class="button button-small button-ghost game-stats-action-button"
              @click="goHome"
            >
              {{ t("game.action.backHome") }}
            </button>
          </div>
        </aside>

        <section class="game-simulation-panel">
          <div class="warehouse-stage-frame">
            <div class="warehouse-stage">
              <img
                class="warehouse-image"
                src="/warehouse_v1.png"
                :alt="t('game.simulation.imageAlt')"
              />

              <div class="warehouse-hotspots">
                <button
                  v-for="zone in warehouseActionZones"
                  :key="zone.id"
                  class="warehouse-hotspot-button"
                  :class="{ 'warehouse-hotspot-button-disabled': !zone.canBuy }"
                  :style="zone.style"
                  :title="t(zone.labelKey)"
                  @click="onWarehouseZoneAction(zone.upgradeId)"
                >
                  <div class="warehouse-hotspot-head">
                    <i :class="zone.iconClass" aria-hidden="true" />
                    <div class="warehouse-hotspot-head-text">
                      <span class="warehouse-hotspot-name">{{
                        t(zone.labelKey)
                      }}</span>
                      <span class="warehouse-hotspot-level">
                        {{ t("game.upgrades.level") }} {{ zone.currentLevel
                        }}{{ zone.maxLevelLabel }}
                      </span>
                    </div>
                  </div>
                  <div class="warehouse-hotspot-details">
                    <p class="warehouse-hotspot-description">
                      {{ t(zone.descriptionKey) }}
                    </p>
                    <p>
                      {{ t("game.upgrades.effect") }}:
                      {{
                        formatUpgradeEffect(zone.upgradeId, zone.currentEffect)
                      }}
                      →
                      {{ formatUpgradeEffect(zone.upgradeId, zone.nextEffect) }}
                    </p>
                    <p>
                      {{ t("game.upgrades.cost") }}:
                      {{ formatCurrency(zone.currentCost) }}
                    </p>
                    <p v-if="zone.reasonKey" class="warehouse-hotspot-warning">
                      {{ t(zone.reasonKey) }}
                    </p>
                    <p v-else>
                      {{ t("game.upgrades.action.buy") }}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>
      </section>
    </template>

    <section v-if="isSkillTreeOpen && game.current" class="overlay">
      <article class="overlay-card overlay-card-large">
        <header class="panel-header panel-header-popup">
          <h2 class="popup-title">
            {{ t("game.skills.title") }}
          </h2>
          <button
            class="button button-ghost button-icon"
            :aria-label="t('common.close')"
            :title="t('common.close')"
            @click="isSkillTreeOpen = false"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div class="overlay-card-large-body skill-tree-body">
          <p class="skill-tree-summary">
            {{ t("game.skills.points") }}:
            {{ game.current.progression.skillPoints }}
          </p>
          <p class="skill-tree-summary">
            {{ t("game.skills.hidden.progressLabel") }}:
            {{ mainBranchesUnlockedProgress }}/35
          </p>

          <div class="skill-tree-grid">
            <article
              v-for="branch in skillBranchCards"
              :key="branch.id"
              class="skill-branch-card"
              :class="{ 'skill-branch-card-locked': branch.isHiddenLocked }"
            >
              <header class="skill-branch-header">
                <i :class="branch.iconClass" aria-hidden="true" />
                <div>
                  <h3>{{ t(branch.titleKey) }}</h3>
                  <p>{{ t(branch.descriptionKey) }}</p>
                </div>
              </header>

              <div class="skill-level-track">
                <span
                  v-for="level in branch.maxLevel"
                  :key="`${branch.id}-node-${level}`"
                  class="skill-level-node"
                  :class="{ 'skill-level-node-active': level <= branch.level }"
                />
              </div>

              <p class="skill-branch-meta">
                {{ t("game.skills.level") }} {{ branch.level }}/{{
                  branch.maxLevel
                }}
              </p>

              <template v-if="branch.skillId === 'offline.resilience'">
                <p class="skill-branch-meta" :title="offlineTooltip(branch)">
                  {{ t("game.skills.effect.offline.efficiency") }}:
                  {{ formatPercent(branch.offlineCurrentEfficiency) }}
                  →
                  {{ formatPercent(branch.offlineNextEfficiency) }}
                </p>
                <p class="skill-branch-meta" :title="offlineTooltip(branch)">
                  {{ t("game.skills.effect.offline.duration") }}:
                  {{ formatHours(branch.offlineCurrentDurationHours) }}
                  →
                  {{ formatHours(branch.offlineNextDurationHours) }}
                </p>
              </template>
              <p v-else-if="branch.effectLabelKey" class="skill-branch-meta">
                {{ t(branch.effectLabelKey) }}:
                {{ formatSkillEffect(branch.currentEffect) }}
                →
                {{ formatSkillEffect(branch.nextEffect) }}
              </p>
              <p v-else class="skill-branch-meta">
                {{ t("game.skills.effect.placeholder") }}
              </p>

              <p v-if="branch.statusKey" class="skill-branch-state">
                {{ t(branch.statusKey) }}
              </p>

              <button
                class="button button-small"
                :disabled="!branch.canUnlock || !branch.skillId"
                @click="
                  branch.skillId ? unlockSkillAction(branch.skillId) : undefined
                "
              >
                {{ t("game.skills.action.unlock") }}
                <span v-if="branch.nextCost !== null">
                  · {{ branch.nextCost }} {{ t("game.skills.pointShort") }}
                </span>
              </button>
            </article>
          </div>
        </div>
      </article>
    </section>

    <section v-if="warehouseResetRecap && game.current" class="overlay">
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
            <i class="fa-solid fa-xmark" aria-hidden="true" />
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
      v-if="game.shouldShowOfflinePopup && game.offlineReport"
      class="offline-modal-backdrop"
    >
      <article class="offline-modal">
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
            <i class="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <p class="offline-key-value">
          <span>{{ t("offline.report.durationLabel") }}</span>
          <strong>{{
            formatDuration(game.offlineReport.countedOfflineDurationMs)
          }}</strong>
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
import type { CSSProperties } from "vue";
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

const TICK_INTERVAL_MS = 200;
const AUTOSAVE_INTERVAL_MS = 10000;
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
  currentEffect: number;
  nextEffect: number;
  canBuy: boolean;
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

interface WarehouseActionZone {
  id: string;
  upgradeId: UpgradeId;
  iconClass: string;
  labelKey: string;
  descriptionKey: string;
  style: CSSProperties;
}

interface WarehouseActionZoneVm extends WarehouseActionZone {
  currentLevel: number;
  currentCost: number;
  currentEffect: number;
  nextEffect: number;
  canBuy: boolean;
  reasonKey?: string;
  maxLevelLabel: string;
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

const WAREHOUSE_ACTION_ZONES: readonly WarehouseActionZone[] = [
  {
    id: "employees",
    upgradeId: "employees",
    iconClass: "fa-solid fa-users",
    labelKey: "game.simulation.hotspot.employees",
    descriptionKey: "game.upgrades.employees.description",
    style: {
      top: "5%",
      left: "4%",
      width: "28%",
      height: "25%",
    },
  },
  {
    id: "scanners",
    upgradeId: "scanners",
    iconClass: "fa-solid fa-barcode",
    labelKey: "game.simulation.hotspot.scanners",
    descriptionKey: "game.upgrades.scanners.description",
    style: {
      top: "8%",
      left: "37%",
      width: "34%",
      height: "18%",
    },
  },
  {
    id: "carts",
    upgradeId: "carts",
    iconClass: "fa-solid fa-layer-group",
    labelKey: "game.simulation.hotspot.sorting",
    descriptionKey: "game.upgrades.carts.description",
    style: {
      top: "32%",
      left: "54%",
      width: "35%",
      height: "23%",
    },
  },
  {
    id: "conveyors",
    upgradeId: "conveyors",
    iconClass: "fa-solid fa-gears",
    labelKey: "game.simulation.hotspot.conveyors",
    descriptionKey: "game.upgrades.conveyors.description",
    style: {
      top: "33%",
      left: "3%",
      width: "50%",
      height: "24%",
    },
  },
  {
    id: "trucks",
    upgradeId: "trucks",
    iconClass: "fa-solid fa-truck-fast",
    labelKey: "game.simulation.hotspot.shipping",
    descriptionKey: "game.upgrades.trucks.description",
    style: {
      top: "72%",
      left: "4%",
      width: "90%",
      height: "24%",
    },
  },
];

const router = useRouter();
const game = useGameStore();
const saveMenu = useSaveMenuStore();
const ui = useUiStore();

const getBalanceCatalog = appContainer.useCases.createGetBalanceCatalog();
const runTickUseCase = appContainer.useCases.createRunTick();
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
const displayedMoney = ref(0);
const displayedPackages = ref(0);

const moneyAnimationFrame = ref<number>();
const packageAnimationFrame = ref<number>();

let tickTimer: number | undefined;
let autosaveTimer: number | undefined;
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
const activeSaveLabel = computed(() => {
  const activeSlotId = saveMenu.activeSlotId;
  if (!activeSlotId) {
    return t("app.title");
  }

  const activeSlot = saveMenu.slots.find((slot) => slot.id === activeSlotId);
  return activeSlot?.label ?? t("app.title");
});

const canTriggerWarehouseReset = computed(() => {
  return (
    game.current !== null &&
    money.value >= nextWarehouseCost.value &&
    nextWarehouseCost.value > 0
  );
});

const warehouseActionZones = computed<WarehouseActionZoneVm[]>(() => {
  const cardById = new Map(upgradeCards.value.map((card) => [card.id, card]));

  return WAREHOUSE_ACTION_ZONES.map((zone) => {
    const card = cardById.get(zone.upgradeId);

    if (!card) {
      return {
        ...zone,
        currentLevel: 0,
        currentCost: 0,
        currentEffect: 0,
        nextEffect: 0,
        canBuy: false,
        reasonKey: "errors.invalidState",
        maxLevelLabel: "",
      };
    }

    const maxLevelLabel =
      card.maxLevel !== undefined ? `/${card.maxLevel}` : "";

    return {
      ...zone,
      currentLevel: card.currentLevel,
      currentCost: card.currentCost,
      currentEffect: card.currentEffect,
      nextEffect: card.nextEffect,
      canBuy: card.canBuy,
      reasonKey: card.reasonKey,
      maxLevelLabel,
    };
  });
});

const mainBranchLevels = computed(() =>
  SKILL_BRANCHES.filter((branch) => !branch.hidden).map((branch) =>
    branch.skillId ? (game.current?.skills[branch.skillId]?.level ?? 0) : 0,
  ),
);

const mainBranchesUnlockedProgress = computed(() => {
  return mainBranchLevels.value.reduce(
    (total, level) => total + Math.min(level, MAIN_BRANCH_MAX_LEVEL),
    0,
  );
});

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
        currentEffect: 0,
        nextEffect: 0,
        canBuy: false,
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
      currentEffect: snapshot.currentEffect,
      nextEffect: snapshot.nextEffect,
      canBuy,
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
    if (isHiddenLocked) {
      statusKey = "game.skills.state.hiddenLocked";
    } else if (!hasSkillInCatalog) {
      statusKey = "game.skills.state.unavailable";
    } else if (level >= descriptor.maxLevel) {
      statusKey = "game.skills.state.maxed";
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

function formatDurationMs(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return "0";
  }
  return `${Math.round(durationMs)}`;
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

function offlineTooltip(branch: SkillBranchVm): string {
  return `${t("game.skills.effect.offline.efficiency")}: ${formatPercent(branch.offlineCurrentEfficiency)} -> ${formatPercent(branch.offlineNextEfficiency)} | ${t("game.skills.effect.offline.duration")}: ${formatHours(branch.offlineCurrentDurationHours)} -> ${formatHours(branch.offlineNextDurationHours)}`;
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
  ui.notifyError(messageKey);
}

function notifySuccess(messageKey: string): void {
  ui.notifySuccess(messageKey);
}

function notifyLoopError(
  messageKey: string,
  lastToastAt: number,
): number {
  const now = Date.now();
  if (now - lastToastAt < LOOP_ERROR_TOAST_COOLDOWN_MS) {
    return lastToastAt;
  }

  ui.notifyError(messageKey);
  return now;
}

function animateValue(
  targetRef: { value: number },
  nextValue: number,
  frameRef: { value: number | null },
): void {
  if (frameRef.value !== undefined) {
    globalThis.cancelAnimationFrame(frameRef.value);
  }

  const startValue = targetRef.value;
  const diff = nextValue - startValue;
  if (Math.abs(diff) < 0.01) {
    targetRef.value = nextValue;
    frameRef.value = undefined;
    return;
  }

  const durationMs = 220;
  const startedAt = globalThis.performance.now();

  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / durationMs);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    targetRef.value = startValue + diff * easedProgress;
    if (progress < 1) {
      frameRef.value = globalThis.requestAnimationFrame(step);
    } else {
      frameRef.value = undefined;
    }
  };

  frameRef.value = globalThis.requestAnimationFrame(step);
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

function startLoops(): void {
  if (!tickTimer) {
    tickTimer = globalThis.setInterval(() => {
      void tickOnce();
    }, TICK_INTERVAL_MS);
  }

  if (!autosaveTimer) {
    autosaveTimer = globalThis.setInterval(() => {
      void autosaveNow();
    }, AUTOSAVE_INTERVAL_MS);
  }
}

function stopLoops(): void {
  if (tickTimer) {
    globalThis.clearInterval(tickTimer);
    tickTimer = undefined;
  }

  if (autosaveTimer) {
    globalThis.clearInterval(autosaveTimer);
    autosaveTimer = undefined;
  }
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

watch(
  money,
  (nextMoney) => {
    animateValue(displayedMoney, nextMoney, moneyAnimationFrame);
  },
  { immediate: true },
);

watch(
  packages,
  (nextPackages) => {
    animateValue(displayedPackages, nextPackages, packageAnimationFrame);
  },
  { immediate: true },
);

onMounted(async () => {
  if (!ui.hasLoaded) {
    await ui.initialize("fr-FR");
  }

  await autoResumeLatestSaveOnGameEntry();

  try {
    balanceCatalog.value = await getBalanceCatalog();
  } catch {
    notifyError("game.error.balanceLoadFailed");
  }

  startLoops();
});

onUnmounted(() => {
  stopLoops();
  if (moneyAnimationFrame.value !== undefined) {
    globalThis.cancelAnimationFrame(moneyAnimationFrame.value);
  }
  if (packageAnimationFrame.value !== undefined) {
    globalThis.cancelAnimationFrame(packageAnimationFrame.value);
  }
});
</script>
