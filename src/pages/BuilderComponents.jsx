import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SharedNav from "@/components/SharedNav";
import CosmicBackground from "@/components/CosmicBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Package, Plus, Download, ShieldCheck, DollarSign, History, FlaskConical, X, Tag, CheckCircle2, Archive, Zap, Trash2, AlertTriangle, Loader2, RefreshCw, Link2, Search, Calendar } from "lucide-react";
import VersionReleaseModal from "@/components/version-manager/VersionReleaseModal";
import BobAdvisorWidget from "@/components/BobAdvisorWidget";
import ComponentExportButton from "@/components/builder-dashboard/ComponentExportButton";
import DriveCatalogBackupButton from "@/components/builder-dashboard/DriveCatalogBackupButton";
import MarketplacePagination from "@/components/marketplace/MarketplacePagination";
import { base44 } from "@/api/base44Client";

const PAGE_SIZE = 12;

// Maps a stored Component record into the shape this page's cards expect.
function toCardModel(c) {
  return {
    ...c,
    displayName: c.name,
    name: c.code || c.name,
    installs: Number(c.installs_count || 0),
    revenue: Math.round(Number(c.price || 0) * Number(c.installs_count || 0)),
    trustScore: c.trust_score ? Math.round(c.trust_score) : null,
    version: c.version_label || "v1.0",
    publishedDate: c.created_date,
    versions: [
      {
        version: c.version_label || "v1.0",
        date: c.created_date ? new Date(c.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
        notes: "Current published version.",
        status: c.status === "published" ? "live" : c.status === "draft" ? "draft" : "archived",
      },
    ],
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────
const typeColors = { X1: "bg-violet-100 text-violet-700", X2: "bg-blue-100 text-blue-700", X3: "bg-cyan-100 text-cyan-700", X4: "bg-amber-100 text-amber-700", X5: "bg-rose-100 text-rose-700" };
const statusStyles = {
  published: "bg-emerald-100 text-emerald-700 border-emerald-200",
  draft: "bg-slate-100 text-slate-500 border-slate-200",
  shelved: "bg-amber-100 text-amber-700 border-amber-200",
};
const versionStatusConfig = {
  live: { label: "Live", className: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  archived: { label: "Archived", className: "bg-slate-100 text-slate-500", icon: Archive },
  draft: { label: "Draft", className: "bg-amber-100 text-amber-700", icon: Tag },
};

function TrustBadge({ score }) {
  if (score == null) return <span className="text-xs text-slate-400">Not yet scored</span>;
  const color = score >= 90 ? "text-emerald-600" : score >= 70 ? "text-blue-600" : "text-amber-600";
  return <span className={`text-sm font-black ${color}`}>{score}<span className="text-xs font-normal text-slate-400">/100</span></span>;
}

function DeleteDialog({ component, onClose, onShelf, onDelete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const act = async (fn) => { setLoading(true); await fn(); setLoading(false); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-sm font-bold text-slate-900">Remove Component</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {step === 1 ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800 mb-1">This will affect active subscribers</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <span className="font-semibold">{component.displayName}</span> will be <span className="font-semibold">immediately unavailable</span> to all users who have installed or subscribed to it.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500">You can <span className="font-semibold text-slate-700">shelf it</span> (hidden but restorable) or <span className="font-semibold text-red-600">permanently delete</span> all data.</p>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 text-xs h-9" onClick={onClose}>Cancel</Button>
                <Button className="flex-1 text-xs h-9 bg-red-600 hover:bg-red-700 text-white" onClick={() => setStep(2)}>Continue →</Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-800">
                {onShelf
                  ? <>What would you like to do with <span className="text-violet-700">{component.displayName}</span>?</>
                  : <>Permanently delete <span className="text-violet-700">{component.displayName}</span>?</>
                }
              </p>
              {onShelf && (
                <button onClick={() => act(onShelf)} disabled={loading}
                  className="w-full text-left border-2 border-slate-200 hover:border-violet-400 hover:bg-violet-50 rounded-xl p-4 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center shrink-0">
                      <Archive className="w-4 h-4 text-slate-500 group-hover:text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-violet-800">Shelf Component</p>
                      <p className="text-xs text-slate-500 mt-0.5">Hidden from marketplace. Data, reviews, and history preserved. Restorable at any time.</p>
                    </div>
                  </div>
                </button>
              )}
              <button onClick={() => act(onDelete)} disabled={loading}
                className="w-full text-left border-2 border-slate-200 hover:border-red-400 hover:bg-red-50 rounded-xl p-4 transition-all group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-red-100 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4 text-slate-500 group-hover:text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-red-700">Permanently Delete</p>
                    <p className="text-xs text-slate-500 mt-0.5">Removes all data from the platform. <span className="font-semibold text-red-600">Cannot be undone.</span></p>
                  </div>
                </div>
              </button>
              {loading && <div className="flex items-center justify-center gap-2 py-1"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /><span className="text-xs text-slate-400">Processing...</span></div>}
              {onShelf && <Button variant="outline" className="w-full text-xs h-9" onClick={() => setStep(1)}>← Back</Button>}
              {!onShelf && <Button variant="outline" className="w-full text-xs h-9" onClick={onClose}>Cancel</Button>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RedeployDialog({ component, onClose, onRedeploy }) {
  const [mode, setMode] = useState("keep"); // "keep" | "new"
  const [newEndpoint, setNewEndpoint] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const endpointUrl = mode === "keep" ? component.endpoint_url : newEndpoint.trim();
    await onRedeploy(component.id, endpointUrl);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-violet-600" />
            </div>
            <p className="text-sm font-bold text-slate-900">Redeploy Component</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-500">
            Redeploying <span className="font-semibold text-slate-700">{component.displayName}</span> will restore it to <span className="font-semibold text-amber-700">draft</span> status and re-submit for platform review before going live.
          </p>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">API Endpoint</p>

            <button onClick={() => setMode("keep")}
              className={`w-full text-left border-2 rounded-xl p-4 transition-all ${mode === "keep" ? "border-violet-400 bg-violet-50" : "border-slate-200 hover:border-slate-300"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${mode === "keep" ? "border-violet-600" : "border-slate-300"}`}>
                  {mode === "keep" && <div className="w-2 h-2 rounded-full bg-violet-600" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Keep existing endpoint</p>
                  {component.endpoint_url
                    ? <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{component.endpoint_url}</p>
                    : <p className="text-[10px] text-slate-400 mt-0.5">No endpoint on record — will be set during review</p>
                  }
                </div>
              </div>
            </button>

            <button onClick={() => setMode("new")}
              className={`w-full text-left border-2 rounded-xl p-4 transition-all ${mode === "new" ? "border-violet-400 bg-violet-50" : "border-slate-200 hover:border-slate-300"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${mode === "new" ? "border-violet-600" : "border-slate-300"}`}>
                  {mode === "new" && <div className="w-2 h-2 rounded-full bg-violet-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-3 h-3 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-800">Link a new API endpoint</p>
                  </div>
                  {mode === "new" && (
                    <input
                      autoFocus
                      type="url"
                      placeholder="https://your-api-endpoint.com/v1/extract"
                      value={newEndpoint}
                      onChange={e => setNewEndpoint(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="mt-2 w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono placeholder-slate-300"
                    />
                  )}
                </div>
              </div>
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 text-xs h-9" onClick={onClose}>Cancel</Button>
            <Button
              className="flex-1 text-xs h-9 bg-violet-700 hover:bg-violet-800"
              onClick={handleConfirm}
              disabled={loading || (mode === "new" && !newEndpoint.trim())}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><RefreshCw className="w-3.5 h-3.5" /> Redeploy</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentCard({ component: c, onViewHistory, onReleaseVersion, onRemoved, onShelf, onRedeploy }) {
  const [showDelete, setShowDelete] = useState(false);
  const [showRedeploy, setShowRedeploy] = useState(false);

  return (
    <>
      {showDelete && (
        <DeleteDialog
          component={c}
          onClose={() => setShowDelete(false)}
          onShelf={onShelf ? () => { setShowDelete(false); onShelf(c.id); } : null}
          onDelete={() => { setShowDelete(false); onRemoved && onRemoved(c.id); }}
        />
      )}
      {showRedeploy && (
        <RedeployDialog
          component={c}
          onClose={() => setShowRedeploy(false)}
          onRedeploy={onRedeploy}
        />
      )}
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[c.type] || "bg-slate-100 text-slate-600"}`}>{c.type}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyles[c.status]}`}>{c.status}</span>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{c.version}</span>
          </div>
          <button onClick={() => setShowDelete(true)} className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50" title="Remove component">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-0.5">{c.displayName}</h3>
        <p className="text-[10px] text-slate-400 font-mono mb-1">{c.name}</p>
        {c.publishedDate && (
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mb-2">
            <Calendar className="w-2.5 h-2.5" /> Published {new Date(c.publishedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
        <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{c.description}</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Download className="w-3 h-3 text-slate-400" />
              <p className="text-sm font-bold text-slate-800">{c.installs.toLocaleString()}</p>
            </div>
            <p className="text-[10px] text-slate-400">Installs</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <DollarSign className="w-3 h-3 text-slate-400" />
              <p className="text-sm font-bold text-slate-800">${c.revenue.toLocaleString()}</p>
            </div>
            <p className="text-[10px] text-slate-400">Revenue</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              <TrustBadge score={c.trustScore} />
            </div>
            <p className="text-[10px] text-slate-400">Trust Score</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/builder/sandbox" className="flex-1">
            <Button variant="outline" className="w-full text-xs h-8 gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" /> Test
            </Button>
          </Link>
          <Button variant="outline" className="flex-1 text-xs h-8 gap-1.5" onClick={onViewHistory}>
            <History className="w-3.5 h-3.5" /> History
          </Button>
          {c.status === "published" && (
            <Button className="flex-1 text-xs h-8 gap-1.5 bg-violet-700 hover:bg-violet-800" onClick={onReleaseVersion}>
              <Zap className="w-3.5 h-3.5" /> Release
            </Button>
          )}
          {c.status === "shelved" && (
            <Button className="flex-1 text-xs h-8 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setShowRedeploy(true)}>
              <RefreshCw className="w-3.5 h-3.5" /> Redeploy
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
}

function VersionHistoryDrawer({ component, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Version History</h2>
            <p className="text-xs text-slate-400">{component.displayName} · {component.versions.length} version{component.versions.length !== 1 ? "s" : ""}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {component.versions.map((v, i) => {
            const cfg = versionStatusConfig[v.status] || versionStatusConfig.archived;
            const Icon = cfg.icon;
            return (
              <div key={i} className="relative pl-6 pb-4 border-b border-slate-100 last:border-0">
                <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-slate-200 border-2 border-white ring-2 ring-slate-100" />
                {i < component.versions.length - 1 && <div className="absolute left-1.5 top-4 bottom-0 w-px bg-slate-100" />}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-900">{v.version}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${cfg.className}`}>
                    <Icon className="w-2.5 h-2.5" />{cfg.label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-1">{v.date}</p>
                <p className="text-xs text-slate-600">{v.notes}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function BuilderComponents() {
  const [drawerComponent, setDrawerComponent] = useState(null);
  const [releaseComponent, setReleaseComponent] = useState(null);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      // Admins see the full catalog; builders see only their own components.
      const query = me?.role === "admin" ? {} : { builder_id: me.id };
      const list = await base44.entities.Component.filter(query, "-created_date", 5000);
      setComponents(list.map(toCardModel));
    } catch {
      setComponents([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  // Reset to page 1 whenever filters/search change.
  useEffect(() => { setPage(1); }, [filter, typeFilter, search]);

  const handleRemoved = async (id) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const handleShelf = async (id) => {
    await base44.entities.Component.update(id, { status: "shelved" });
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, status: "shelved" } : c)));
  };

  const handleRedeploy = async (id, endpointUrl) => {
    await base44.entities.Component.update(id, { status: "draft", ...(endpointUrl ? { endpoint_url: endpointUrl } : {}) });
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, status: "draft", ...(endpointUrl ? { endpoint_url: endpointUrl } : {}) } : c)));
  };

  // Apply status, type, and text filters.
  const q = search.trim().toLowerCase();
  const filtered = components.filter((c) => {
    const statusOk = filter === "all" ? c.status !== "shelved" : c.status === filter;
    const typeOk = typeFilter === "all" || c.type === typeFilter;
    const searchOk = !q || [c.displayName, c.name, c.code, c.category, c.description].some((v) => (v || "").toLowerCase().includes(q));
    return statusOk && typeOk && searchOk;
  });

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen">
      <CosmicBackground />
      <SharedNav mode="builder" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-2">
              <Link to="/builder" className="hover:text-slate-600">Builder Dashboard</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-700 font-medium">My Components</span>
            </nav>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100"><Package className="w-5 h-5 text-slate-600" /></div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My Components</h1>
                <p className="text-sm text-slate-500">{components.length.toLocaleString()} components in your portfolio</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <ComponentExportButton components={components} />
            <DriveCatalogBackupButton components={components} />
            <Link to="/builder/publish">
              <Button className="bg-violet-700 hover:bg-violet-800 text-white text-xs h-9 gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Publish New
              </Button>
            </Link>
          </div>
        </div>

        {/* Search + filters toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, category…"
              className="w-full pl-9 pr-3 h-9 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 overflow-x-auto">
            {["all", "published", "draft", "shelved"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize whitespace-nowrap transition-all ${filter === f ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-700"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 overflow-x-auto">
            {["all", "X1", "X2", "X3", "X4", "X5"].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${typeFilter === t ? "bg-violet-700 text-white" : "text-slate-500 hover:text-slate-700"}`}>
                {t === "all" ? "All Types" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Package className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">
              {q || typeFilter !== "all" ? "No matching components" : `No ${filter === "all" ? "" : filter} components`}
            </p>
            <p className="text-xs text-slate-400">
              {q || typeFilter !== "all" ? "Try adjusting your search or filters." : filter === "shelved" ? "Components you shelf will appear here." : "Publish a new component to get started."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {paged.map((comp) => (
                <ComponentCard
                  key={comp.id}
                  component={comp}
                  onViewHistory={() => setDrawerComponent(comp)}
                  onReleaseVersion={() => setReleaseComponent(comp)}
                  onRemoved={handleRemoved}
                  onShelf={comp.status === "shelved" ? null : handleShelf}
                  onRedeploy={handleRedeploy}
                />
              ))}
            </div>
            {/* Light pagination bar (page colors tuned for the light builder theme) */}
            {pageCount > 1 && (
              <div className="[&_button]:!bg-white [&_button]:!border-slate-200 [&_button]:!text-slate-600 [&_span]:!text-slate-400">
                <MarketplacePagination page={page} pageCount={pageCount} onPage={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {drawerComponent && (
        <VersionHistoryDrawer component={drawerComponent} onClose={() => setDrawerComponent(null)} />
      )}

      <BobAdvisorWidget />

      {releaseComponent && (
        <VersionReleaseModal
          component={releaseComponent}
          isOpen={!!releaseComponent}
          onClose={() => setReleaseComponent(null)}
          onSuccess={(data) => {
            if (data?.version) {
              setComponents((prev) => prev.map((c) =>
                c.id === releaseComponent.id
                  ? { ...c, version: `v${data.version}`, versions: [{ version: `v${data.version}`, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), notes: data.changelog || "New version released.", status: "live" }, ...c.versions] }
                  : c
              ));
            }
            setReleaseComponent(null);
            setDrawerComponent(null);
          }}
        />
      )}
    </div>
  );
}