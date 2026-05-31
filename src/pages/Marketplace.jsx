import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, ShieldCheck, Download, SlidersHorizontal, ChevronRight, Loader2, LogIn, UserPlus } from "lucide-react";
import Logo from "@/components/Logo";
import InstallButton from "@/components/InstallButton";
import { base44 } from "@/api/base44Client";
import AiSearchConsultant from "@/components/AiSearchConsultant";
import { useAuth } from "@/lib/AuthContext";

const ALL_COMPONENTS = [];

const CATEGORIES = ["All", "Risk & Compliance", "Project Management", "Site Reporting", "Safety & Compliance"];
const TYPES = ["All", "X1", "X2", "X4"];
const typeColors = { X1: "bg-violet-100 text-violet-700", X2: "bg-blue-100 text-blue-700", X4: "bg-amber-100 text-amber-700" };

function ScoreBadge({ score }) {
  const color = score >= 90 ? "text-emerald-600 bg-emerald-50" : score >= 80 ? "text-blue-600 bg-blue-50" : "text-amber-600 bg-amber-50";
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${color}`}><ShieldCheck className="w-2.5 h-2.5" />{score}</span>;
}

export default function Marketplace() {
  const { isAuthenticated } = useAuth();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [sortBy, setSortBy] = useState("installs");

  useEffect(() => {
    base44.entities.Component.filter({ status: "published" })
      .then(data => {
        setComponents(data || []);
        setLoading(false);
      })
      .catch(() => { setComponents([]); setLoading(false); });
  }, []);

  const filtered = components
    .filter(c =>
      (category === "All" || c.category === category) &&
      (type === "All" || c.type === type) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) || (c.description || "").toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => sortBy === "rating" ? (b.rating || 0) - (a.rating || 0) : sortBy === "trust" ? (b.trust_score || 0) - (a.trust_score || 0) : (b.installs_count || 0) - (a.installs_count || 0));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
       <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Link to="/" className="flex items-center gap-2">
             <Logo className="h-8 w-auto" />
           </Link>
           <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
           <span className="text-sm text-slate-500">Marketplace</span>
         </div>
         <div className="flex items-center gap-2">
           {isAuthenticated ? (
             <>
               <Link to="/dashboard"><Button variant="outline" className="text-sm h-8">My Dashboard</Button></Link>
               <Link to="/builder"><Button className="text-sm h-8 bg-slate-900 hover:bg-slate-700">Builder Portal</Button></Link>
             </>
           ) : (
             <>
               <Link to="/login"><Button variant="outline" className="text-sm h-8 gap-1.5"><LogIn className="w-3.5 h-3.5" /> Sign in</Button></Link>
               <Link to="/register"><Button className="text-sm h-8 bg-slate-900 hover:bg-slate-700 gap-1.5"><UserPlus className="w-3.5 h-3.5" /> Sign up</Button></Link>
             </>
           )}
         </div>
       </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <AiSearchConsultant />
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search components…" className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs border border-slate-200 rounded-md px-2 py-2 bg-white text-slate-700 focus:outline-none">
              <option value="installs">Most Installed</option>
              <option value="rating">Highest Rated</option>
              <option value="trust">Trust Score</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className="hidden lg:block w-48 shrink-0 space-y-5">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</p>
              <div className="space-y-1">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`block w-full text-left text-xs px-2 py-1.5 rounded-md transition-all ${category === c ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</p>
              <div className="space-y-1">
                {TYPES.map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={`block w-full text-left text-xs px-2 py-1.5 rounded-md transition-all ${type === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                    {t === "All" ? "All Types" : t}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
            ) : (
              <>
                <p className="text-xs text-slate-400 mb-4">{filtered.length} components</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map(c => (
                    <Link key={c.id} to={`/marketplace/${c.id}`}>
                      <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow h-full flex flex-col">
                        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[c.type]}`}>{c.type}</span>
                          <ScoreBadge score={c.trust_score || 0} />
                          {c.certified && <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">Certified</span>}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-0.5">{c.name}</h3>
                        <p className="text-[10px] font-mono text-slate-400 mb-2">{c.code}</p>
                        <p className="text-xs text-slate-500 flex-1 line-clamp-2 mb-3">
                          {c.description && c.description.length > 85 ? c.description.substring(0, 85) + "..." : c.description}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                            <span className="font-semibold text-slate-700">{(c.rating || 0).toFixed(1)}</span>
                            <span className="text-slate-400">({c.reviews_count || 0})</span>
                          </div>
                          {isAuthenticated && (
                            <div onClick={e => e.preventDefault()}>
                              <InstallButton component={c} size="sm" />
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}