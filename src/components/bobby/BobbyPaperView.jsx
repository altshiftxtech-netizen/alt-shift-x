import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { Download, Loader2, ShieldCheck, FileText } from "lucide-react";
import CleanDocRenderer from "@/components/bobby/CleanDocRenderer";
import BobbyDocNav from "@/components/bobby/BobbyDocNav";

// Right pane (80%) — the "Papers" view document canvas (PDF-reader aesthetic).
// Download injects the ESI Seal hash into PDF metadata + a gold watermark.
export default function BobbyPaperView({ document: doc, esiSeal, sealedAt, onDownloadDone }) {
  const [downloading, setDownloading] = useState(false);
  const scrollRef = useRef(null);

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="text-center">
          <FileText className="w-10 h-10 text-[#D4AF37]/30 mx-auto mb-3" />
          <p className="text-sm text-white/40">Select a document from the index to begin.</p>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    setDownloading(true);
    try {
      const pdf = new jsPDF({ unit: "pt", format: "letter" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // ── SOV-AUTH-SEAL-CERT-1.0 — inject ESI Seal + watermark into metadata ──
      pdf.setProperties({
        title: doc.title,
        subject: doc.subtitle,
        author: "BOBby Build Yielder",
        keywords: `ESI-SEAL:${esiSeal || "none"}; SOV-AUTH-SEAL-CERT-1.0; GSP-MASTER-INDEX-1.0`,
        creator: "SOV-DOC-ENGINE-PWA-1.0",
      });

      // Gold diagonal watermark across every page we add.
      const drawWatermark = () => {
        pdf.saveGraphicsState();
        pdf.setTextColor(212, 175, 55);
        pdf.setFontSize(46);
        pdf.setFont("helvetica", "bold");
        pdf.GState && pdf.setGState(new pdf.GState({ opacity: 0.12 }));
        pdf.text("SOVEREIGN SUBSTRATE", pageW / 2, pageH / 2, { angle: 45, align: "center" });
        if (esiSeal) {
          pdf.setFontSize(8);
          pdf.text(`ESI-SEAL: ${esiSeal}`, pageW / 2, pageH / 2 + 28, { angle: 45, align: "center" });
        }
        pdf.restoreGraphicsState();
      };

      // Title block
      drawWatermark();
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text(doc.title, 56, 72);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(90, 104, 120);
      pdf.text(doc.subtitle, 56, 90);

      // gold rule
      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(1);
      pdf.line(56, 100, pageW - 56, 100);

      let y = 128;
      pdf.setFontSize(11);
      pdf.setTextColor(30, 30, 30);

      doc.sections.forEach((s, i) => {
        // page break
        if (y > pageH - 90) {
          pdf.addPage();
          drawWatermark();
          pdf.setTextColor(30, 30, 30);
          y = 72;
        }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(20, 20, 20);
        pdf.text(`${String(i + 1).padStart(2, "0")}.  ${s.heading}`, 56, y);
        y += 18;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(45, 45, 45);
        const lines = pdf.splitTextToSize(s.body, pageW - 112);
        lines.forEach((ln) => {
          if (y > pageH - 72) {
            pdf.addPage();
            drawWatermark();
            pdf.setTextColor(45, 45, 45);
            y = 72;
          }
          pdf.text(ln, 56, y);
          y += 16;
        });
        y += 12;
      });

      // Footer seal line
      if (y > pageH - 60) {
        pdf.addPage();
        drawWatermark();
        y = 72;
      }
      pdf.setDrawColor(212, 175, 55);
      pdf.line(56, y, pageW - 56, y);
      y += 14;
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`ESI-SEAL: ${esiSeal || "none"}`, 56, y);
      pdf.text(`Sealed: ${sealedAt || "—"}`, pageW - 56, y, { align: "right" });

      pdf.save(`BOBby_${doc.title.replace(/\s+/g, "_")}.pdf`);
    } finally {
      setDownloading(false);
      if (onDownloadDone) onDownloadDone();
    }
  };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col bg-[#0a0a0a]/60 backdrop-blur-md">
      <BobbyDocNav sections={doc.sections} containerRef={scrollRef} />
      {/* Paper toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#D4AF37]/15">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{doc.title}</h2>
            <p className="text-[10px] text-white/40 truncate">{doc.subtitle}</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wider bg-[#D4AF37] hover:bg-[#e6c454] text-black transition-colors disabled:opacity-60"
        >
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{downloading ? "SEALING PDF…" : "DOWNLOAD (ESI-SEALED)"}</span>
          <span className="sm:hidden">PDF</span>
        </button>
      </div>

      {/* The paper */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* ESI seal badge */}
          {esiSeal && (
            <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="text-[10px] tracking-widest text-[#D4AF37]/80">ESI-SEAL</span>
              <code className="text-[10px] text-white/60 truncate font-mono">{esiSeal.slice(0, 24)}…</code>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{doc.title}</h1>
          <p className="text-sm text-[#D4AF37]/80 mb-6">{doc.subtitle}</p>
          <div className="h-px bg-gradient-to-r from-[#D4AF37]/60 to-transparent mb-8" />

          <div className="space-y-8">
            {doc.sections.map((s, i) => (
              <section key={i} id={`sec-${i}`} className="scroll-mt-20">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-xs font-mono text-[#D4AF37]/60 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-lg font-bold text-white">{s.heading}</h3>
                </div>
                <div className="pl-7"><CleanDocRenderer content={s.body} /></div>
              </section>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-[#D4AF37]/15">
            <p className="text-[10px] tracking-widest text-white/35">
              SOV-DOC-ENGINE-PWA-1.0 · YIELDED BY SOV-BOBBY-CORE-1.0 · GSP-MASTER-INDEX-1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}