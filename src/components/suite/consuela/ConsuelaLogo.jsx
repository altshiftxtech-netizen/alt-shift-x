import React from 'react';
import '@/components/suite/consuela/consuelaLogo.css';
export default function ConsuelaLogo({ className = 'w-6 h-6' }) {
  return <span aria-hidden="true" className={`consuela-logo ${className}`}>
    <img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/2f060f7d3_generated_image.png" alt="" />
  </span>;
}