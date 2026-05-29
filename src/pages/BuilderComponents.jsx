import React, { useState } from "react";
import ComponentsHeader from "@/components/builder-components/ComponentsHeader";
import ComponentCard from "@/components/builder-components/ComponentCard";
import VersionHistoryDrawer from "@/components/builder-components/VersionHistoryDrawer.jsx";

const MOCK_COMPONENTS = [
  {
    id: "rp-construction",
    name: "RP-CONSTRUCTION-1.0",
    displayName: "Ironclad Protocol",
    type: "X1",
    version: "v2.4.1",
    status: "published",
    installs: 847,
    revenue: 4235,
    trustScore: 91,
    category: "Risk & Compliance",
    description: "Extracts and validates all contractual risk indicators from subcontractor agreements, including retention clauses, liquidated damages, and milestone obligations.",
    publishedAt: "May 12, 2026",
    versions: [
      { version: "v2.4.1", date: "May 12, 2026", notes: "Improved retention clause detection accuracy to 98.1%.", status: "live" },
      { version: "v2.4.0", date: "Apr 28, 2026", notes: "Added support for NZS 3910 contract templates.", status: "archived" },
      { version: "v2.3.2", date: "Mar 15, 2026", notes: "Hotfix: Fixed false positive on milestone extraction for multi-stage projects.", status: "archived" },
      { version: "v2.3.0", date: "Feb 1, 2026", notes: "Major overhaul of Pass 3 cross-reference engine.", status: "archived" },
    ],
  },
  {
    id: "pm-construction",
    name: "PM-CONSTRUCTION-BID",
    displayName: "Estimator's Eye",
    type: "X2",
    version: "v1.9.3",
    status: "published",
    installs: 312,
    revenue: 1872,
    trustScore: 87,
    category: "Project Management",
    description: "Parses construction bid estimates and extracts division-level costs, alternates, contingencies, and validity windows for comparison and audit workflows.",
    publishedAt: "Apr 5, 2026",
    versions: [
      { version: "v1.9.3", date: "Apr 5, 2026", notes: "Fixed benchmark regression in Pass 1 classification.", status: "live" },
      { version: "v1.9.2", date: "Mar 20, 2026", notes: "Added Alternate item detection for up to 10 alternates.", status: "archived" },
      { version: "v1.9.0", date: "Feb 12, 2026", notes: "Initial support for CSI MasterFormat division parsing.", status: "archived" },
    ],
  },
  {
    id: "rc-construction",
    name: "RC-CONSTRUCTION",
    displayName: "The Site Board",
    type: "X4",
    version: "v3.1.0",
    status: "published",
    installs: 203,
    revenue: 811,
    trustScore: 93,
    category: "Site Reporting",
    description: "Transforms daily site reports into structured data: workforce counts, work completed/delayed, RFI tracking, materials received, and programme impact.",
    publishedAt: "May 1, 2026",
    versions: [
      { version: "v3.1.0", date: "May 1, 2026", notes: "Added programme impact delta extraction and chained RFI resolution tracking.", status: "live" },
      { version: "v3.0.1", date: "Apr 10, 2026", notes: "Hotfix: Weather field parsing for non-standard formats.", status: "archived" },
      { version: "v3.0.0", date: "Mar 1, 2026", notes: "Full rewrite using new 4-pass pipeline architecture.", status: "archived" },
    ],
  },
  {
    id: "rc-construction-draft",
    name: "RP-CONSTRUCTION-2.0",
    displayName: "Ironclad Protocol 2.0",
    type: "X1",
    version: "v0.1.0-draft",
    status: "draft",
    installs: 0,
    revenue: 0,
    trustScore: null,
    category: "Risk & Compliance",
    description: "Next-generation risk extraction with support for AS 4000-1997, NEC4, and FIDIC contract families. Includes multi-party agreement parsing.",
    publishedAt: null,
    versions: [
      { version: "v0.1.0-draft", date: "May 27, 2026", notes: "Initial draft. Schema defined, Pass 1 in development.", status: "draft" },
    ],
  },
];

export default function BuilderComponents() {
  const [drawerComponent, setDrawerComponent] = useState(null);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? MOCK_COMPONENTS : MOCK_COMPONENTS.filter(c => c.status === filter);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ComponentsHeader filter={filter} onFilter={setFilter} total={MOCK_COMPONENTS.length} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map(comp => (
            <ComponentCard
              key={comp.id}
              component={comp}
              onViewHistory={() => setDrawerComponent(comp)}
            />
          ))}
        </div>
      </div>
      {drawerComponent && (
        <VersionHistoryDrawer
          component={drawerComponent}
          onClose={() => setDrawerComponent(null)}
        />
      )}
    </div>
  );
}