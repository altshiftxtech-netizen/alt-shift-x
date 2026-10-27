import React from 'react';
import { Link } from 'react-router-dom';
import '@/components/suite/game/rocketDemo.css';
export default function RocketDemoPanel({ game, onInspect }) {
  const { state, signedIn, ready, phase, fuel, sound, toggleSound, soundError } = game;
  return <section className="rocket-demo-panel" aria-label="Rocket reward demo">
    <h2>ROCKET CHALLENGE · DEMO</h2>
    <p>Cryogenic pressure <strong data-testid="rocket-pressure">{state.pressure}/100</strong></p>
    <progress aria-label="Cryogenic fuel pressure" max="100" value={state.pressure} />
    <p>{signedIn ? 'Account boost: +2 per interaction' : 'Guest: +1 per interaction'} · This tab</p>
    <p className="rocket-demo-note">100 pressure = 1 demo month. No cash value or checkout discount.</p>
    <div className="rocket-demo-actions"><button onClick={fuel} disabled={!ready}>Fuel rocket</button><button onClick={onInspect}>View rocket</button></div>
    <p className="rocket-demo-note" data-testid="rocket-demo-phase">{ready ? phase : 'Preparing 3D rocket…'} · Demo launches: {state.launches}</p>
    <button className="rocket-demo-sound" onClick={toggleSound} aria-pressed={sound}>{sound ? 'Mute launch sound' : 'Enable launch sound'}</button>
    {soundError && <p role="status">{soundError}</p>}
    {state.reward && <button className="rocket-demo-review" onClick={() => game.setOpen(true)}>View demo reward</button>}
    {!signedIn && <Link to="/login?returnTo=%2Fsuite">Sign in for double progress</Link>}
  </section>;
}