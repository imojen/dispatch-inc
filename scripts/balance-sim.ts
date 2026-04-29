import type { BalanceCatalogDto, ScaleSpecDto } from "../src/application/dto/balance";
import type { GameStateDto, LevelStateDto } from "../src/application/dto/game";
import { createInitialGameState } from "../src/application/useCases/save/helpers";
import { GameViewModelResolver } from "../src/application/useCases/game/viewModel";
import { balanceCatalogV1 } from "../src/data/balance/catalog.v1";

type SkillId =
  | "staff.mastery"
  | "scan.mastery"
  | "conveyor.mastery"
  | "sorting.mastery"
  | "shipping.mastery"
  | "warehouse.mastery";

type UpgradeId = "employees" | "scanners" | "conveyors" | "carts" | "trucks";

interface SimRunResult {
  warehouseLevel: number;
  targetPackages: number;
  durationSeconds: number;
  purchases: Record<UpgradeId, number>;
  chosenSkillForNextRun?: SkillId;
}

interface SimCampaignResult {
  scenario: string;
  runs: SimRunResult[];
}

interface PlayerProfile {
  id: string;
  label: string;
  scoreWeights: {
    moneyPerSecond: number;
    packagesPerSecond: number;
    costExponent: number;
  };
  upgradeBias: Record<UpgradeId, number>;
  skillBias: Record<SkillId, number>;
}

interface ProfileCampaignResult {
  profile: PlayerProfile;
  campaign: SimCampaignResult;
}

interface AggregateDurationStats {
  minSeconds: number;
  maxSeconds: number;
  averageSeconds: number;
  medianSeconds: number;
}

interface RequirementRecommendationRun {
  warehouseLevel: number;
  targetPackages: number;
  stats: AggregateDurationStats;
  profileDurations: Record<string, number>;
}

interface RequirementRecommendationResult {
  requirements: number[];
  runs: RequirementRecommendationRun[];
}

interface ProfileProgressState {
  profile: PlayerProfile;
  skills: Record<string, LevelStateDto>;
}

const SKILL_IDS: readonly SkillId[] = [
  "staff.mastery",
  "scan.mastery",
  "conveyor.mastery",
  "sorting.mastery",
  "shipping.mastery",
  "warehouse.mastery",
];

const UPGRADE_IDS: readonly UpgradeId[] = [
  "employees",
  "scanners",
  "conveyors",
  "carts",
  "trucks",
];

const PLAYER_PROFILES: readonly PlayerProfile[] = [
  {
    id: "balanced",
    label: "Balanced operator",
    scoreWeights: {
      moneyPerSecond: 1,
      packagesPerSecond: 1.15,
      costExponent: 0.95,
    },
    upgradeBias: {
      employees: 1.1,
      scanners: 1,
      conveyors: 1.05,
      carts: 0.95,
      trucks: 0.9,
    },
    skillBias: {
      "staff.mastery": 1.05,
      "scan.mastery": 1,
      "conveyor.mastery": 1.03,
      "sorting.mastery": 1,
      "shipping.mastery": 0.97,
      "warehouse.mastery": 0.98,
    },
  },
  {
    id: "flow",
    label: "Flow optimizer",
    scoreWeights: {
      moneyPerSecond: 0.9,
      packagesPerSecond: 1.35,
      costExponent: 1,
    },
    upgradeBias: {
      employees: 1,
      scanners: 1.08,
      conveyors: 1.18,
      carts: 1,
      trucks: 0.82,
    },
    skillBias: {
      "staff.mastery": 1,
      "scan.mastery": 1.06,
      "conveyor.mastery": 1.12,
      "sorting.mastery": 1.03,
      "shipping.mastery": 0.9,
      "warehouse.mastery": 0.95,
    },
  },
  {
    id: "workforce",
    label: "Workforce first",
    scoreWeights: {
      moneyPerSecond: 0.95,
      packagesPerSecond: 1.2,
      costExponent: 0.9,
    },
    upgradeBias: {
      employees: 1.25,
      scanners: 0.98,
      conveyors: 1,
      carts: 0.92,
      trucks: 0.8,
    },
    skillBias: {
      "staff.mastery": 1.12,
      "scan.mastery": 0.98,
      "conveyor.mastery": 0.98,
      "sorting.mastery": 0.95,
      "shipping.mastery": 0.9,
      "warehouse.mastery": 1.02,
    },
  },
  {
    id: "value",
    label: "Value hunter",
    scoreWeights: {
      moneyPerSecond: 1.2,
      packagesPerSecond: 1,
      costExponent: 1.05,
    },
    upgradeBias: {
      employees: 1,
      scanners: 1.02,
      conveyors: 0.97,
      carts: 1.08,
      trucks: 1.06,
    },
    skillBias: {
      "staff.mastery": 1,
      "scan.mastery": 1,
      "conveyor.mastery": 0.96,
      "sorting.mastery": 1.06,
      "shipping.mastery": 1.08,
      "warehouse.mastery": 0.97,
    },
  },
];

