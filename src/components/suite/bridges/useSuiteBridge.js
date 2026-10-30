import { useEffect, useRef, useState } from 'react';
import openSuiteBridge from '@/components/suite/bridges/openSuiteBridge';

export default function useSuiteBridge(payload) {
  const cancelRef = useRef(null);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  useEffect(() => {
    cancelRef.current?.(); cancelRef.current = null;
    setStatus({ state: 'idle', message: '' });
    return () => cancelRef.current?.();
  }, [payload]);
  const handleSuiteBridge = target => {
    cancelRef.current?.();
    try { cancelRef.current = openSuiteBridge(target, payload, setStatus); }
    catch (error) { setStatus({ state: 'error', message: error.message }); }
  };
  const cancel = () => {
    cancelRef.current?.(); cancelRef.current = null;
    setStatus({ state: 'idle', message: 'Bridge cancelled.' });
  };
  return { handleSuiteBridge, status, cancel };
}