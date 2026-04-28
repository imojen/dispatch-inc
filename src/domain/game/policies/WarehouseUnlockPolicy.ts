export function canUnlockNextWarehouse(
  currentPackages: number,
  requiredPackages: number,
): boolean {
  return currentPackages >= requiredPackages
}

export function canHireEmployee(
  currentEmployees: number,
  warehouseCapacity: number,
  overcapacityRatio = 0,
): boolean {
  const maxEmployees = Math.floor(warehouseCapacity * (1 + overcapacityRatio))
  return currentEmployees < maxEmployees
}
