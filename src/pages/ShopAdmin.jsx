import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, LayoutGrid, HeartHandshake, Lock, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ShopShell from "@/components/shop/ShopNav";
import ProductAdmin from "@/components/shop/admin/ProductAdmin";
import CollectionAdmin from "@/components/shop/admin/CollectionAdmin";
import FundAdmin from "@/components/shop/admin/FundAdmin";

const TABS = [
  { key: "products", label: "Products", icon: Package },
  { key: "collections", label: "Collections", icon: LayoutGrid },
  { key: "fund", label: "Community Fund", icon: HeartHandshake },
];

export default function ShopAdmin() {
  const [status, setStatus] = useState("loading"); // loading | denied | ok
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [funds, setFunds] = useState([]);

  const load = async () => {
    const [prods, cols, fnds] = await Promise.all([
      base44.entities.ShopProduct.list("sort_order", 500),
      base44.entities.ShopCollection.list("sort_order", 100),
      base44.entities.CommunityFund.list("-period", 50),
    ]);
    setProducts(prods);
    setCollections(cols);
    setFunds(fnds);
  };

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        if (u?.role !== "admin") { setStatus("denied"); return; }
        await load();
        setStatus("ok");
      } catch {
        setStatus("denied");
      }
    })();
  }, []);

  if (status === "loading") {
    return <ShopShell isAdmin><div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div></ShopShell>;
  }
  if (status === "denied") {
    return (
      <ShopShell>
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <Lock className="w-8 h-8 mx-auto text-slate-400 mb-3" />
          <h1 className="font-bold text-slate-900 text-xl">Admins only</h1>
          <p className="text-slate-500 mt-1">Managing the shop is restricted to administrators.</p>
          <Link to="/shop" className="text-[#0066FF] font-medium mt-3 inline-block">Back to the Shop</Link>
        </div>
      </ShopShell>
    );
  }

  return (
    <ShopShell isAdmin>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Manage the Shop</h1>
        <div className="flex gap-1 border-b border-slate-200 mb-6">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
                tab === t.key ? "border-[#0066FF] text-[#0066FF]" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "products" && <ProductAdmin products={products} collections={collections} reload={load} />}
        {tab === "collections" && <CollectionAdmin collections={collections} reload={load} />}
        {tab === "fund" && <FundAdmin funds={funds} reload={load} />}
      </div>
    </ShopShell>
  );
}