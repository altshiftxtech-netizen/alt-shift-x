import { Actor } from 'base44:runtime/actors';

export default class RobotWaveRoom extends Actor {
  total = 0;
  gates = new Map();
  row = null;
  saving = null;
  test = false;
  async handleStart() {
    this.test = /^robot-waves-qa-[a-f0-9-]{36}$/.test(this.instanceId);
    const saved = await this.storage.get('state');
    this.total = saved?.total || 0;
    this.gates = new Map(saved?.gates || []);
  }
  async handleConnect(conn) {
    if (!/^robot-waves-v1-([0-9]|[1-5][0-9]|6[0-3])$/.test(this.instanceId) && !this.test) { conn.reject(4001, 'Unknown wave room'); return; }
    if (this.test) {
      if (conn.identity?.type !== 'authenticated') { conn.reject(4003, 'Administrator required'); return; }
      const user = await this.client.asServiceRole.entities.User.get(conn.identity.userId);
      if (user.role !== 'admin') { conn.reject(4003, 'Administrator required'); return; }
    }
    if (this.getConnections().length > 64) { conn.reject(4001, 'Wave room full'); return; }
    conn.send({ type: 'ready' });
  }
  handleClose() {}
  async handleMessage(conn, msg) {
    try { await this.receive(conn, msg); }
    catch (error) { console.error('[RobotWaveRoom]', error.message); conn.send({ type: 'wave_error', message: 'Wave could not be counted. Please try again.', ...(this.test ? { detail: String(error.message).slice(0, 160) } : {}) }); }
  }
  async receive(conn, msg) {
    if (!msg || typeof msg !== 'object') { conn.send({ type: 'rejected', reason: 'invalid_message' }); return; }
    // A test reset can never address a production room or promote a counter.
    if (msg.type === 'clear_test' && this.test && conn.identity?.type === 'authenticated') {
      const user = await this.client.asServiceRole.entities.User.get(conn.identity.userId);
      if (user.role !== 'admin') return;
      if (this.saving) await this.saving;
      const page = await this.client.asServiceRole.entities.RobotWaveShard.filter({ room_id: this.instanceId }, 'created_date', 1);
      const row = this.row || page[0];
      if (row) await this.client.asServiceRole.entities.RobotWaveShard.delete(row.id);
      this.row = null; this.total = 0; this.gates.clear();
      await this.storage.delete('state'); await this.cancelSchedule('checkpoint');
      conn.send({ type: 'test_cleared' }); return;
    }
    if (msg.type !== 'wave' || !/^survey-[1357]$/.test(msg.robotId) || typeof msg.eventId !== 'string' || !/^[a-f0-9-]{36}$/.test(msg.eventId)) { conn.send({ type: 'rejected', reason: 'invalid_wave' }); return; }
    const identity = conn.identity;
    const key = identity?.type === 'authenticated' ? `u:${identity.userId}` : identity?.type === 'anonymous' ? `a:${identity.anonymousId}` : null;
    if (!key) { conn.send({ type: 'rejected', reason: 'identity_unavailable' }); return; }
    const now = Date.now(), previous = this.gates.get(key);
    if (previous && (now - previous.at < 3000 || previous.eventId === msg.eventId)) { conn.send({ type: 'cooldown' }); return; }
    this.gates.set(key, { at: now, eventId: msg.eventId });
    for (const [id, gate] of this.gates) if (now - gate.at > 86400000) this.gates.delete(id);
    this.total += 1;
    await this.storage.put('state', { total: this.total, gates: [...this.gates] });
    if (this.total === 1 || this.total % 20 === 0) await this.checkpoint();
    await this.schedule('checkpoint', now + 10000);
    conn.send({ type: 'accepted' });
  }
  async checkpoint() {
    if (this.saving) return this.saving;
    this.saving = this.persist();
    try { await this.saving; } finally { this.saving = null; }
  }
  async persist() {
    if (!this.row) {
      const page = await this.client.asServiceRole.entities.RobotWaveShard.filter({ room_id: this.instanceId }, 'created_date', 1);
      this.row = page[0] || await this.client.asServiceRole.entities.RobotWaveShard.create({ campaign: this.test ? 'robot-waves-qa' : 'robot-waves-v1', room_id: this.instanceId, total: this.total });
    }
    await this.client.asServiceRole.entities.RobotWaveShard.update(this.row.id, { total: this.total });
  }
  async handleWake(key) { if (key === 'checkpoint' && this.total) await this.checkpoint(); }
}