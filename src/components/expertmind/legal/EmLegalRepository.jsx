import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ScrollText } from "lucide-react";
import { EM_MSA_CODE, EM_DPA_CODE } from "./emLegalDocs";
import EmLegalDocModal from "./EmLegalDocModal";

const AMBER = "#E6A94B";
const MONO = "'Courier New', 'JetBrains Mono', monospace";

/**
 * EmLegalRepository — the "Legal Repository" section shown in the footer of all
 * ExpertMinds pages. High-contrast amber mono-spaced links to the MSA, DPA, and
 * Privacy Policy for the Forensic look. Light (landing) and dark (enterprise)
 * variants share the same amber ink.
 */
export default function EmLegalRepository({ variant = "light" }) {
  const [openCode, setOpenCode] = useState(null);
  const dark = variant === "dark";

  const linkStyle = {
    color: AMBER,
    fontFamily: MONO,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  };

  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{
        background: dark ? "rgba(230,169,75,0.04)" : "rgba(10,10,12,0.9)",
        border: `1px solid ${AMBER}33`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <ScrollText className="w-3.5 h-3.5" style={{ color: AMBER }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: AMBER, fontFamily: MONO }}>
          Legal Repository
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px]">
        <button onClick={() => setOpenCode(EM_MSA_CODE)} style={linkStyle} className="hover:opacity-80">
          &gt; Master Service Agreement
        </button>
        <button onClick={() => setOpenCode(EM_DPA_CODE)} style={linkStyle} className="hover:opacity-80">
          &gt; Data Processing Addendum
        </button>
        <Link to="/legal/privacy" style={linkStyle} className="hover:opacity-80">
          &gt; Privacy Policy
        </Link>
      </div>

      <EmLegalDocModal code={openCode} onClose={() => setOpenCode(null)} />
    </div>
  );
}