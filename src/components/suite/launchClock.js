const eastern = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const dateKey = date => date.toISOString().slice(0, 10);
function holidays(year) {
  const days = new Set();
  const observed = (y, m, d) => { const date = new Date(Date.UTC(y, m - 1, d)); if (date.getUTCDay() === 6) date.setUTCDate(d - 1); if (date.getUTCDay() === 0) date.setUTCDate(d + 1); days.add(dateKey(date)); };
  const monday = (m, n) => { const date = new Date(Date.UTC(year, m - 1, 1)); date.setUTCDate(1 + (8 - date.getUTCDay()) % 7 + (n - 1) * 7); days.add(dateKey(date)); };
  // NYSE's normal full-day closures; extraordinary exchange closures are not predicted.
  for (const [m, d] of [[1, 1], [6, 19], [7, 4], [12, 25]]) observed(year, m, d);
  // NYSE does not observe a Saturday New Year's Day on the preceding Friday.
  if (new Date(Date.UTC(year, 0, 1)).getUTCDay() === 6) days.delete(`${year - 1}-12-31`);
  monday(1, 3); monday(2, 3); monday(9, 1);
  const memorial = new Date(Date.UTC(year, 4, 31)); memorial.setUTCDate(31 - (memorial.getUTCDay() + 6) % 7); days.add(dateKey(memorial));
  const thanksgiving = new Date(Date.UTC(year, 10, 1)); thanksgiving.setUTCDate(1 + (11 - thanksgiving.getUTCDay()) % 7 + 21); days.add(dateKey(thanksgiving));
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = (h + l - 7 * m + 114) % 31 + 1;
  const friday = new Date(Date.UTC(year, month - 1, day - 2)); days.add(dateKey(friday)); return days;
}
let cachedYear, closures;
export default function launchClock(date = new Date()) {
  const parts = Object.fromEntries(eastern.formatToParts(date).map(p => [p.type, p.value]));
  const key = `${parts.year}-${parts.month}-${parts.day}`, year = Number(parts.year);
  if (cachedYear !== year) { cachedYear = year; closures = holidays(year); }
  const weekday = new Date(`${key}T12:00:00Z`).getUTCDay();
  return { key, due: weekday > 0 && weekday < 6 && !closures.has(key) && parts.hour === '09' && parts.minute === '30' };
}