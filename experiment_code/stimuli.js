// --- stimuli.js --- //
// Exposes:
//   - window.introduction_page
//   - window.politicalCharacterizations (coalitional-only strings)
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

// ---------------- Master list (COALITIONAL ONLY) ----------------
// Keep this list to coalitional stereotypes only. I fixed minor typos, spacing,
// and missing commas from your draft (e.g., "Northeastern" -> "Northeast").
window.politicalCharacterizations = [
  // REP typical pool
  "Republicans are Working Class",
  "Republicans are White",
  "Republicans are Straight",
  "Republicans live in the South",
  "Republicans live in Rural areas",
  "Republicans are Religious",
  "Republicans are Old",
  "Republicans are Christian",
  "Republicans are Male",
  "Republicans are Rich",

  // DEM typical pool
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

  // Cross-party counterparts
  "Democrats are Working Class",
  "Democrats are White",
  "Democrats are Straight",
  "Democrats live in the South",
  "Democrats live in Rural areas",
  "Democrats are Religious",
  "Democrats are Old",
  "Democrats are Male",
  "Democrats are Christian",
  "Democrats are Rich",
  "Republicans are Young",
  "Republicans are Female",
  "Republicans live in Cities",
  "Republicans are People of Color",
  "Republicans live in the Northeast",
  "Republicans are Lesbian, Gay, or Bisexual",
  "Republicans are College Graduates",
  "Republicans are Black",
  "Republicans are Atheist",
  "Republicans are Union Members",

  // Exploratory coalitional (still coalitional; all included)
  "Democrats are Asian",
  "Republicans are Asian",
  "Democrats are Jewish",
  "Republicans are Jewish",
  "Democrats are Muslim",
  "Republicans are Muslim",
  "Democrats are Hispanic",
  "Republicans are Hispanic",
  "Democrats are Trans",
  "Republicans are Trans",
  "Democrats are Queer",
  "Republicans are Queer",
  "Democrats are Married",
  "Republicans are Married",
  "Democrats are Parents",
  "Republicans are Parents",
  "Democrats are Immigrants",
  "Republicans are Immigrants",
  "Democrats are Multilingual",
  "Republicans are Multilingual",
  "Democrats are Highly Educated",
  "Republicans are Highly Educated",
  "Democrats are Blue-Collar",
  "Republicans are Blue-Collar",
  "Democrats are White-Collar",
  "Republicans are White-Collar",
  "Democrats are Veterans",
  "Republicans are Veterans",
  "Democrats are Business-Owners",
  "Republicans are Business-Owners",
  "To show you are paying attention, press F (False)",
  "To show you are paying attention, press J (True)"
];

// ---------------- Helpers ----------------
function shuffle(a, rng = Math.random) {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) {
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

  // Optional: duplicate check to catch list copy/paste issues
  const dups = master.filter((s, i) => master.indexOf(s) !== i);
  if (dups.length) console.warn("Duplicate items detected in politicalCharacterizations:", [...new Set(dups)]);

  // Shuffle once here; experiment.js uses randomize_order:false
  const shuffled = shuffle(master);
  window.coalitionalTrials = shuffled.map(t => asTrialObj(t));

  // Back-compat for timeline consumption
  window.mainTaskTrials = window.coalitionalTrials;

  // Optional sanity log
  console.log(`Coalitional-only mode: ${master.length} items; randomized order ready.`);
})();