function deepCloneCatalog(catalog: BalanceCatalogDto): BalanceCatalogDto {
  return JSON.parse(JSON.stringify(catalog)) as BalanceCatalogDto;
}

function setScale(
  catalog: BalanceCatalogDto,
  scaleId: string,
  patch: Partial<ScaleSpecDto>,
): void {
  const scale = catalog.scales.find((entry) => entry.id === scaleId);
  if (!scale) {
    throw new Error(`Unknown scale ${scaleId}`);
  }

  Object.assign(scale, patch);
}

function setPiecewiseBases(
  catalog: BalanceCatalogDto,
  scaleId: string,
  bases: string[],
): void {
  const scale = catalog.scales.find((entry) => entry.id === scaleId);
  if (!scale || !scale.steps) {
    throw new Error(`Unknown piecewise scale ${scaleId}`);
  }

  scale.steps = scale.steps.map((step, index) => ({
    ...step,
    base: bases[index] ?? step.base,
  }));
}

function setWarehouseRequirements(catalog: BalanceCatalogDto, values: number[]): void {
  setScale(catalog, "warehouses.cost.v1", {
    curve: "piecewise",
    base: "0",
    rounding: "nearest",
    steps: values.map((value, index) => ({
      levelFrom: index + 1,
      base: String(value),
    })),
  });
}

