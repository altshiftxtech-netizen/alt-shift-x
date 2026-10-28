import React from 'react';
import { Link } from 'react-router-dom';
export default function PersonalGameControls({ focus, game, activity, onPlant, onCancel }) {
  const tree = focus === 'planting';
  return <div className="suite-personal-controls">
    <strong>{tree ? 'Reforestation challenge' : 'Drone / rover challenge'}</strong>
    <p>{tree ? 'Plant a tree with the field robot. Each completed planting earns one success.' : 'Select any front-lane rover, then keep its laser locked for 2 seconds. Use a different rover for the next success.'}</p>
    <p role="status" aria-live="polite">{game.loading ? 'Loading progress…' : `${game.state.successes} / 50 personal successes`} · 20% reward</p>
    <p role="status">{activity.message || 'Ready'}</p>
    {activity.busy && <progress max="1" value={activity.progress || 0} aria-label="Action progress" />}
    {game.error && <p role="alert">{game.error}</p>}
    {!game.signedIn && <p>Practice mode. <Link to="/login?returnTo=%2Fsuite">Sign in before playing to save successes and earn the discount.</Link></p>}
    {game.state.unlocked ? <p>20% unlocked on Flex, Duo and Apex, including renewals. Discounts do not stack. <Link to="/sovereignpass">Choose a discounted pass</Link></p> : <div className="suite-ground-control-row">
      {tree && <button onClick={onPlant} disabled={activity.busy || game.loading}>Plant a tree</button>}
      {activity.busy && <button onClick={onCancel}>Cancel action</button>}
    </div>}
    {game.signedIn && !activity.busy && <button onClick={game.refresh} disabled={game.loading}>Refresh progress</button>}
  </div>;
}