import type { BalanceCatalogDto } from '@/application/dto/balance'

export const balanceCatalogV1: BalanceCatalogDto = {
  version: 1,
  scales: [
    // Employees
    { id: 'employees.cost.v1', curve: 'exponential', base: '10', growth: '1.5', rounding: 'nearest' },
    { id: 'employees.effect.v1', curve: 'linear', base: '1', growth: '1', rounding: 'nearest' },

    // Scanners
    { id: 'scanners.cost.v1', curve: 'exponential', base: '50', growth: '1.8', rounding: 'nearest' },
    { id: 'scanners.effect.v1', curve: 'linear', base: '0', growth: '0.1', rounding: 'nearest' },

    // Conveyors (tick speed)
    { id: 'conveyors.cost.v1', curve: 'exponential', base: '100', growth: '2', rounding: 'nearest' },
    {
      id: 'conveyors.effect.v1',
      curve: 'softcap',
      base: '1',
      growth: '1.12',
      softcapAt: '3',
      softcapPower: '0.5',
      rounding: 'nearest',
      min: '1',
    },

    // Carts
    { id: 'carts.cost.v1', curve: 'exponential', base: '250', growth: '1.9', rounding: 'nearest' },
    { id: 'carts.effect.v1', curve: 'linear', base: '1', growth: '0.2', rounding: 'nearest' },

    // Trucks
    { id: 'trucks.cost.v1', curve: 'exponential', base: '500', growth: '2', rounding: 'nearest' },
    {
      id: 'trucks.effect.v1',
      curve: 'piecewise',
      base: '1',
      rounding: 'nearest',
      steps: [
        { levelFrom: 0, base: '1', growth: '1.2' },
        { levelFrom: 10, base: '6', growth: '1.1' },
      ],
    },

    // Skills: offline branch
    { id: 'skills.offline.cost.v1', curve: 'linear', base: '1', growth: '0', rounding: 'nearest' },
    {
      id: 'skills.offline.efficiency.effect.v1',
      curve: 'piecewise',
      base: '0.2',
      rounding: 'nearest',
      min: '0.2',
      max: '1.0',
      steps: [
        { levelFrom: 0, base: '0.2' },
        { levelFrom: 1, base: '0.35' },
        { levelFrom: 2, base: '0.5' },
        { levelFrom: 3, base: '0.7' },
        { levelFrom: 4, base: '0.85' },
        { levelFrom: 5, base: '1.0' },
      ],
    },

    // Skills: staff branch
    { id: 'skills.staff.cost.v1', curve: 'linear', base: '1', growth: '0', rounding: 'nearest' },
    {
      id: 'skills.staff.effect.v1',
      curve: 'piecewise',
      base: '1',
      rounding: 'nearest',
      min: '1',
      max: '50',
      steps: [
        { levelFrom: 0, base: '1' },
        { levelFrom: 1, base: '2' },
        { levelFrom: 2, base: '4' },
        { levelFrom: 3, base: '10' },
        { levelFrom: 4, base: '20' },
        { levelFrom: 5, base: '50' },
      ],
    },

    // Skills: scan branch
    { id: 'skills.scan.cost.v1', curve: 'linear', base: '1', growth: '0', rounding: 'nearest' },
    {
      id: 'skills.scan.effect.v1',
      curve: 'piecewise',
      base: '1',
      rounding: 'nearest',
      min: '1',
      max: '12',
      steps: [
        { levelFrom: 0, base: '1' },
        { levelFrom: 1, base: '2' },
        { levelFrom: 2, base: '3' },
        { levelFrom: 3, base: '5' },
        { levelFrom: 4, base: '8' },
        { levelFrom: 5, base: '12' },
      ],
    },

    // Skills: conveyor branch
    { id: 'skills.conveyor.cost.v1', curve: 'linear', base: '1', growth: '0', rounding: 'nearest' },
    {
      id: 'skills.conveyor.effect.v1',
      curve: 'piecewise',
      base: '1',
      rounding: 'nearest',
      min: '1',
      max: '5',
      steps: [
        { levelFrom: 0, base: '1' },
        { levelFrom: 1, base: '1.5' },
        { levelFrom: 2, base: '2' },
        { levelFrom: 3, base: '3' },
        { levelFrom: 4, base: '4' },
        { levelFrom: 5, base: '5' },
      ],
    },

    // Skills: sorting branch
    { id: 'skills.sorting.cost.v1', curve: 'linear', base: '1', growth: '0', rounding: 'nearest' },
    {
      id: 'skills.sorting.effect.v1',
      curve: 'piecewise',
      base: '1',
      rounding: 'nearest',
      min: '1',
      max: '5',
      steps: [
        { levelFrom: 0, base: '1' },
        { levelFrom: 1, base: '1.5' },
        { levelFrom: 2, base: '2' },
        { levelFrom: 3, base: '3' },
        { levelFrom: 4, base: '4' },
        { levelFrom: 5, base: '5' },
      ],
    },

    // Skills: shipping branch
    { id: 'skills.shipping.cost.v1', curve: 'linear', base: '1', growth: '0', rounding: 'nearest' },
    {
      id: 'skills.shipping.effect.v1',
      curve: 'piecewise',
      base: '1',
      rounding: 'nearest',
      min: '1',
      max: '6',
      steps: [
        { levelFrom: 0, base: '1' },
        { levelFrom: 1, base: '2' },
        { levelFrom: 2, base: '3' },
        { levelFrom: 3, base: '4' },
        { levelFrom: 4, base: '5' },
        { levelFrom: 5, base: '6' },
      ],
    },

    // Skills: warehouse branch
    { id: 'skills.warehouse.cost.v1', curve: 'linear', base: '1', growth: '0', rounding: 'nearest' },
    {
      id: 'skills.warehouse.effect.v1',
      curve: 'piecewise',
      base: '1',
      rounding: 'nearest',
      min: '1',
      max: '6',
      steps: [
        { levelFrom: 0, base: '1' },
        { levelFrom: 1, base: '2' },
        { levelFrom: 2, base: '3' },
        { levelFrom: 3, base: '4' },
        { levelFrom: 4, base: '5' },
        { levelFrom: 5, base: '6' },
      ],
    },

    // Skills: hidden cheat branch
    { id: 'skills.cheat.cost.v1', curve: 'linear', base: '1', growth: '0', rounding: 'nearest' },
    {
      id: 'skills.cheat.effect.v1',
      curve: 'piecewise',
      base: '1',
      rounding: 'nearest',
      min: '1',
      max: '3.9',
      steps: [
        { levelFrom: 0, base: '1' },
        { levelFrom: 1, base: '1.2' },
        { levelFrom: 2, base: '1.5' },
        { levelFrom: 3, base: '1.5' },
        { levelFrom: 4, base: '1.95' },
        { levelFrom: 5, base: '3.9' },
      ],
    },
    {
      id: 'skills.offline.duration.effect.v1',
      curve: 'piecewise',
      base: '1',
      rounding: 'nearest',
      min: '1',
      max: '6',
      steps: [
        { levelFrom: 0, base: '1' },
        { levelFrom: 1, base: '2' },
        { levelFrom: 2, base: '3' },
        { levelFrom: 3, base: '4' },
        { levelFrom: 4, base: '5' },
        { levelFrom: 5, base: '6' },
      ],
    },

    // Warehouses
    { id: 'warehouses.cost.v1', curve: 'power', base: '1000', exponent: '2', rounding: 'nearest' },
    { id: 'warehouses.capacity.v1', curve: 'linear', base: '5', growth: '5', rounding: 'nearest' },
  ],
  upgrades: [
    { upgradeId: 'employees', costScaleId: 'employees.cost.v1', effectScaleId: 'employees.effect.v1' },
    { upgradeId: 'scanners', costScaleId: 'scanners.cost.v1', effectScaleId: 'scanners.effect.v1' },
    { upgradeId: 'conveyors', costScaleId: 'conveyors.cost.v1', effectScaleId: 'conveyors.effect.v1' },
    { upgradeId: 'carts', costScaleId: 'carts.cost.v1', effectScaleId: 'carts.effect.v1' },
    { upgradeId: 'trucks', costScaleId: 'trucks.cost.v1', effectScaleId: 'trucks.effect.v1' },
  ],
  skills: [
    {
      upgradeId: 'staff.mastery',
      maxLevel: 5,
      costScaleId: 'skills.staff.cost.v1',
      effectScaleId: 'skills.staff.effect.v1',
    },
    {
      upgradeId: 'scan.mastery',
      maxLevel: 5,
      costScaleId: 'skills.scan.cost.v1',
      effectScaleId: 'skills.scan.effect.v1',
    },
    {
      upgradeId: 'conveyor.mastery',
      maxLevel: 5,
      costScaleId: 'skills.conveyor.cost.v1',
      effectScaleId: 'skills.conveyor.effect.v1',
    },
    {
      upgradeId: 'sorting.mastery',
      maxLevel: 5,
      costScaleId: 'skills.sorting.cost.v1',
      effectScaleId: 'skills.sorting.effect.v1',
    },
    {
      upgradeId: 'shipping.mastery',
      maxLevel: 5,
      costScaleId: 'skills.shipping.cost.v1',
      effectScaleId: 'skills.shipping.effect.v1',
    },
    {
      upgradeId: 'warehouse.mastery',
      maxLevel: 5,
      costScaleId: 'skills.warehouse.cost.v1',
      effectScaleId: 'skills.warehouse.effect.v1',
    },
    {
      upgradeId: 'offline.resilience',
      maxLevel: 5,
      costScaleId: 'skills.offline.cost.v1',
      effectScaleId: 'skills.offline.efficiency.effect.v1',
    },
    {
      upgradeId: 'cheat.optimization',
      maxLevel: 5,
      costScaleId: 'skills.cheat.cost.v1',
      effectScaleId: 'skills.cheat.effect.v1',
    },
  ],
  warehouses: [
    {
      upgradeId: 'warehouse.progression',
      costScaleId: 'warehouses.cost.v1',
      effectScaleId: 'warehouses.capacity.v1',
    },
  ],
}