function buildPleasantCandidateCatalog(): BalanceCatalogDto {
  const catalog = deepCloneCatalog(balanceCatalogV1);

  setScale(catalog, "employees.cost.v1", {
    curve: "exponential",
    base: "10",
    growth: "1.52",
    rounding: "nearest",
  });
  setScale(catalog, "scanners.cost.v1", {
    curve: "exponential",
    base: "45",
    growth: "1.68",
    rounding: "nearest",
  });
  setScale(catalog, "conveyors.cost.v1", {
    curve: "exponential",
    base: "80",
    growth: "1.72",
    rounding: "nearest",
  });
  setScale(catalog, "carts.cost.v1", {
    curve: "exponential",
    base: "130",
    growth: "1.78",
    rounding: "nearest",
  });
  setScale(catalog, "trucks.cost.v1", {
    curve: "exponential",
    base: "210",
    growth: "1.84",
    rounding: "nearest",
  });

  setScale(catalog, "scanners.effect.v1", {
    curve: "linear",
    base: "0",
    growth: "0.11",
    rounding: "nearest",
  });
  setScale(catalog, "conveyors.effect.v1", {
    curve: "softcap",
    base: "1",
    growth: "1.12",
    softcapAt: "2.45",
    softcapPower: "0.6",
    rounding: "nearest",
    min: "1",
  });
  setScale(catalog, "carts.effect.v1", {
    curve: "linear",
    base: "1",
    growth: "0.14",
    rounding: "nearest",
  });
  setScale(catalog, "trucks.effect.v1", {
    curve: "linear",
    base: "1",
    growth: "0.12",
    rounding: "nearest",
  });

  setPiecewiseBases(catalog, "skills.staff.effect.v1", [
    "1",
    "1.5",
    "2.25",
    "3.38",
    "5.07",
    "7.6",
  ]);
  setPiecewiseBases(catalog, "skills.scan.effect.v1", [
    "1",
    "1.5",
    "2.25",
    "3.38",
    "5.07",
    "7.6",
  ]);
  setPiecewiseBases(catalog, "skills.conveyor.effect.v1", [
    "1",
    "1.5",
    "2.25",
    "3.38",
    "5.07",
    "7.6",
  ]);
  setPiecewiseBases(catalog, "skills.sorting.effect.v1", [
    "1",
    "1.5",
    "2.25",
    "3.38",
    "5.07",
    "7.6",
  ]);
  setPiecewiseBases(catalog, "skills.shipping.effect.v1", [
    "1",
    "1.5",
    "2.25",
    "3.38",
    "5.07",
    "7.6",
  ]);
  setPiecewiseBases(catalog, "skills.warehouse.effect.v1", [
    "1",
    "1.5",
    "2.25",
    "3.38",
    "5.07",
    "7.6",
  ]);

  setWarehouseRequirements(catalog, [3000, 9000, 20000, 36000, 58000, 86000, 121000, 163000]);

  return catalog;
}

function createBaseState(warehouseLevel: number, skills: Record<string, LevelStateDto>): GameStateDto {
  const state = createInitialGameState("2026-04-29T00:00:00.000Z");
  return {
    ...state,
    progression: {
      ...state.progression,
      warehouseLevel,
      skillPoints: 0,
    },
    skills,
  };
}

function cloneState(state: GameStateDto): GameStateDto {
  return JSON.parse(JSON.stringify(state)) as GameStateDto;
}

function getLevel(record: Record<string, LevelStateDto>, id: string): number {
  return record[id]?.level ?? 0;
}

function chooseUpgrade(
  state: GameStateDto,
  resolver: GameViewModelResolver,
  profile: PlayerProfile,
): UpgradeId | null {
  const snapshot = resolver.createSnapshot(state);
  const currentMoney = Number(state.resources.money);
  const affordable = UPGRADE_IDS.filter((id) => {
    const upgrade = snapshot.upgrades[id];
    if (!upgrade || (upgrade.maxLevel !== undefined && upgrade.currentLevel >= upgrade.maxLevel)) {
      return false;
    }

    if (id === "employees" && snapshot.employees >= snapshot.warehouseCapacity) {
      return false;
    }

    return currentMoney >= upgrade.currentCost;
  });

  let bestId: UpgradeId | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const id of affordable) {
    const previewState = cloneState(state);
    previewState.resources.money = String(
      Math.max(0, Number(previewState.resources.money) - snapshot.upgrades[id].currentCost),
    );
    previewState.upgrades[id] = { level: snapshot.upgrades[id].nextLevel };

    const preview = resolver.createSnapshot(previewState);
    const deltaMoneyPerSecond = preview.moneyPerSecond - snapshot.moneyPerSecond;
    const deltaPackagesPerSecond = preview.packagesPerSecond - snapshot.packagesPerSecond;
    const rawGain =
      deltaMoneyPerSecond * profile.scoreWeights.moneyPerSecond +
      deltaPackagesPerSecond * profile.scoreWeights.packagesPerSecond;
    const normalizedGain =
      rawGain /
      Math.pow(Math.max(1, snapshot.upgrades[id].currentCost), profile.scoreWeights.costExponent);
    const score = normalizedGain * profile.upgradeBias[id];

    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  return bestId;
}

