import React, { useId } from 'react';
import '@/components/suite/about/aboutSuiteWaves.css';
export default function AboutSuiteWaves() {
  const id = useId().replace(/:/g, '');
  return <div className="about-suite-waves" aria-hidden="true">
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs><linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2=".3"><stop offset="0" stopColor="currentColor" stopOpacity="0" /><stop offset=".3" stopColor="currentColor" stopOpacity=".45" /><stop offset=".6" stopColor="currentColor" stopOpacity=".9" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
      <g className="about-wave-flow about-wave-flow-back" fill="none" stroke={`url(#${id}-gold)`}>
        {Array.from({ length: 19 }, (_, i) => <path key={i} strokeWidth={i % 5 === 0 ? 1.6 : .65} d={`M -240 ${370 + i * 10} C 140 ${-80 + i * 15}, 450 ${980 - i * 9}, 850 ${540 + i * 9} S 1440 ${160 + i * 12}, 1860 ${470 + i * 8}`} />)}
      </g>
      <g className="about-wave-flow about-wave-flow-front" fill="none" stroke={`url(#${id}-gold)`}>
        {Array.from({ length: 24 }, (_, i) => <path key={i} strokeWidth={i % 6 === 0 ? 1.8 : .7} d={`M -220 ${820 + i * 7} C 240 ${1030 - i * 11}, 410 ${300 + i * 13}, 940 ${680 + i * 8} S 1470 ${730 - i * 13}, 1840 ${320 + i * 10}`} />)}
      </g>
    </svg>
  </div>;
}