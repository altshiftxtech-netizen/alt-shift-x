import React from 'react';
import { Link } from 'react-router-dom';
export default function AboutSuiteLogo({ onNavigate }) {
  return <Link to="/suite" onClick={onNavigate} className="about-suite-header-logo" aria-label="Open suite hub">
    <img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/44045c680_generated_image.png" alt="altshiftx.tech suite logo" width="48" height="48" className="object-contain mix-blend-screen contrast-150" />
  </Link>;
}