function simulateSingleRun(
  catalog: BalanceCatalogDto,
  warehouseLevel: number,
  skills: Record<string, LevelStateDto>,
  profile: PlayerProfile,
): SimRunResult {
  const resolver = new GameViewModelResolver(catalog);
  const state = createBaseState(warehouseLevel, skills);
  const purchases: Record<UpgradeId, number> = {
    employees: 0,
    scanners: 0,
    conveyors: 0,
    carts: 0,
    trucks: 0,
  };

  let elapsedSeconds = 0;
  let safety = 0;

  while (safety < 5000) {
    safety += 1;
    const snapshot = resolver.createSnapshot(state);
    const goal = snapshot.nextWarehousePackagesRequired;
    const currentPackages = Number(state.resources.packages);
    const currentMoney = Number(state.resources.money);

    if (currentPackages >= goal) {
      return {
        warehouseLevel,
        targetPackages: goal,
        durationSeconds: elapsedSeconds,
        purchases,
      };
    }

    let purchasedThisLoop = false;
    while (true) {
      const choice = chooseUpgrade(state, resolver, profile);
      if (!choice) {
        break;
      }

      const liveSnapshot = resolver.createSnapshot(state);
      const cost = liveSnapshot.upgrades[choice].currentCost;
      state.resources.money = String(Math.max(0, Number(state.resources.money) - cost));
      state.upgrades[choice] = { level: liveSnapshot.upgrades[choice].nextLevel };
      purchases[choice] += 1;
      purchasedThisLoop = true;
    }

    if (purchasedThisLoop) {
      continue;
    }

    const refreshed = resolver.createSnapshot(state);
    if (refreshed.moneyPerSecond <= 0 || refreshed.packagesPerSecond <= 0) {
      return {
        warehouseLevel,
        targetPackages: refreshed.nextWarehousePackagesRequired,
        durationSeconds: Number.POSITIVE_INFINITY,
        purchases,
      };
    }

    const timeToGoal =
      (refreshed.nextWarehousePackagesRequired - Number(state.resources.packages)) /
      refreshed.packagesPerSecond;

    const futureAffordableTimes = UPGRADE_IDS.map((id) => {
      const upgrade = refreshed.upgrades[id];
      if (
        !upgrade ||
        (upgrade.maxLevel !== undefined && upgrade.currentLevel >= upgrade.maxLevel) ||
        (id === "employees" && refreshed.employees >= refreshed.warehouseCapacity)
      ) {
        return Number.POSITIVE_INFINITY;
      }

      const missingMoney = Math.max(0, upgrade.currentCost - Number(state.resources.money));
      return missingMoney / refreshed.moneyPerSecond;
    });

    const timeToNextUpgrade = Math.min(...futureAffordableTimes);
    const deltaSeconds = Math.max(
      0.0001,
      Math.min(timeToGoal, Number.isFinite(timeToNextUpgrade) ? timeToNextUpgrade : timeToGoal),
    );

    state.resources.money = String(currentMoney + refreshed.moneyPerSecond * deltaSeconds);
    state.resources.packages = String(currentPackages + refreshed.packagesPerSecond * deltaSeconds);
    elapsedSeconds += deltaSeconds;
  }

  return {
    warehouseLevel,
    targetPackages: resolver.createSnapshot(state).nextWarehousePackagesRequired,
    durationSeconds: Number.POSITIVE_INFINITY,
    purchases,
  };
}

function pickBestNextSkill(
  catalog: BalanceCatalogDto,
  nextWarehouseLevel: number,
  currentSkills: Record<string, LevelStateDto>,
  profile: PlayerProfile,
): SkillId {
  let bestSkill = SKILL_IDS[0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const skillId of SKILL_IDS) {
    const nextLevel = getLevel(currentSkills, skillId) + 1;
    if (nextLevel > 5) {
      continue;
    }

    const nextSkills: Record<string, LevelStateDto> = {
      ...currentSkills,
      [skillId]: { level: nextLevel },
    };
    const result = simulateSingleRun(catalog, nextWarehouseLevel, nextSkills, profile);
    const score = result.durationSeconds / profile.skillBias[skillId];
    if (score < bestScore) {
      bestScore = score;
      bestSkill = skillId;
    }
  }

  return bestSkill;
}

