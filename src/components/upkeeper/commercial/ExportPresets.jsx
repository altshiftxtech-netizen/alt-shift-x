import React, { useEffect, useState } from 'react';
import { Download, Film, Image as ImageIcon, Loader2, Clapperboard } from 'lucide-react';
import { downloadAsset } from '@/components/upkeeper/creativeAssets';
import { mb } from '@/components/upkeeper/commercial/exportDirector';

function MasterPlayer({ reel }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!reel?.blob) {
      setUrl('');
      return undefined;
    }
    const next = URL.createObjectURL(reel.blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [reel]);
  if (!url) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <span className="dm-label">Master</span>
      <video className="dm-video" src={url} controls playsInline />
      <div className="dm-row-between" style={{ marginTop: 8 }}>
        <span className="dm-note">
          {reel.width}×{reel.height} · {reel.seconds}s · {reel.extension.toUpperCase()} · {mb(reel.blob.size)}
          {reel.hasAudio ? '' : ' · no narration'}
        </span>
        <button
          type="button"
          className="dm-ghost"
          onClick={() => downloadAsset(reel.blob, `upkeeper-commercial-${reel.width}x${reel.height}.${reel.extension}`)}
        >
          <Download className="w-3.5 h-3.5" /> Download master
        </button>
      </div>
    </div>
  );
}

const PRESETS = [
  { key: 'cinema', icon: Film, title: 'Master Cinema 4K', aspect: '16:9', detail: '3840×2160 high-bitrate MP4, 60 fps target, stereo mix and four 24-bit / 48 kHz WAV stems in a ZIP.' },
  {
    key: 'reddit',
    icon: Clapperboard,
    title: 'Reddit / X',
    aspect: '16:9',
    detail: '16:9 video, post.md with title and body, captions.srt — zipped.',
  },
  {
    key: 'shorts',
    icon: Film,
    title: 'Social Vertical Reel',
    aspect: '9:16',
    detail: '9:16 vertical with burned-in high-viz captions, plus captions.srt.',
  },
  {
    key: 'gif',
    icon: ImageIcon,
    title: 'Community GIF Package',
    aspect: null,
    detail: '15-second 1080p loop at 10 fps with Reddit Markdown copy in a ZIP.',
  },
];

export default function ExportPresets({ plan, reel, gif, stale, busy, progress, onExport }) {
  if (!plan) return null;
  return (
    <div className="dm-panel">
      <div className="dm-row-between" style={{ marginBottom: 12 }}>
        <span className="dm-label" style={{ margin: 0 }}>
          Export presets
        </span>
        {stale ? (
          <span className="dm-note" style={{ color: 'var(--dm-amber)' }}>
            Edits pending — every export re-renders them in first.
          </span>
        ) : (
          gif && <span className="dm-note">Loop on file · {mb(gif.blob.size)}</span>
        )}
      </div>

      <div className="dm-exports">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const working = busy === preset.key;
          const needsRender = preset.aspect ? plan.aspect !== preset.aspect || stale : stale;
          return (
            <button
              key={preset.key}
              type="button"
              className="dm-export"
              onClick={() => onExport(preset.key)}
              disabled={Boolean(busy)}
            >
              <strong>
                {working ? (
                  <Loader2 className="w-3.5 h-3.5 dm-spin" style={{ display: 'inline', marginRight: 6 }} />
                ) : (
                  <Icon className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 6 }} />
                )}
                {preset.title}
              </strong>
              <span>{preset.detail}</span>
              {needsRender && (
                <span style={{ color: 'var(--dm-amber)' }}>
                  {preset.aspect && plan.aspect !== preset.aspect ? `Renders a ${preset.aspect} cut first.` : 'Re-renders with your edits.'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {busy === 'gif' && (
        <div className="dm-progress" style={{ marginTop: 12 }}>
          <i style={{ width: `${Math.max(3, progress)}%` }} />
        </div>
      )}

      <MasterPlayer reel={reel} />
    </div>
  );
}