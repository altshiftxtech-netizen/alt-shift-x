import { useEffect } from 'react';
import { useSuiteComponent } from '@/components/suite/bridges/SuiteComponentProvider';

export default function useBridgeDraft(source, payload, retain = false) {
  const { update } = useSuiteComponent();
  const serialized = payload && (payload.name || payload.code || payload.displayName) ? JSON.stringify(payload) : null;
  useEffect(() => {
    update(source, serialized ? JSON.parse(serialized) : null);
  }, [source, serialized, update]);
  useEffect(() => () => { if (!retain) update(source, null); }, [source, retain, update]);
}