function simulateCampaign(
  scenario: string,
  catalog: BalanceCatalogDto,
  runCount: number,
  profile: PlayerProfile,
): SimCampaignResult {
  const runs: SimRunResult[] = [];
  const skills: Record<string, LevelStateDto> = {};

  for (let warehouseLevel = 1; warehouseLevel <= runCount; warehouseLevel += 1) {
    const run = simulateSingleRun(catalog, warehouseLevel, skills, profile);
    if (warehouseLevel < runCount) {
      const chosenSkill = pickBestNextSkill(catalog, warehouseLevel + 1, skills, profile);
      run.chosenSkillForNextRun = chosenSkill;
      skills[chosenSkill] = { level: getLevel(skills, chosenSkill) + 1 };
    }
    runs.push(run);
  }

  return { scenario, runs };
}

function simulateCampaignsForProfiles(
  scenario: string,
  catalog: BalanceCatalogDto,
  runCount: number,
  profiles: readonly PlayerProfile[],
): ProfileCampaignResult[] {
  return profiles.map((profile) => ({
    profile,
    campaign: simulateCampaign(`${scenario} :: ${profile.label}`, catalog, runCount, profile),
  }));
}

function withWarehouseRequirements(
  baseCatalog: BalanceCatalogDto,
  requirements: number[],
): BalanceCatalogDto {
  const catalog = deepCloneCatalog(baseCatalog);
  setWarehouseRequirements(catalog, requirements);
  return catalog;
}

function computeAggregateDurationStats(durations: number[]): AggregateDurationStats {
  const sorted = [...durations].sort((left, right) => left - right);
  const medianIndex = Math.floor(sorted.length / 2);
  const medianSeconds =
    sorted.length % 2 === 0
      ? (sorted[medianIndex - 1] + sorted[medianIndex]) / 2
      : sorted[medianIndex];

  return {
    minSeconds: Math.min(...durations),
    maxSeconds: Math.max(...durations),
    averageSeconds: durations.reduce((total, value) => total + value, 0) / durations.length,
    medianSeconds,
  };
}

function summarizeDurationsForProfiles(
  catalog: BalanceCatalogDto,
  warehouseLevel: number,
  progressStates: readonly ProfileProgressState[],
): { stats: AggregateDurationStats; perProfile: Record<string, number> } {
  const perProfileEntries = progressStates.map((progressState) => {
    const run = simulateSingleRun(
      catalog,
      warehouseLevel,
      progressState.skills,
      progressState.profile,
    );
    return [progressState.profile.id, run.durationSeconds] as const;
  });
  const perProfile = Object.fromEntries(perProfileEntries);
  const stats = computeAggregateDurationStats(
    perProfileEntries.map(([, durationSeconds]) => durationSeconds),
  );

  return { stats, perProfile };
}

function cloneProgressStates(profiles: readonly PlayerProfile[]): ProfileProgressState[] {
  return profiles.map((profile) => ({
    profile,
    skills: {},
  }));
}

