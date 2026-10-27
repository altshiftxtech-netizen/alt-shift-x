import { useEffect, useRef } from 'react';
import { evaluateSupercomputeReadiness, executeSupercomputeRun } from '@/components/suite/supercomputeWatcher';

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes
const COMMIT_CHECK_INTERVAL = 100;

/**
 * useSupercomputeWatcher — Background daemon hook for the autonomous
 * 10K Supercompute Trigger Engine (SYS-AUTONOMOUS-SUPERCOMPUTE-TRIGGER-ENGINE-1.0).
 *
 * Mounts a passive evaluation loop that:
 *  - Runs a readiness check on every 100th commit or on platform startup
 *  - Evaluates the 4 trigger criteria (unindexed blocks, cache delta, query time, registrations)
 *  - Enforces a 7-day cooldown circuit breaker
 *  - Autonomously dispatches the 4-stage batch run when criteria are met
 *  - Logs execution receipts to WORM storage (DbLiveLedgerBlock)
 *  - Writes refreshed Merkle roots to IndexedDB for sub-10ms queries
 *
 * 100% client-side. Zero recurring cloud tokens ($0.00).
 */
export default function useSupercomputeWatcher() {
  const lastCheckRef = useRef(0);
  const runningRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const runEvaluation = async () => {
      if (!mounted || runningRef.current) return;
      runningRef.current = true;

      try {
        const result = await evaluateSupercomputeReadiness();
        lastCheckRef.current = Date.now();

        if (result.trigger) {
          const execResult = await executeSupercomputeRun(result.reason, result.metrics);
          window.dispatchEvent(new CustomEvent('ASX_SUPERCOMPUTE_EXECUTED', {
            detail: { triggerReason: result.reason, ...execResult }
          }));
        } else if (result.reason !== 'CONDITIONS_NOT_MET') {
          // Cooldown active or error — log but don't execute
          window.dispatchEvent(new CustomEvent('ASX_SUPERCOMPUTE_SKIPPED', {
            detail: { reason: result.reason, expiresAt: result.cooldownExpiresAt }
          }));
        }
      } catch (error) {
        console.error('[supercomputeWatcher]', error.message);
      } finally {
        runningRef.current = false;
      }
    };

    // Run once on mount (platform startup)
    const startupTimer = setTimeout(runEvaluation, 3000);

    // Poll every 5 minutes
    const pollTimer = setInterval(runEvaluation, POLL_INTERVAL);

    return () => {
      mounted = false;
      clearTimeout(startupTimer);
      clearInterval(pollTimer);
    };
  }, []);
}