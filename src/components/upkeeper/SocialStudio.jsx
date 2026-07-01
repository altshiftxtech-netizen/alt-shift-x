import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, ImageIcon, Video, Upload, Wand2, RefreshCw } from "lucide-react";
import SocialPreviewCard, { PLATFORM_META } from "./SocialPreviewCard";

const PLATFORMS = Object.entries(PLATFORM_META).map(([k, v]) => ({ key: k, ...v }));
const MEDIA_TYPES = [
  { key: "photo", label: "Photo", icon: ImageIcon },
  { key: "video", label: "Video", icon: Video },
  { key: "reel", label: "Reel", icon: Video },
  { key: "text", label: "Text only", icon: Sparkles },
];

// Social Studio — staff/admin compose a post: pick platform + media type, let the
// UpKeeper generate caption + media (photo via GenerateImage, video/reel via
// GenerateVideo), preview it, then submit for approval / publish.
export default function SocialStudio({ isAdmin, user, conversationId }) {
  const [platform, setPlatform] = useState("instagram");
  const [mediaType, setMediaType] = useState("photo");
  const [magnaCinematic, setMagnaCinematic] = useState(true);
  const [brief, setBrief] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [genCaption, setGenCaption] = useState(false);
  const [genMedia, setGenMedia] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyPost, setBusyPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const fileRef = useRef(null);

  const loadPosts = async () => {
    const list = await base44.entities.SocialPost.list("-created_date", 30);
    setPosts(list);
  };
  useEffect(() => { loadPosts(); }, []);

  const generateCaption = async () => {
    if (!brief.trim()) return;
    setGenCaption(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are The UpKeeper's social copywriter for the Alt+Shift+X platform. Write a single, on-brand ${platform} ${mediaType} caption for this brief: "${brief}". Match ${platform}'s tone and length. Include tasteful hashtags where appropriate. Return ONLY the caption text.`,
    });
    setCaption(typeof res === "string" ? res : (res?.caption || ""));
    setGenCaption(false);
  };

  const generateMedia = async () => {
    if (!brief.trim()) return;
    setGenMedia(true);
    try {
      if (mediaType === "video" || mediaType === "reel") {
        const prompt = magnaCinematic
          ? `${brief}. MAGNA CINEMATIC MODE — a premium vertical social ${mediaType} for the Alt+Shift+X marketplace. `
            + `Cinematic film look: dramatic lighting, shallow depth of field, smooth camera motion (dolly/crane/parallax), `
            + `rich color grade, elegant on-brand motion graphics and kinetic typography, tasteful transitions, high production value. `
            + `Polished, confident, editorial — feels like a flagship brand launch spot.`
          : `${brief}. Vertical social ${mediaType}, polished, branded, engaging, cinematic.`;
        const res = await base44.integrations.Core.GenerateVideo({ prompt, aspect_ratio: "9:16" });
        setMediaUrl(res?.url || res?.video_url || "");
      } else {
        const res = await base44.integrations.Core.GenerateImage({
          prompt: `${brief}. High-quality branded social media ${mediaType} for ${platform}, clean modern aesthetic.`,
        });
        setMediaUrl(res?.url || "");
      }
    } finally {
      setGenMedia(false);
    }
  };

  const uploadMedia = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGenMedia(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setMediaUrl(file_url);
    setGenMedia(false);
    e.target.value = "";
  };

  const createPreview = async () => {
    if (!caption.trim()) return;
    setSaving(true);
    await base44.entities.SocialPost.create({
      created_by_role: isAdmin ? "admin" : "staff",
      author_id: user?.id,
      author_name: user?.full_name,
      platform,
      media_type: mediaType,
      caption,
      media_url: mediaUrl || undefined,
      status: "draft",
      approval_required: !isAdmin,
      conversation_id: conversationId,
    });
    setCaption(""); setMediaUrl(""); setBrief("");
    await loadPosts();
    setSaving(false);
  };

  const publish = async (post) => {
    setBusyPost(post.id);
    await base44.functions.invoke("publishSocialPost", { postId: post.id });
    await loadPosts();
    setBusyPost(null);
  };

  const approveReject = async (post, approve) => {
    setBusyPost(post.id);
    if (approve) {
      await base44.functions.invoke("publishSocialPost", { postId: post.id });
    } else {
      await base44.entities.SocialPost.update(post.id, { status: "rejected" });
    }
    await loadPosts();
    setBusyPost(null);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Composer */}
      <div className="bg-[#241812] border border-orange-900/40 rounded-2xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-orange-100 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-orange-400" /> Compose a Post
        </h3>

        {/* Platform */}
        <div>
          <label className="text-[11px] font-semibold text-orange-200/70 block mb-1.5">Platform</label>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORMS.map(({ key, label, icon: Icon, live }) => (
              <button key={key} onClick={() => setPlatform(key)}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${platform === key ? "bg-orange-600 text-white border-orange-500" : "bg-[#2a1d16] text-orange-200/70 border-orange-900/40 hover:border-orange-700"}`}>
                <Icon className="w-3.5 h-3.5" /> {label}
                {!live && <span className="text-[8px] opacity-70">·manual</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Media type */}
        <div>
          <label className="text-[11px] font-semibold text-orange-200/70 block mb-1.5">Media type</label>
          <div className="flex flex-wrap gap-1.5">
            {MEDIA_TYPES.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setMediaType(key)}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${mediaType === key ? "bg-orange-600 text-white border-orange-500" : "bg-[#2a1d16] text-orange-200/70 border-orange-900/40 hover:border-orange-700"}`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Magna Cinematic — video/reel only */}
        {(mediaType === "video" || mediaType === "reel") && (
          <button onClick={() => setMagnaCinematic((v) => !v)}
            className={`w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg border transition-all ${magnaCinematic ? "bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-amber-600/60" : "bg-[#2a1d16] border-orange-900/40 hover:border-orange-700"}`}>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${magnaCinematic ? "bg-amber-500/20" : "bg-orange-900/40"}`}>
              <Video className={`w-4 h-4 ${magnaCinematic ? "text-amber-300" : "text-orange-300"}`} />
            </span>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-orange-100">Magna Cinematic Generator</p>
              <p className="text-[10px] text-orange-200/50">Flagship film-grade look — lighting, camera motion, motion graphics</p>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${magnaCinematic ? "bg-amber-500 text-black" : "bg-orange-900/60 text-orange-300"}`}>{magnaCinematic ? "ON" : "OFF"}</span>
          </button>
        )}

        {/* Brief */}
        <div>
          <label className="text-[11px] font-semibold text-orange-200/70 block mb-1.5">What's the post about?</label>
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={2}
            placeholder="e.g. Announce our new AI Governance certification for builders"
            className="w-full bg-[#1a120d] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-600 resize-none" />
          <div className="flex gap-2 mt-2">
            <button onClick={generateCaption} disabled={genCaption || !brief.trim()}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-200 bg-[#2a1d16] hover:bg-[#3a2a24] border border-orange-900/40 px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
              {genCaption ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Generate caption
            </button>
            {mediaType !== "text" && (
              <button onClick={generateMedia} disabled={genMedia || !brief.trim()}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-200 bg-[#2a1d16] hover:bg-[#3a2a24] border border-orange-900/40 px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
                {genMedia ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />} Generate media
              </button>
            )}
            {mediaType !== "text" && (
              <>
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={uploadMedia} />
                <button onClick={() => fileRef.current?.click()} disabled={genMedia}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-200 bg-[#2a1d16] hover:bg-[#3a2a24] border border-orange-900/40 px-2.5 py-1.5 rounded-lg transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Upload
                </button>
              </>
            )}
          </div>
        </div>

        {/* Caption editor */}
        <div>
          <label className="text-[11px] font-semibold text-orange-200/70 block mb-1.5">Caption</label>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4}
            placeholder="Write or generate the caption…"
            className="w-full bg-[#1a120d] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-600 resize-none" />
        </div>

        {mediaUrl && (
          <div className="rounded-lg overflow-hidden border border-orange-900/40">
            {(mediaType === "video" || mediaType === "reel")
              ? <video src={mediaUrl} controls className="w-full max-h-48 object-cover bg-black" />
              : <img src={mediaUrl} alt="" className="w-full max-h-48 object-cover bg-black" />}
          </div>
        )}

        <button onClick={createPreview} disabled={saving || !caption.trim()}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 px-4 py-2.5 rounded-xl disabled:opacity-50 transition-opacity">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Create Preview
        </button>
      </div>

      {/* Queue / previews */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-orange-100">Studio Queue</h3>
          <button onClick={loadPosts} className="text-orange-300 hover:text-white p-1 rounded-lg hover:bg-[#2a1d16]">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        {posts.length === 0 ? (
          <p className="text-xs text-orange-200/50 py-6 text-center">No posts yet. Compose one to preview it here.</p>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {posts.map((post) => (
              <SocialPreviewCard
                key={post.id}
                post={post}
                isAdmin={isAdmin}
                busy={busyPost === post.id}
                onPublish={publish}
                onApprove={(p) => approveReject(p, true)}
                onReject={(p) => approveReject(p, false)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}