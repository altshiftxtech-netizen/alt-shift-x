export function canAccessDeltaWarehouse(user) {
  return Boolean(user?.id && ['developer', 'builder', 'admin'].includes(user.role));
}