import React, { createContext, useCallback, useContext, useState } from 'react';

const SuiteComponentContext = createContext(null);
export default function SuiteComponentProvider({ children }) {
  const [drafts, setDrafts] = useState({ builder: null, selected: null, publishing: null });
  const update = useCallback((source, payload) => {
    setDrafts(previous => ({ ...previous, [source]: payload }));
  }, []);
  const source = drafts.builder ? 'builder' : drafts.selected ? 'selected' : drafts.publishing ? 'publishing' : null;
  return <SuiteComponentContext.Provider value={{ payload: source ? drafts[source] : null, source, update }}>
    {children}
  </SuiteComponentContext.Provider>;
}
export function useSuiteComponent() {
  return useContext(SuiteComponentContext);
}