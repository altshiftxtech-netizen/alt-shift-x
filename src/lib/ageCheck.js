// Age-policy helpers for the raffle entry gate.
// Age is computed with standard year/month/day rollover — a participant who
// turns min_age on or before the as-of date IS eligible (birthday edge-case).

export function computeAge(dobStr, asOfStr) {
  if (!dobStr || !asOfStr) return null;
  const dob = new Date(dobStr);
  const asOf = new Date(asOfStr);
  if (isNaN(dob) || isNaN(asOf)) return null;
  let age = asOf.getFullYear() - dob.getFullYear();
  const m = asOf.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && asOf.getDate() < dob.getDate())) age--;
  return age;
}

// Pick the as-of date based on the policy: raffle end date, or "today" (submission).
export function asOfDate(policy, raffle) {
  if (policy?.as_of === "entry_submission") return new Date().toISOString().slice(0, 10);
  return raffle?.end_date || new Date().toISOString().slice(0, 10);
}

// Returns { ok, age, message }. ok=false => hard block.
export function evaluateAgePolicy(dobStr, policy, raffle) {
  const msg = policy?.public_entry_message || "Entry requires participants to be 16 or older.";
  if (!dobStr) return { ok: false, age: null, message: "Please enter your date of birth." };

  const dob = new Date(dobStr);
  const now = new Date();
  if (isNaN(dob)) return { ok: false, age: null, message: "Please enter a valid date of birth." };
  if (dob > now) return { ok: false, age: null, message: "Date of birth can't be in the future." };
  if (dob.getFullYear() < 1900) return { ok: false, age: null, message: "Please enter a valid date of birth." };

  const age = computeAge(dobStr, asOfDate(policy, raffle));
  const min = policy?.min_age ?? 16;
  const max = policy?.max_age;

  if (age < min) return { ok: false, age, message: msg };
  if (max != null && age > max) return { ok: false, age, message: msg };
  return { ok: true, age, message: "" };
}