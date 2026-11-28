import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import '@/components/upkeeper/commercial/director.css';
import ConceptBar from '@/components/upkeeper/commercial/ConceptBar';
import BeatSheet from '@/components/upkeeper/commercial/BeatSheet';
import DirectorStage from '@/components/upkeeper/commercial/DirectorStage';
import CaptionWordEditor from '@/components/upkeeper/commercial/CaptionWordEditor';
import AudioBalance from '@/components/upkeeper/commercial/AudioBalance';
import ExportPresets from '@/components/upkeeper/commercial/ExportPresets';
import { localPlan, refinePlan, rerollBeat, updateWord } from '@/components/upkeeper/commercial/directorPlan';
import { generateVoice, DEFAULT_LEVELS } from '@/components/upkeeper/commercial/directorAudio';
import { renderCommercial, renderGif, supportedFormats } from '@/components/upkeeper/commercial/renderDirector';
import { downloadSocialPackage, downloadVerticalPackage, downloadGifPackage, downloadCinemaPackage, mb } from '@/components/upkeeper/commercial/exportDirector';
import bounceDirectorStems from '@/components/upkeeper/commercial/bounceDirectorStems';
import ScoreDock from '@/components/upkeeper/commercial/ScoreDock';
import { DEFAULT_SCORE } from '@/components/upkeeper/commercial/scoreSettings';
import WatermarkSettings from '@/components/upkeeper/commercial/WatermarkSettings';
import { defaultWatermark, prepareBadge } from '@/components/upkeeper/commercial/crystalBadge';
import { downloadAsset } from '@/components/upkeeper/creativeAssets';

