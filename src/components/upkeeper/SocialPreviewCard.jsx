import React from "react";
import { Instagram, Linkedin, Facebook, Twitter, Music2, MessageCircle, CheckCircle2, Clock, XCircle, Download, Send, Loader2, ShieldCheck } from "lucide-react";

const PLATFORM_META = {
  instagram: { label: "Instagram", icon: Instagram, color: "from-pink-500 to-orange-400", live: true },
  linkedin: { label: "LinkedIn", icon: Linkedin, color: "from-sky-600 to-blue-700", live: true },
  facebook: { label: "Facebook", icon: Facebook, color: "from-blue-600 to-blue-800", live: false },
  x: { label: "X", icon: Twitter, color: "from-slate-700 to-black", live: false },
  tiktok: { label: "TikTok", icon: Music2, color: "from-slate-800 to-pink-600", live: false },
  discord: { label: "Discord", icon: MessageCircle, color: "from-indigo-500 to-indigo-700", live: false },
};

const STATUS_META = {
  draft: { label: "Draft", icon: Clock, cls: "bg-slate-700 text-slate-200" },
  pending_approval: { label: "Pending Admin Approval", icon: Clock, cls: "bg-amber-900/60 text-amber-300" },
  approved: { label: "Approved", icon: CheckCircle2, cls: "bg-emerald-900/60 text-emerald-300" },
  rejected: { label: "Rejected", icon: XCircle, cls: "bg-red-900/60 text-red-300" },
  published: { label: "Published", icon: CheckCircle2, cls: "bg-emerald-600 text-white" },
  failed: { label: "Failed", icon: XCircle, cls: "bg-red-600 text-white" },
  queued_manual: { label: "Queued — Post Manually", icon: Download, cls: "bg-orange-900/60 text-orange-300" },
};

// A previewable social post card shown in the chat flow and the Social Studio queue.
// Admins see Approve / Publish. Staff see Submit-for-approval (or Publish if preauthorized).
export default function SocialPreviewCard({ post, isAdmin, busy, onPublish, onApprove, onReject }) {
  const p = PLATFORM_META[post.platform] || PLATFORM_META.instagram;
  const Icon = p.icon;
  const s = STATUS_META[post.status] || STATUS_META.draft;
  const SIcon = s.icon;
  const isVideo = post.media_type === "video" || post.media_type === "reel";

  return (
    <div className="bg-[#2a1d16] border border-orange-900/40 rounded-2xl overflow-hidden max-w-sm">
      <div className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${p.color}`}>
        <Icon className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-white">{p.label}</span>
        <span className="ml-auto text-[9px] font-bold uppercase tracking-wide bg-white/20 text-white px-1.5 py-0.5 rounded-full">
          {post.media_type}
        </span>
      </div>

      {post.media_url && (
        isVideo ? (
          <video src={post.media_url} controls className="w-full max-h-72 object-cover bg-black" />
        ) : (
          <img src={post.media_url} alt="" className="w-full max-h-72 object-cover bg-black" />
        )
      )}

      <div className="p-4 space-y-3">
        <p className="text-sm text-orange-50 whitespace-pre-wrap leading-relaxed">{post.caption}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}>
            <SIcon className="w-2.5 h-2.5" /> {s.label}
          </span>
          {!p.live && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-950/60 text-orange-300">
              Manual post
            </span>
          )}
        </div>

        {/* Actions */}
        {!["published", "rejected"].includes(post.status) && (
          <div className="flex items-center gap-2 pt-1">
            {isAdmin ? (
              <>
                {post.status === "pending_approval" && (
                  <button onClick={() => onReject?.(post)} disabled={busy}
                    className="text-[11px] font-semibold text-red-300 hover:text-white bg-red-950/50 hover:bg-red-800 border border-red-800/50 px-2.5 py-1.5 rounded-lg transition-colors">
                    Reject
                  </button>
                )}
                <button onClick={() => onPublish?.(post)} disabled={busy}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 px-3 py-1.5 rounded-lg transition-opacity">
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {p.live ? "Approve & Publish" : "Approve & Queue"}
                </button>
              </>
            ) : (
              <button onClick={() => onPublish?.(post)} disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 px-3 py-1.5 rounded-lg transition-opacity">
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                Submit for Approval
              </button>
            )}
            {post.media_url && (
              <a href={post.media_url} download target="_blank" rel="noopener noreferrer"
                title="Download media"
                className="text-orange-300 hover:text-white bg-[#3a2a24] hover:bg-[#4a352c] border border-orange-900/40 p-1.5 rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
        {post.publish_error && <p className="text-[10px] text-red-400">{post.publish_error}</p>}
      </div>
    </div>
  );
}

export { PLATFORM_META };