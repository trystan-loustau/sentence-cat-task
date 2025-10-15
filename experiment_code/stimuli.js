// --- stimuli.js --- //
// Exposes:
//   - window.introduction_page
//   - window.politicalCharacterizations (your full coalitional-only list)
//   - window.coalitionalTrials (trial objects for all items, shuffled)
//   - window.mainTaskTrials (alias of coalitionalTrials for your timeline)

// ---------------- Intro page ----------------
window.introduction_page = `
  <div class="exp-wrap">
    <h2>Welcome!</h2>
    <p>You’ll read statements and judge whether each is <b>True</b> or <b>False</b>.</p>
    <p>Press <b>F</b> for False and <b>J</b> for True.</p>
  </div>
`;

// ---------------- Master list ----------------
// IMPORTANT: keep ONLY coalitional stereotype strings here.
// (Use your edited list; a few examples shown.)
window.politicalCharacterizations = [
  "Republicans are Working Class",
  "Republicans are White",
  "Republicans are Straight",
  "Republicans live in the South",
  "Republicans are Rural",
  "Republicans are Religious",
  "Republicans are Old",
  "Republicans are Christian",
  "Republicans are Male",
  "Republicans are Rich",
  "Democrats are Young",
  "Democrats are Female",
  "Democrats live in Cities",
  "Democrats are People of Color",
  "Democrats live in the Northeast",
  "Democrats are Lesbian, Gay, or Bisexual",
  "Democrats are College Graduates",
  "Democrats are Black",
  "Democrats are Atheist",
  "Democrats are Union Members",
  // … your remaining coalitional items …
];

// ---------------- Helpers ----------------
function shuffle(a, rng = Math.random) {
  const x = a.slice();
  for ( (i = x.length - 1); i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}
function partyOf(text) {
  return text.startsWith("Democrats") ? "D" : "R";
}
function asTrialObj(text, { contentType = "coalitional" } = {}) {
  return { text, contentType, party: partyOf(text), exploratory: false };
}

// ---------------- Build trials (all coalitional, randomized once) ----------------
(function buildCoalitionalOnly() {
  const master = window.politicalCharacterizations || [];
  // Optional: quick duplicate check
  const dups = master.filter((s, i) => master.indexOf(s) !== i);
  if (dups.length) console.warn("Duplicate items detected:", [...new Set(dups)]);

  const shuffledTexts = shuffle(master);
  window.coalitionalTrials = shuffledTexts.map(t => asTrialObj(t));

  // For backwards compatibility with your timeline code:
  window.mainTaskTrials = window.coalitionalTrials;

  // Optional sanity log (comment out in production)
  console.log(`Coalitional-only mode: ${master.length} items; randomized order ready.`);
})();
