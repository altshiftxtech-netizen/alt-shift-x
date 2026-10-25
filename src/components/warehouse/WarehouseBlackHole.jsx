import React, { useEffect, useRef } from 'react';
import createWarehouseBlackHole from '@/components/warehouse/createWarehouseBlackHole';
import '@/components/warehouse/warehouseBlackHole.css';

export default function WarehouseBlackHole() {
  const host = useRef(null);
  useEffect(() => createWarehouseBlackHole(host.current), []);
  return <div ref={host} className="warehouse-black-hole" aria-hidden="true" />;
}