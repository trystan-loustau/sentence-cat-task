// --- stimuli.js --- //
// Exposes:
//   - window.introduction_page
//   - window.mainTaskTrials  (final mixed sequence)
//   - window.coalitionalRep, window.coalitionalDem (confirmatory pools after sampling to 16 each)
//   - window.traitTrials, window.issueTrials (each sampled to 32)
//   - window.exploratoryChosen (the single chosen pair; 2 items)

// ---------------- Intro page ----------------
window.introduction_page = `
  <div class="exp-wrap">
    <h2>Welcome!</h2>
    <p>You’ll read statements and judge whether each is <b>True</b> or <b>False</b>.</p>
    <p>Press <b>F</b> for False and <b>J</b> for True.</p>
  </div>
`;

// ---------------- Master list (keep as STRINGS) ----------------
window.politicalCharacterizations = [
  // --- COALITIONAL (typical pools + counterparts + exploratory) ---
  // REP typical pool (first 10; indices 0..9)
  "Republicans are Working Class",
  "Republicans are White",
  "Republicans are Straight",
  "Republicans are Southern",
  "Republicans are Rural",
  "Republicans are Religious",
  "Republicans are Old",
  "Republicans are Christian",
  "Republicans are Uneducated",
  "Republicans are Men",
  // DEM typical pool (next 11; indices 10..20)
  "Democrats are Young",
  "Democrats are Women",
  "Democrats are Urban",
  "Democrats are Trans",
  "Democrats are Queer",
  "Democrats are People of Color",
  "Democrats are Northeastern",
  "Democrats are Lesbian/Gay/Bisexual",
  "Democrats are Educated",
  "Democrats are Black",
  "Democrats are Atheists",
  // Cross-party counterparts (ensure present)
  "Democrats are Working Class",
  "Democrats are White",
  "Democrats are Straight",
  "Democrats are Southern",
  "Democrats are Rural",
  "Democrats are Religious",
  "Democrats are Old",
  "Democrats are Christian",
  "Democrats are Uneducated",
  "Democrats are Men",
  "Republicans are Young",
  "Republicans are Women",
  "Republicans are Urban",
  "Republicans are Trans",
  "Republicans are Queer",
  "Republicans are People of Color",
  "Republicans are Northeastern",
  "Republicans are Lesbian/Gay/Bisexual",
  "Republicans are Educated",
  "Republicans are Black",
  "Republicans are Atheists",
  // Exploratory coalitional (religion/ethnicity; indices 42..47)
  "Democrats are Asian",
  "Republicans are Asian",
  "Democrats are Jewish",
  "Republicans are Jewish",
  "Democrats are Muslim",
  "Republicans are Muslim",

  // --- TRAIT (indices 48..83) ---
  "Democrats are Kind",
  "Democrats are Open-minded",
  "Democrats are Accepting",
  "Democrats have Colored Hair",
  "Democrats are Passionate",
  "Democrats are Empathetic",
  "Democrats are Outspoken",
  "Democrats are Hopeful",
  "Democrats are Caring",
  "Republicans are Open-Minded",
  "Republicans are Accepting",
  "Republicans have Colored Hair",
  "Republicans are Passionate",
  "Republicans are Empathetic",
  "Republicans are Outspoken",
  "Republicans are Hopeful",
  "Republicans are Caring",
  "Republicans are Kind",
  "Republicans are Traditional",
  "Republicans are Hardworking",
  "Republicans are Family-Oriented",
  "Republicans are Individualistic",
  "Republicans are Patriotic",
  "Republicans are Logical",
  "Republicans are Rational",
  "Republicans are Strong",
  "Republicans are Responsible",
  "Democrats are Traditional",
  "Democrats are Hardworking",
  "Democrats are Family-Oriented",
  "Democrats are Individualistic",
  "Democrats are Patriotic",
  "Democrats are Logical",
  "Democrats are Rational",
  "Democrats are Strong",
  "Democrats are Responsible",

  // --- ISSUE (indices 84..119) ---
  "Democrats are Pro-Choice",
  "Democrats are Pro-Change",
  "Democrats are Pro-Government",
  "Democrats are Pro-Immigration",
  "Democrats are Pro-Environment",
  "Democrats are Pro-Equality",
  "Democrats are Pro-Social Justice",
  "Democrats are Pro-Healthcare",
  "Democrats are Pro-Advocacy",
  "Republicans are Pro-Choice",
  "Republicans are Pro-Change",
  "Republicans are Pro-Government",
  "Republicans are Pro-Immigration",
  "Republicans are Pro-Environment",
  "Republicans are Pro-Equality",
  "Republicans are Pro-Social Justice",
  "Republicans are Pro-Healthcare",
  "Republicans are Pro-Advocacy",
  "Republicans are Pro-Life",
  "Republicans are Pro-Economy",
  "Republicans are Pro-Business",
  "Republicans are Pro-Gun",
  "Republicans are Pro-Capitalism",
  "Republicans are Pro-Tariffs",
  "Republicans are Pro-Security",
  "Republicans are Pro-Deportation",
  "Republicans are Pro-Control",
  "Democrats are Pro-Life",
  "Democrats are Pro-Economy",
  "Democrats are Pro-Business",
  "Democrats are Pro-Gun",
  "Democrats are Pro-Capitalism",
  "Democrats are Pro-Tariffs",
  "Democrats are Pro-Security",
  "Democrats are Pro-Deportation",
  "Democrats are Pro-Control"
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
function sampleN(arr, n, rng = Math.random) {
  return shuffle(arr, rng).slice(0, n);
}
function partyOf(text) {
  return text.startsWith("Democrats") ? "D" : "R";
}
function counterpartToDem(stmt) { return stmt.replace(/^Republicans\b/, "Democrats"); }
function counterpartToRep(stmt) { return stmt.replace(/^Democrats\b/, "Republicans"); }
function asTrialObj(text, { contentType, exploratory = false } = {}) {
  const party = partyOf(text);
  return { text, contentType, party, exploratory };
}

// ---------------- Coalitional selection as requested ----------------
const master = window.politicalCharacterizations;
const masterSet = new Set(master);

// Pools (fixed indices)
const repTypicalPool = master.slice(0, 10);   // 0..9
const demTypicalPool = master.slice(10, 21);  // 10..20 inclusive

// Randomly select 9 typical from each party pool
const repTypicalSelected = sampleN(repTypicalPool, 9);
const demTypicalSelected = sampleN(demTypicalPool, 9);

// Cross-party atypical counterparts (verify exist)
const demCounterpartsFromRep = repTypicalSelected
  .map(counterpartToDem)
  .filter(s => masterSet.has(s));
const repCounterpartsFromDem = demTypicalSelected
  .map(counterpartToRep)
  .filter(s => masterSet.has(s));

// Full confirmatory coalitional texts per party (18 each)
const coalitionalRepAll = [...repTypicalSelected, ...repCounterpartsFromDem];
const coalitionalDemAll = [...demTypicalSelected, ...demCounterpartsFromRep];

// ---- NEW: sample down to 16 per party (total 32 coalitional) ----
const coalitionalRepTexts = sampleN(coalitionalRepAll, 16);
const coalitionalDemTexts = sampleN(coalitionalDemAll, 16);

// Convert to trials
window.coalitionalRep = coalitionalRepTexts.map(t =>
  asTrialObj(t, { contentType: "coalitional", exploratory: false })
);
window.coalitionalDem = coalitionalDemTexts.map(t =>
  asTrialObj(t, { contentType: "coalitional", exploratory: false })
);

// ---------------- Exploratory pairs (choose ONE pair) ----------------
const exploratoryPairs = [
  ["Democrats are Asian",  "Republicans are Asian"],
  ["Democrats are Jewish", "Republicans are Jewish"],
  ["Democrats are Muslim", "Republicans are Muslim"]
];
const chosenPair = sampleN(exploratoryPairs, 1)[0];
window.exploratoryChosen = chosenPair.map(t =>
  asTrialObj(t, { contentType: "coalitional", exploratory: true })
);

// ---------------- Trait & Issue: sample to 32 each ----------------
const traitTexts = master.slice(48, 84);  // 36 items
const issueTexts = master.slice(84, 120); // 36 items

window.traitTrials = sampleN(traitTexts, 32).map(t =>
  asTrialObj(t, { contentType: "trait", exploratory: false })
);
window.issueTrials = sampleN(issueTexts, 32).map(t =>
  asTrialObj(t, { contentType: "issue", exploratory: false })
);

// ---------------- Mixed, constraint-respecting order ----------------
function buildMixedSequence(trials, {
  maxRunType = 2,
  maxRunParty = 2,
  banExploratoryAtStart = 2,
  maxExploratoryRun = 2,
  maxTries = 500,
  rng = Math.random
} = {}) {

  const isOK = (arr) => {
    let runType = 0, runParty = 0, lastType = null, lastParty = null, runExpl = 0;
    for (let i = 0; i < arr.length; i++) {
      const t = arr[i];
      // content-type runs
      if (t.contentType === lastType) runType++; else { runType = 1; lastType = t.contentType; }
      if (runType > maxRunType) return false;
      // party runs
      if (t.party === lastParty) runParty++; else { runParty = 1; lastParty = t.party; }
      if (runParty > maxRunParty) return false;
      // exploratory placement
      if (i < banExploratoryAtStart && t.exploratory) return false;
      runExpl = t.exploratory ? runExpl + 1 : 0;
      if (runExpl > maxExploratoryRun) return false;
    }
    return true;
  };

  // Try pure shuffle a bunch of times
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const candidate = shuffle(trials, rng);
    if (isOK(candidate)) return candidate;
  }

  // Greedy repair
  const poolsByType = {
    coalitional: shuffle(trials.filter(t => t.contentType === "coalitional"), rng),
    trait:       shuffle(trials.filter(t => t.contentType === "trait"), rng),
    issue:       shuffle(trials.filter(t => t.contentType === "issue"), rng)
  };
  const order = [];
  let lastType = null, runType = 0, lastParty = null, runParty = 0, runExpl = 0;

  function popCandidate() {
    const keys = Object.keys(poolsByType).sort((a,b)=>poolsByType[b].length - poolsByType[a].length);
    for (const k of keys) {
      const pool = poolsByType[k];
      for (let i = 0; i < pool.length; i++) {
        const t = pool[i];
        const violatesType = (k === lastType && runType >= maxRunType);
        const violatesParty = (t.party === lastParty && runParty >= maxRunParty);
        const violatesExpl = ((order.length < banExploratoryAtStart && t.exploratory) ||
                              (t.exploratory && runExpl >= maxExploratoryRun));
        if (!violatesType && !violatesParty && !violatesExpl) {
          pool.splice(i,1);
          return t;
        }
      }
    }
    const fallbackKey = keys.find(k => poolsByType[k].length > 0);
    if (!fallbackKey) return null;
    return poolsByType[fallbackKey].shift();
  }

  while (true) {
    const next = popCandidate();
    if (!next) break;
    order.push(next);
    if (next.contentType === lastType) runType++; else { lastType = next.contentType; runType = 1; }
    if (next.party === lastParty) runParty++; else { lastParty = next.party; runParty = 1; }
    runExpl = next.exploratory ? runExpl + 1 : 0;
  }

  if (order.length !== trials.length) {
    const remaining = trials.filter(t => !order.includes(t));
    return buildMixedSequence(order.concat(remaining), { maxTries: 200, rng });
  }
  if (!isOK(order)) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const candidate = shuffle(order, rng);
      if (isOK(candidate)) return candidate;
    }
    console.warn("Constraints not perfectly satisfied; returning best-effort mixed order.");
  }
  return order;
}

