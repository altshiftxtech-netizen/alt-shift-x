import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Package, Search, AlertTriangle, KeyRound } from "lucide-react";
import { base44 } from "@/api/base44Client";

// PWA Exports section — lets admins select a wired PWA package from a
// dropdown and download the complete zip to their device.
//
// Scalability: uses a native <select> (browser-virtualized, handles thousands
// of <option> nodes without DOM performance issues) plus a client-side text
// filter to narrow the list. Data is fetched in a single call with a high
// limit; the native select renders instantly regardless of count.

export default function PwaExportsSection() {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then((u) => setRole(u?.role))
      .catch(() => setRole(null));
  }, []);

  const [selectedId, setSelectedId] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [apexKey, setApexKey] = useState("");

  useEffect(() => {
    base44.entities.PwaExport.list("-date_wired", 5000)
      .then((data) => {
        setExports(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Client-side filter — narrows the dropdown options by name/version
  const filtered = useMemo(() => {
    if (!search.trim()) return exports;
    const q = search.toLowerCase();
    return exports.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        e.version?.toLowerCase().includes(q)
    );
  }, [exports, search]);

  const selected = useMemo(
    () => exports.find((e) => e.id === selectedId),
    [exports, selectedId]
  );

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const handleDownload = async () => {
    if (!selected) return;
    setDownloading(true);
    setError(null);
    try {
      // If a pre-built zip URL exists, download it directly.
      if (selected.file_url) {
        const a = document.createElement("a");
        a.href = selected.file_url;
        a.download = `${selected.name}-${selected.version || "1.0.0"}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (selected.generate_function) {
        // On-demand generation via backend function (e.g. generatePm1aPayload)
        const response = await base44.functions.invoke(
          selected.generate_function,
          apexKey.trim() ? { apex_key: apexKey.trim() } : {}
        );
        const data = await (response.data ?? response);
        // Function returns { filename, zip (base64), files } — decode to a real zip
        const b64 = data?.zip;
        if (!b64) {
          throw new Error("No zip payload returned from generator.");
        }
        const binStr = atob(b64);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
        const blob = new Blob([bytes], { type: "application/zip" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data?.filename || `${selected.name}-${selected.version || "1.0.0"}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setError("This PWA export has no zip package wired up yet.");
      }
    } catch (e) {
      setError(e.message || "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  // Restrict to admin and staff roles only
  if (role !== null && role !== "admin" && role !== "staff") {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        Admin or staff access required to download PWA packages.
      </div>
    );
  }

  return (
    <Card className="border-slate-700 bg-slate-900">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
          <Package className="w-4 h-4" style={{ color: "#dc2626" }} />
          PWA Exports — Complete Package Downloads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <p className="text-[11px] text-slate-500">
          Select a wired PWA package to download the complete zip to your device.
          Bob Builder updates the component list and wires up each package.
        </p>

        {/* Search filter — narrows thousands of options instantly */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name or version…"
            className="w-full bg-slate-950 text-slate-200 text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-slate-500"
          />
        </div>

        {/* Native select — browser-virtualized, handles thousands of options */}
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full bg-slate-950 text-slate-200 text-sm px-3 py-2.5 rounded-lg border border-slate-700 outline-none focus:border-slate-500"
          size={1}
        >
          <option value="">
            {filtered.length === 0
              ? "No PWA exports found"
              : `Select a PWA package (${filtered.length} available)…`}
          </option>
          {filtered.map((exp) => (
            <option key={exp.id} value={exp.id}>
              {exp.name} — v{exp.version || "1.0.0"} · Wired {formatDate(exp.date_wired)}
            </option>
          ))}
        </select>

        {/* Selected package details */}
        {selected && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-200">
                {selected.name}{" "}
                <span className="text-slate-500 font-normal">v{selected.version}</span>
              </p>
              <span className="text-[10px] text-slate-500">
                Wired {formatDate(selected.date_wired)}
              </span>
            </div>
            {selected.description && (
              <p className="text-[11px] text-slate-400">{selected.description}</p>
            )}
            {selected.component_codes?.length > 0 && (
              <p className="text-[10px] text-slate-500 font-mono">
                {selected.component_codes.length} component(s):{" "}
                {selected.component_codes.join(", ")}
              </p>
            )}
            <p className="text-[10px] text-slate-500">
              {selected.file_url
                ? "✓ Pre-built zip package ready for download"
                : selected.generate_function
                ? "⚡ On-demand generation via backend function"
                : "⚠ No zip package wired up yet"}
            </p>
          </div>
        )}

        {/* Apex Key input — required for on-demand generation packages */}
        {selected && selected.generate_function && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-[11px] font-bold text-slate-300">
                Sovereign Ledger Apex Key <span className="text-slate-500 font-normal">(optional)</span>
              </p>
            </div>
            <input
              type="password"
              value={apexKey}
              onChange={(e) => setApexKey(e.target.value)}
              placeholder="Enter Apex Key (ENT-XXXX-XXXX-XXXX)"
              className="w-full bg-slate-950 text-slate-200 text-sm font-mono px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-slate-500"
            />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-300 font-semibold">{error}</p>
          </div>
        )}

        {/* Download button */}
        <Button
          onClick={handleDownload}
          disabled={!selected || downloading}
          className="w-full gap-2 border border-slate-500"
          style={{
            backgroundColor: "#1a2332",
            color: "#e2e8f0",
            borderColor: "#64748b",
          }}
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Downloading…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" style={{ color: "#dc2626" }} /> Download PWA Zip Package
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}