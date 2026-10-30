import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useSuiteComponent } from '@/components/suite/bridges/SuiteComponentProvider';

export default function useSelectedBridgeComponent() {
  const [params] = useSearchParams();
  const id = params.get('component');
  const { update } = useSuiteComponent();
  const [state, setState] = useState({ loading: false, error: '' });
  useEffect(() => {
    if (!id) { setState({ loading: false, error: '' }); return; }
    let cancelled = false;
    update('selected', null);
    setState({ loading: true, error: '' });
    base44.entities.Component.filter({ id }, { limit: 1 }).then(page => {
      if (cancelled) return;
      const component = page.items[0] || null;
      update('selected', component);
      setState({ loading: false, error: component ? '' : 'Selected component is unavailable.' });
    }).catch(() => {
      if (!cancelled) setState({ loading: false, error: 'Unable to load the selected component.' });
    });
    return () => { cancelled = true; };
  }, [id, update]);
  return state;
}