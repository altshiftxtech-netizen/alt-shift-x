import React from 'react';
import { Link } from 'react-router-dom';
import '@/components/suite/hubNavigation.css';

export default function HubBrand() {
  return <Link to="/aibuilder" aria-label="Open AI Builder" className="hub-brand">
    <img className="hub-brand-mark rounded-[22.5%]" src="https://base44.app/api/apps/6a19363c90f06323c4cfff73/files/mp/public/6a19363c90f06323c4cfff73/f285b9e23_altxlogo2.jpeg" alt="Alt+Shift+X prismatic crystal emblem" />
    <span className="hub-brand-copy"><strong>Alt+Shift+X</strong><span>Sovereign Component &amp; Intelligence Foundry</span></span>
  </Link>;
}