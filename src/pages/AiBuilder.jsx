import React from 'react';
import BuilderBobInit from '@/pages/BuilderBobInit';
import SuiteIntegrationActionBar from '@/components/suite/bridges/SuiteIntegrationActionBar';
import useSelectedBridgeComponent from '@/components/suite/bridges/useSelectedBridgeComponent';

export default function AiBuilder() {
  const { loading, error } = useSelectedBridgeComponent();
  const actions = <>
    <SuiteIntegrationActionBar loading={loading} />
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </>;
  return <BuilderBobInit workspaceActions={actions} />;
}