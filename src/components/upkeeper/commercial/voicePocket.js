// Feed a speech-activity envelope into a single peaking EQ on the music group.
// Voice is never sent into this filter. The sidechain follows the voice fader.
export default function voicePocket(context) {
  const filter = context.createBiquadFilter();
  filter.type = 'peaking';
  filter.frequency.value = Math.sqrt(1000 * 3500);
  filter.Q.value = .75;
  const envelope = context.createConstantSource();
  envelope.offset.value = 0;
  const amount = context.createGain();
  envelope.connect(amount).connect(filter.gain);
  return { filter, amount, envelope };
}

export function scheduleVoicePocket(param, audio, at, offset, length) {
  const channels = Array.from({ length: audio.numberOfChannels }, (_, c) => audio.getChannelData(c));
  let active = false;
  let lastLoud = -Infinity;
  for (let t = 0; t < length; t += .025) {
    let energy = 0, count = 0;
    const first = Math.floor((offset + t) * audio.sampleRate);
    const end = Math.min(audio.length, first + Math.ceil(.025 * audio.sampleRate));
    for (const channel of channels) for (let i = first; i < end; i += 8) {
      energy += channel[i] ** 2;
      count++;
    }
    if (count && energy / count > .0001) lastLoud = t;
    const next = t - lastLoud < .12;
    if (next !== active) {
      param.setTargetAtTime(next ? -6 : 0, at + t, next ? .012 : .045);
      active = next;
    }
  }
  param.setTargetAtTime(0, at + length, .045);
}