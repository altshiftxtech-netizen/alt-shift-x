import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Bell, BellOff, CheckCheck, Zap, Key, Package, Star, ShieldCheck,
  DollarSign, AlertTriangle, AlertCircle, Info, X, ChevronRight,
  Loader2, RefreshCw, Settings
} from "lucide-react";

const severityConfig = {
  emergency: { bg: "bg-red-50", border: "border-red-300", icon: AlertCircle, iconColor: "text-red-600", badge: "bg-red-600 text-white", label: "EMERGENCY" },
  critical:  { bg: "bg-red-50", border: "border-red-200", icon: AlertCircle, iconColor: "text-red-500", badge: "bg-red-100 text-red-700", label: "CRITICAL" },
  warning:   { bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle, iconColor: "text-amber-500", badge: "bg-amber-100 text-amber-700", label: "WARNING" },
  info:      { bg: "bg-white", border: "border-slate-200", icon: Info, iconColor: "text-blue-500", badge: "bg-slate-100 text-slate-600", label: "INFO" },
};

const typeIcons = {
  quota_warning: Zap, quota_critical: Zap, api_key_created: Key, api_key_revoked: Key,
  component_published: Package, component_rejected: Package,
  new_review: Star, new_install: Package, trust_flag: ShieldCheck,
  payout: DollarSign, emergency: AlertCircle,
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotifCard({ notif, onRead, onDismiss }) {
  const sc = severityConfig[notif.severity] || severityConfig.info;
  const TypeIcon = typeIcons[notif.type] || Bell;
  const SevIcon = sc.icon;
  const isUrgent = notif.severity === "emergency" || notif.severity === "critical";

  return (
    <div className={`rounded-2xl border ${sc.border} ${sc.bg} p-4 relative ${isUrgent ? "shadow-md" : ""}`}>
      {isUrgent && (
        <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${notif.severity === "emergency" ? "bg-red-600" : "bg-red-400"}`} />
      )}
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${isUrgent ? "bg-red-100" : "bg-slate-100"} shrink-0 mt-0.5`}>
          <TypeIcon className={`w-4 h-4 ${sc.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${sc.badge}`}>
              {sc.label}
            </span>
            {!notif.read && (
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            )}
            <span className="text-[10px] text-slate-400 ml-auto">{timeAgo(notif.created_date)}</span>
          </div>
          <p className={`text-sm font-bold ${isUrgent ? "text-red-900" : "text-slate-900"}`}>{notif.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {notif.action_url && notif.action_label && (
              <a href={notif.action_url}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 ${isUrgent ? "bg-red-600 text-white" : "bg-slate-900 text-white"}`}>
                {notif.action_label} <ChevronRight className="w-3 h-3" />
              </a>
            )}
            <div className="flex items-center gap-3 ml-auto text-[10px] text-slate-400">
              {notif.email_sent && <span>📧 emailed</span>}
              {notif.sms_sent && <span>📱 texted</span>}
            </div>
          </div>
        </div>
        <button onClick={() => onDismiss(notif.id)} className="text-slate-300 hover:text-slate-500 shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function MobileNotifications({ user, onOpenSettings }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(() => {
    if (!user?.id) return;
    base44.entities.AppNotification
      .filter({ user_id: user.id }, "-created_date", 30)
      .then(data => { setNotifications(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.AppNotification.subscribe((event) => {
      if (event.data?.user_id !== user?.id) return;
      if (event.type === "create") {
        setNotifications(prev => [event.data, ...prev]);
      } else if (event.type === "update") {
        setNotifications(prev => prev.map(n => n.id === event.id ? event.data : n));
      } else if (event.type === "delete") {
        setNotifications(prev => prev.filter(n => n.id !== event.id));
      }
    });
    return unsub;
  }, [user?.id]);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n =>
      base44.entities.AppNotification.update(n.id, { read: true })
    ));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleRead = async (id) => {
    await base44.entities.AppNotification.update(id, { read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDismiss = async (id) => {
    await base44.entities.AppNotification.delete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const FILTERS = ["all", "unread", "critical", "info"];
  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "critical") return n.severity === "critical" || n.severity === "emergency";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const emergencies = notifications.filter(n => n.severity === "emergency" && !n.read);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-2 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Alerts
            {unreadCount > 0 && (
              <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400">Email, SMS & in-app notifications</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-violet-600 font-semibold flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          <button onClick={onOpenSettings} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-white border border-slate-200">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Emergency banner */}
      {emergencies.length > 0 && (
        <div className="bg-red-600 text-white rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-black uppercase tracking-wide">
              {emergencies.length} Emergency Alert{emergencies.length > 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-xs text-red-100">{emergencies[0].message}</p>
          {emergencies[0].action_url && (
            <a href={emergencies[0].action_url}
              className="mt-1 inline-flex items-center gap-1 text-xs font-bold bg-white text-red-700 px-3 py-1.5 rounded-xl">
              Take Action <ChevronRight className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg capitalize transition-all ${filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <BellOff className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-400">
            {filter === "unread" ? "All caught up!" : "No notifications yet"}
          </p>
          <p className="text-xs text-slate-400 mt-1">Alerts will appear here in real time</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <div key={n.id} onClick={() => !n.read && handleRead(n.id)}>
              <NotifCard notif={n} onRead={handleRead} onDismiss={handleDismiss} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}