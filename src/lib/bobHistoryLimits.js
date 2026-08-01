// Hard limits for the BOB Builder Wipe Board + chat threads.
// Bounded so a large board never degrades chat performance: the history fetch
// and the rendered thread are both capped. Tune here in one place.
export const HISTORY_PAGE = 30;  // max conversations fetched from the SDK per load
export const ACTIVE_LIMIT = 12;  // projects shown as "active" on the board
export const HARD_CAP = 30;      // total live projects kept on the board
export const MAX_MESSAGES = 60; // max messages rendered per conversation thread