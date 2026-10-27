const processor = `class RocketWind extends AudioWorkletProcessor {
  process(inputs, outputs) {
    for (const channel of outputs[0]) for (let i = 0; i < channel.length; i++) channel[i] = (Math.random() * 2 - 1) * .35;
    return true;
  }
}
registerProcessor('rocket-wind', RocketWind);`;
export default function rocketDemoAudio() {
  let context, gain, node, filter, loading;
  return {
    async enable() {
      if (!context) {
        context = new AudioContext();
        const url = URL.createObjectURL(new Blob([processor], { type: 'text/javascript' }));
        loading = context.audioWorklet.addModule(url).finally(() => URL.revokeObjectURL(url));
      }
      await context.resume(); await loading;
      if (node) return;
      node = new AudioWorkletNode(context, 'rocket-wind');
      filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 260;
      gain = context.createGain(); gain.gain.value = 0;
      node.connect(filter); filter.connect(gain); gain.connect(context.destination);
    },
    launch() {
      if (!gain || context.state !== 'running') return;
      const now = context.currentTime;
      gain.gain.cancelScheduledValues(now); gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(.32, now + 1.5); gain.gain.linearRampToValueAtTime(0, now + 7);
    },
    mute() { if (gain) { gain.gain.cancelScheduledValues(context.currentTime); gain.gain.value = 0; } },
    dispose() { node?.disconnect(); filter?.disconnect(); gain?.disconnect(); if (context && context.state !== 'closed') void context.close(); },
  };
}