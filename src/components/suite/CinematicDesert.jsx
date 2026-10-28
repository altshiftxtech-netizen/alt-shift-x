import React, { useEffect, useRef, useState } from 'react';
import createDesertScene from '@/components/suite/createDesertScene';
import GroundInspectionControls from '@/components/suite/GroundInspectionControls';
import useRocketDemo from '@/components/suite/game/useRocketDemo';
import useRobotWaveReward from '@/components/suite/game/useRobotWaveReward';
import RobotWaveReward from '@/components/suite/game/RobotWaveReward';
import RocketDemoReward from '@/components/suite/game/RocketDemoReward';
import SovereignGiftPassModal from '@/components/suite/game/SovereignGiftPassModal';
import useGiftPassEngine from '@/components/suite/game/useGiftPassEngine';
import useSupercomputeWatcher from '@/components/suite/useSupercomputeWatcher';
import '@/components/suite/provingGround.css';
import usePersonalGameProgress from '@/components/suite/game/usePersonalGameProgress';
import '@/components/suite/game/personalGames.css';

export default function CinematicDesert({ onInspectionChange }) {
  const host = useRef(null), inspection = useRef({ focus: null, zoom: 1, index: 0, react: false });
  const game = useRocketDemo();
  const personalGame = usePersonalGameProgress();
  const [activity, setActivity] = useState({ busy: false, progress: 0, message: 'Ready' });
  inspection.current.onPersonalActivity = setActivity;
  const robotReward = useRobotWaveReward();
  const giftEngine = useGiftPassEngine();
  useSupercomputeWatcher();
  const [focus, setFocus] = useState(null), [zoom, setZoom] = useState(1), [scope, setScope] = useState(false);
  const [range, setRange] = useState({ hits: 0, fired: 0, streak: 0, pairs: 0, goal: 50, complete: false, message: 'Shoot two different drones of the same color.' });
  const changeScope = value => { inspection.current.scope = value; setScope(value); };
  inspection.current.onRangeUpdate = setRange; inspection.current.onScopeChange = changeScope;
  const changeFocus = value => { inspection.current.personalCancel?.(); if (['planting', 'rovergame'].includes(value)) { inspection.current.zoom = 1; setZoom(1); } inspection.current.focus = value; inspection.current.index = 0; inspection.current.keyHeld = false; changeScope(false); setFocus(value); onInspectionChange?.(Boolean(value)); };
  const [, setStatus] = useState('INITIALIZING RECONNAISSANCE');
  useEffect(() => {
    let dispose;
    try { dispose = createDesertScene(host.current, setStatus, inspection.current, game.bridge, robotReward.wave, personalGame.bridge); game.setReady(true); }
    catch (error) { console.error('Desert renderer:', error); setStatus('3D REQUIRES WEBGL / SUITE NAVIGATION REMAINS AVAILABLE'); }
    return () => dispose?.();
  }, []);

  // Gift engine: pivot to gift modal on repeat milestones, mark redemption on claim
  useEffect(() => {
    if (!game.state.reward || game.state.reward.claimed) return;
    const tier = 'ROCKET_FREE_MONTH';
    if (giftEngine.checkRedemption(tier)) {
      game.setOpen(false);
      giftEngine.triggerGift(tier);
    }
  }, [game.state.launches, game.state.reward]);

  useEffect(() => {
    if (game.state.reward?.claimed && game.state.reward.tier) {
      giftEngine.markRedeemed('ROCKET_FREE_MONTH');
    }
  }, [game.state.reward?.claimed, game.state.reward?.tier]);
  return <><div ref={host} className="suite-world" /><GroundInspectionControls personalGame={personalGame} activity={activity} onPlant={() => inspection.current.personalPlant?.()} onCancelAction={() => inspection.current.personalCancel?.()} focus={focus} scope={scope} onScope={changeScope} range={range} zoom={zoom} onFocus={changeFocus} onZoom={value => { inspection.current.zoom = value; setZoom(value); }} onNext={() => { inspection.current.index += focus === 'kinetic' && inspection.current.index % (inspection.current.laserTurretCount + 1) === 0 ? 2 : 1; }} onReact={() => { inspection.current.react = true; }} onRestartRange={() => inspection.current.restartRange?.()} /><RocketDemoReward game={game} /><RobotWaveReward reward={robotReward} /><SovereignGiftPassModal reward={giftEngine.giftReward} open={giftEngine.open} onOpenChange={giftEngine.setOpen} /></>;
}