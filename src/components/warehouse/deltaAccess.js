export const DELTA_SECURITY_STANDARD = 'SYS-DELTA-WAREHOUSE-IP-GATING-SECURITY-STANDARD-1.0';
export const canInspectDelta = user => Boolean(user?.id && ['developer', 'builder', 'admin'].includes(user.role));
export const deltaReturnPath = () => window.location.pathname + window.location.search;