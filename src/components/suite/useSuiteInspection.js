import { useEffect, useRef, useState } from 'react';

export default function useSuiteInspection(pause) {
  const [inspectionIndex, setInspectionIndex] = useState(null);
  const timer = useRef(null);
  const keepOpen = () => clearTimeout(timer.current);
  const inspect = index => { keepOpen(); pause(); setInspectionIndex(index); };
  const dismiss = () => { keepOpen(); setInspectionIndex(null); };
  const leave = () => { keepOpen(); timer.current = setTimeout(() => setInspectionIndex(null), 250); };
  useEffect(() => () => clearTimeout(timer.current), []);
  return { inspectionIndex, inspect, keepOpen, dismiss, leave };
}