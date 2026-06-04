import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, CheckCheck, AlertTriangle, ShieldAlert, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";

const SEVERITY_ICON = {
  info: { Icon: Info, color: "text-blue-500" },
  warning: { Icon: AlertTriangle, color: "text-amber-500" },
  critical: { Icon: ShieldAlert, color: "text-red-500" },
  emergency: { Icon: ShieldAlert, color: "text-red-600" },
};

// Notification bell + dropdown. Reused across user, builder, and admin/dev navs.
export default function NotificationBell({ isDev = false }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState(null);

  const load = useCallback(async (uid) => {
    const id = uid || userId;
    if (!id) return;
    const data = await base44.entities.AppNotification.filter({ user_id: id }, "-created_date", 20);
    setItems(data);
  }, [userId]);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUserId(me.id);
        await load(me.id);
      } catch { /* not logged in — bell stays empty */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live updates as new notifications arrive.
  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.AppNotification.subscribe(() => load());
    return unsub;
  }, [userId, load]);

  const unread = items.filter((n) => !n.read).length;

  const markRead = async (n) => {
    if (n.read) return;
    await base44.entities.AppNotification.update(n.id, { read: true });
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
  };

  const markAll = async () => {
    const unreadItems = items.filter((n) => !n.read);
    await Promise.all(unreadItems.map((n) => base44.entities.AppNotification.update(n.id, { read: true })));
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
        className={`relative p-1.5 rounded-lg transition-colors ${isDev ? "text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold text-white bg-red-500 rounded-full">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[55]" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 mt-1 w-80 max-w-[92vw] rounded-xl shadow-lg z-[60] overflow-hidden ${isDev ? "bg-[#161b22] border border-[#30363d]" : "bg-white border border-slate-200"}`}>
            <div className={`flex items-center justify-between px-3 py-2.5 border-b ${isDev ? "border-[#30363d]" : "border-slate-100"}`}>
              <span className={`text-sm font-bold ${isDev ? "text-[#c9d1d9] font-mono" : "text-slate-900"}`}>Notifications</span>
              {unread > 0 && (
                <button onClick={markAll} className={`flex items-center gap-1 text-[11px] font-semibold ${isDev ? "text-[#3fb950]" : "text-violet-600 hover:text-violet-700"}`}>
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className={`w-6 h-6 mx-auto mb-2 ${isDev ? "text-[#484f58]" : "text-slate-300"}`} />
                  <p className={`text-xs ${isDev ? "text-[#8b949e]" : "text-slate-400"}`}>You're all caught up</p>
                </div>
              ) : (
                items.map((n) => {
                  const { Icon, color } = SEVERITY_ICON[n.severity] || SEVERITY_ICON.info;
                  const Body = (
                    <div className={`flex items-start gap-2.5 px-3 py-2.5 transition-colors cursor-pointer ${isDev ? "hover:bg-[#0d1117]" : "hover:bg-slate-50"} ${!n.read ? (isDev ? "bg-[#0d1117]" : "bg-violet-50/40") : ""}`}>
                      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isDev ? "text-[#c9d1d9]" : "text-slate-900"}`}>{n.title}</p>
                        <p className={`text-[11px] leading-snug mt-0.5 ${isDev ? "text-[#8b949e]" : "text-slate-500"}`}>{n.message}</p>
                        <p className={`text-[10px] mt-1 ${isDev ? "text-[#484f58]" : "text-slate-400"}`}>
                          {n.created_date ? formatDistanceToNow(new Date(n.created_date), { addSuffix: true }) : ""}
                        </p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-1" />}
                    </div>
                  );
                  return n.action_url ? (
                    <Link key={n.id} to={n.action_url} onClick={() => { markRead(n); setOpen(false); }}>{Body}</Link>
                  ) : (
                    <div key={n.id} onClick={() => markRead(n)}>{Body}</div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}