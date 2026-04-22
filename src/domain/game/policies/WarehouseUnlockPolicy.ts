export function canUnlockNextWarehouse(currentMoney: number, requiredCost: number): boolean {
  return currentMoney >= requiredCost
}

export function canHireEmployee(
  currentEmployees: number,
  warehouseCapacity: number,
  overcapacityRatio = 0,
): boolean {
  const maxEmployees = Math.floor(warehouseCapacity * (1 + overcapacityRatio))
  return currentEmployees < maxEmployees
}