function deriveWarehouseRequirements(
  baseCatalog: BalanceCatalogDto,
  runCount: number,
  targetSeconds: number,
  profiles: readonly PlayerProfile[],
): RequirementRecommendationResult {
  const requirements: number[] = [];
  const runs: RequirementRecommendationRun[] = [];
  const progressStates = cloneProgressStates(profiles);

  for (let warehouseLevel = 1; warehouseLevel <= runCount; warehouseLevel += 1) {
    let low = 100;
    let high = 1000;

    while (true) {
      const candidateCatalog = withWarehouseRequirements(baseCatalog, [...requirements, high]);
      const attempt = summarizeDurationsForProfiles(candidateCatalog, warehouseLevel, progressStates);
      if (
        !Number.isFinite(attempt.stats.averageSeconds) ||
        attempt.stats.averageSeconds >= targetSeconds
      ) {
        break;
      }
      low = high;
      high *= 2;
      if (high > 10_000_000) {
        break;
      }
    }

    for (let step = 0; step < 24; step += 1) {
      const mid = Math.round((low + high) / 2);
      const candidateCatalog = withWarehouseRequirements(baseCatalog, [...requirements, mid]);
      const attempt = summarizeDurationsForProfiles(candidateCatalog, warehouseLevel, progressStates);

      if (
        !Number.isFinite(attempt.stats.averageSeconds) ||
        attempt.stats.averageSeconds > targetSeconds
      ) {
        high = mid;
      } else {
        low = mid;
      }
    }

    const rounded = Math.round(low / 100) * 100;
    requirements.push(rounded);

    const lockedCatalog = withWarehouseRequirements(baseCatalog, requirements);
    const summary = summarizeDurationsForProfiles(lockedCatalog, warehouseLevel, progressStates);

    if (warehouseLevel < runCount) {
      for (const progressState of progressStates) {
        const chosenSkill = pickBestNextSkill(
          lockedCatalog,
          warehouseLevel + 1,
          progressState.skills,
          progressState.profile,
        );
        progressState.skills[chosenSkill] = {
          level: getLevel(progressState.skills, chosenSkill) + 1,
        };
      }
    }

    runs.push({
      warehouseLevel,
      targetPackages: rounded,
      stats: summary.stats,
      profileDurations: summary.perProfile,
    });
  }

  return { requirements, runs };
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) {
    return "deadlock";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}m${remainingSeconds}s`;
}

function printCampaign(result: ProfileCampaignResult): void {
  console.log(`\n=== ${result.campaign.scenario} ===`);
  for (const run of result.campaign.runs) {
    const purchases = UPGRADE_IDS.map((id) => `${id}:${run.purchases[id]}`).join(" ");
    const skillSuffix = run.chosenSkillForNextRun
      ? ` -> next skill: ${run.chosenSkillForNextRun}`
      : "";
    console.log(
      `W${run.warehouseLevel} quota=${run.targetPackages} duration=${formatDuration(run.durationSeconds)} ${purchases}${skillSuffix}`,
    );
  }
}

function printRequirementRecommendation(result: RequirementRecommendationResult): void {
  console.log("\nRecommended warehouse requirements for ~10 min runs (multi-profile average):");
  console.log(result.requirements.join(", "));

  console.log("\n=== multi-profile recommendation summary ===");
  for (const run of result.runs) {
    const profileStats = PLAYER_PROFILES.map(
      (profile) => `${profile.id}:${formatDuration(run.profileDurations[profile.id])}`,
    ).join(" ");
    console.log(
      `W${run.warehouseLevel} quota=${run.targetPackages} avg=${formatDuration(run.stats.averageSeconds)} median=${formatDuration(run.stats.medianSeconds)} min=${formatDuration(run.stats.minSeconds)} max=${formatDuration(run.stats.maxSeconds)} ${profileStats}`,
    );
  }
}

const currentCampaigns = simulateCampaignsForProfiles(
  "current catalog",
  balanceCatalogV1,
  8,
  PLAYER_PROFILES,
);
const pleasantBaseCatalog = buildPleasantCandidateCatalog();
const pleasantCampaigns = simulateCampaignsForProfiles(
  "pleasant candidate",
  pleasantBaseCatalog,
  8,
  PLAYER_PROFILES,
);
const derived = deriveWarehouseRequirements(pleasantBaseCatalog, 8, 600, PLAYER_PROFILES);

for (const campaign of currentCampaigns) {
  printCampaign(campaign);
}

for (const campaign of pleasantCampaigns) {
  printCampaign(campaign);
}

printRequirementRecommendation(derived);