// The Commercial Maker: one prompt in, a finished spot out. The four-beat sheet
// is generated instantly, refined by the director model, then a single pass
// renders picture, captions, narration, score and SFX on one clock.
export default function CommercialMaker() {
  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState('9:16');
  const [duration, setDuration] = useState(30);
  const [voice, setVoice] = useState('storm');

  const [plan, setPlan] = useState(null);
  const [watermark, setWatermark] = useState(defaultWatermark);
  const [levels, setLevels] = useState(DEFAULT_LEVELS);
  const [score, setScore] = useState(DEFAULT_SCORE);
  const [voiceUrls, setVoiceUrls] = useState([]);

  const [busy, setBusy] = useState(null);
  const [progress, setProgress] = useState(0);
  const [reel, setReel] = useState(null);
  const [gif, setGif] = useState(null);
  const [stale, setStale] = useState(false);
  const [cache, setCache] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [selected, setSelected] = useState({ beat: 0, word: null });
  const [activeBeat, setActiveBeat] = useState(0);
  const abortRef = useRef(null);
  const formats = useRef(supportedFormats());

  const changeWatermark = next => {
    setWatermark(next);
    setCache({});
    setGif(null);
    if (reel) setStale(true);
  };

  useEffect(() => () => abortRef.current?.abort(), []);

  const runRender = async (target, { stash = true, narration = voiceUrls, cinema = false } = {}) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy('render');
    setProgress(0);
    setError('');
    try {
      const result = await renderCommercial({
        plan: target,
        assets: await prepareBadge(watermark),
        shortEdge: cinema ? 2160 : 1080,
        fps: cinema ? 60 : 30,
        videoBitsPerSecond: cinema ? 48000000 : undefined,
        format: cinema || formats.current.mp4 ? 'mp4' : 'webm',
        strictFormat: cinema,
        voiceUrls: narration,
        score,
        levels,
        onProgress: setProgress,
        signal: controller.signal,
      });
      if (!cinema) setCache((prev) => ({ ...prev, [target.aspect]: result }));
      if (stash) {
        setReel(result);
        setStale(false);
        downloadAsset(result.blob, `upkeeper-commercial-${result.width}x${result.height}.${result.extension}`);
      }
      setNotice(
        `Master ready · ${result.seconds}s · ${result.width}×${result.height} · ${result.extension.toUpperCase()}${
          result.hasAudio ? '' : ' · narration unavailable, score and SFX only'
        }.`
      );
      return result;
    } catch (e) {
      if (!controller.signal.aborted) setError(e.message);
      return null;
    } finally {
      setBusy(null);
      setProgress(0);
      abortRef.current = null;
    }
  };

  const generate = async () => {
    const text = prompt.trim();
    if (!text) return;
    setError('');
    setNotice('');
    setReel(null);
    setGif(null);
    setCache({});
    setStale(false);
    setProgress(0);
    setSelected({ beat: 0, word: null });
    setActiveBeat(0);
    setVoiceUrls([]);

    const base = localPlan(text, duration, aspect);
    setPlan(base);
    setBusy('plan');

    let refined = base;
    try {
      refined = await refinePlan(base);
      setPlan(refined);
    } catch {
      setNotice('Director model unavailable — the built-in beat sheet is being used.');
    }

    setBusy('voice');
    let urls = [];
    try {
      urls = await generateVoice(refined, voice);
    } catch {
      urls = [];
    }
    setVoiceUrls(urls);
    const missing = urls.filter((u) => !u).length;
    if (missing) {
      setNotice((prev) =>
        `${prev ? `${prev} ` : ''}${missing} narration line${missing > 1 ? 's' : ''} could not be voiced; this cut carries score and SFX only.`.trim()
      );
    }
    setBusy(null);
    await runRender(refined, { narration: urls });
  };

  const cancel = () => abortRef.current?.abort();

  const reroll = (index) => {
    if (!plan) return;
    setPlan(rerollBeat(plan, index));
    setStale(true);
    setCache({});
    setNotice('Scene re-rolled — narration, captions and the other beats are unchanged. Render again to bake the new shot.');
  };

  const patchWord = (patch) => {
    if (!plan || selected.word == null) return;
    setPlan(updateWord(plan, selected.beat, selected.word, patch));
    setStale(true);
    setCache({});
  };

  const changeLevels = (next) => {
    setLevels(next);
    setStale(true);
    setCache({});
  };

  const changeScore = (next) => {
    setScore(next);
    setStale(Boolean(reel));
    setCache({});
  };

  const changeScope = (cinemaScope) => {
    setPlan((previous) => previous ? { ...previous, cinemaScope } : previous);
    setStale(Boolean(reel));
    setCache({});
    setGif(null);
  };

  const ensureAspect = async (target) => {
    if (!stale && cache[target]) return cache[target];
    return runRender({ ...plan, aspect: target }, { stash: false });
  };

  const exportPreset = async (kind) => {
    if (!plan) return;
    if (kind === 'cinema') {
      if (!formats.current.mp4) { setError('Cinema 4K requires a browser with MP4 recording support.'); return; }
      const target = { ...plan, aspect: '16:9' };
      const rendered = await runRender(target, { stash: false, cinema: true });
      if (!rendered) return;
      setBusy('cinema');
      try {
        const stems = await bounceDirectorStems({ plan: target, voiceUrls, levels, score });
        await downloadCinemaPackage(rendered, stems);
        setNotice('Cinema 4K package downloaded: MP4, WAV mix and four WAV stems.');
      } catch (e) { setError(e.message); }
      finally { setBusy(null); }
      return;
    }
    if (kind === 'gif') {
      const controller = new AbortController();
      abortRef.current = controller;
      setBusy('gif');
      setProgress(0);
      setError('');
      try {
        const result = await renderGif({
          plan,
          assets: await prepareBadge(watermark),
          shortEdge: 1080,
          fps: 10,
          seconds: 15,
          onProgress: setProgress,
          signal: controller.signal,
        });
        setGif(result);
        await downloadGifPackage(plan, result);
        setNotice(`GIF and Reddit copy downloaded · Loop ready · 15s · ${result.width}×${result.height} · ${mb(result.blob.size)}.`);
      } catch (e) {
        if (!controller.signal.aborted) setError(e.message);
      } finally {
        setBusy(null);
        setProgress(0);
        abortRef.current = null;
      }
      return;
    }

    const target = kind === 'reddit' ? '16:9' : '9:16';
    const rendered = await ensureAspect(target);
    if (!rendered) return;
    setBusy(kind);
    setError('');
    try {
      const shaped = { ...plan, aspect: target };
      if (kind === 'reddit') await downloadSocialPackage({ plan: shaped, reel: rendered });
      else await downloadVerticalPackage({ plan: shaped, reel: rendered });
      setNotice(
        kind === 'reddit'
          ? `Reddit / X package downloaded · ${target} ${rendered.extension.toUpperCase()} + post.md + captions.srt.`
          : `Shorts / Reels package downloaded · ${target} ${rendered.extension.toUpperCase()} with burned-in captions.`
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="dm-shell">
      <div className="dm-head">
        <span className="dm-eyebrow">Commercial Maker</span>
        <h2>One prompt. Four beats. One master.</h2>
        <p>
          Describe the spot. The director cuts a four-beat sheet — hook, action, proof, climax — and a single pass renders
          picture, burned-in captions, narration, score and SFX together.
        </p>
      </div>

      <ConceptBar
        prompt={prompt}
        setPrompt={setPrompt}
        aspect={aspect}
        setAspect={setAspect}
        duration={duration}
        setDuration={setDuration}
        voice={voice}
        setVoice={setVoice}
        onGenerate={generate}
        onCancel={cancel}
        busy={busy}
        progress={progress}
      />

      {error && (
        <p className="dm-error">
          <AlertTriangle className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
          {error}
        </p>
      )}
      {notice && <p className="dm-ok">{notice}</p>}

      <ScoreDock value={score} onChange={changeScore} disabled={Boolean(busy)} />
      <WatermarkSettings value={watermark} onChange={changeWatermark} disabled={Boolean(busy)} cinemaScope={Boolean(plan?.cinemaScope)} onScope={plan ? changeScope : null} />

      {plan && (
        <>
          <BeatSheet plan={plan} activeIndex={activeBeat} onReroll={reroll} disabled={Boolean(busy)} />

          <div className="dm-stage">
            <DirectorStage
              plan={plan}
              watermark={watermark}
              levels={levels}
              score={score}
              voiceUrls={voiceUrls}
              onBeat={setActiveBeat}
              onSelectWord={(word) => setSelected({ beat: activeBeat, word })}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <fieldset disabled={Boolean(busy)}>
                <CaptionWordEditor
                  plan={plan}
                  beatIndex={selected.beat}
                  selected={selected.word}
                  onSelect={(word) => setSelected((prev) => ({ ...prev, word }))}
                  onPatch={patchWord}
                />
              </fieldset>
              <AudioBalance levels={levels} onChange={changeLevels} disabled={Boolean(busy)} />
            </div>
          </div>

          <ExportPresets
            plan={plan}
            reel={reel}
            gif={gif}
            stale={stale}
            busy={busy}
            progress={progress}
            onExport={exportPreset}
          />
        </>
      )}
    </div>
  );
}