// ---------------- Assemble final sequence ----------------
// Exactly: 32 coalitional (16 Rep + 16 Dem), 32 trait, 32 issue, and ONE exploratory pair (2 items)
const coalitionalConfirmatory = [].concat(window.coalitionalRep, window.coalitionalDem);
const allMainTrials = [].concat(
  coalitionalConfirmatory,     // 32
  window.traitTrials,          // 32
  window.issueTrials,          // 32
  window.exploratoryChosen     // 2
);

// Mixed order with constraints
window.mainTaskTrials = buildMixedSequence(allMainTrials, {
  maxRunType: 2,
  maxRunParty: 2,
  banExploratoryAtStart: 2,
  maxExploratoryRun: 2
});

// ---- Optional sanity logs (comment out in production) ----
if (window.coalitionalRep.length !== 16) console.warn("coalitionalRep length:", window.coalitionalRep.length);
if (window.coalitionalDem.length !== 16) console.warn("coalitionalDem length:", window.coalitionalDem.length);
if (window.traitTrials.length !== 32) console.warn("traitTrials length:", window.traitTrials.length);
if (window.issueTrials.length !== 32) console.warn("issueTrials length:", window.issueTrials.length);
if (window.exploratoryChosen.length !== 2) console.warn("exploratoryChosen length:", window.exploratoryChosen.length);
if (window.mainTaskTrials.length !== (32 + 32 + 32 + 2)) {
  console.warn("mainTaskTrials length:", window.mainTaskTrials.length);
}
