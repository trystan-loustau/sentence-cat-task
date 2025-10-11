// ================================
// experiment.js (refined, full)
// ================================

// --------- small helpers (TSV + POST back to Qualtrics) ---------
function toTSV(rows) {
  // Tab-Separated; remove tabs/newlines inside cells.
  return rows.map(r =>
    r.map(v => (v ?? '').toString().replace(/\t/g, ' ').replace(/\r?\n/g, ' '))
     .join('\t')
  ).join('\n');
}
function chunkString(str, size) {
  const out = [];
  for (let i = 0; i < str.length; i += size) out.push(str.slice(i, i + size));
  return out;
}
function postToQualtrics(url, fields) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  for (const [k, v] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = v == null ? '' : String(v);
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

// -------------------------------
// Basic sanity checks
// -------------------------------
function assert(condition, message) {
  if (!condition) {
    const el = document.createElement('pre');
    el.style.whiteSpace = 'pre-wrap';
    el.style.padding = '16px';
    el.style.border = '1px solid #ccc';
    el.style.maxWidth = '900px';
    el.style.margin = '24px auto';
    el.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    el.textContent = `jsPsych startup error:\n${message}`;
    document.body.appendChild(el);
    throw new Error(message);
  }
}
assert(typeof initJsPsych === 'function', 'initJsPsych not found. Is jspsych.js loaded before experiment.js?');
assert(typeof window.jsPsychInstructions !== 'undefined', 'jsPsychInstructions not found. Include @jspsych/plugin-instructions.js.');
assert(typeof window.jsPsychHtmlKeyboardResponse !== 'undefined', 'jsPsychHtmlKeyboardResponse not found. Include @jspsych/plugin-html-keyboard-response.js.');

// -------------------------------
// Qualtrics redirect plumbing
// -------------------------------
const qp = new URLSearchParams(location.search);
const sid = qp.get("sid") || ("localtest-" + Math.random().toString(36).slice(2));
const returnURL = qp.get("returnURL"); // optional if launched directly

// Mount into #jspsych-target if present (Qualtrics or your page), else <body>
const DISPLAY_EL = document.getElementById('jspsych-target') || document.body;

// -------------------------------
// Initialize jsPsych (single init)
// -------------------------------
const jsPsych = initJsPsych({
  display_element: DISPLAY_EL,
  on_finish: function () {
    // ---- build per-trial table (practice + main) ----
    const header = ['sid','block','idx','sentence','resp','meaning','rt','correct'];
    const rows = [header];

    // practice rows
    const pracVals = jsPsych.data.get().filter({ trial_id: 'practice' }).values();
    pracVals.forEach((t, i) => {
      rows.push([
        sid,
        'practice',
        i + 1,
        t.sentence ?? '',
        (t.response ?? '').toString(),
        t.response === 'j' ? 'True' : (t.response === 'f' ? 'False' : ''),
        t.rt ?? '',
        Number(t.correct) === 1 ? 1 : 0
      ]);
    });

    // main rows (NB: we still export only the legacy columns for Qualtrics)
    const mainVals = jsPsych.data.get().filter({ trial_id: 'political_characterization' }).values();
    mainVals.forEach((t, i) => {
      rows.push([
        sid,
        'main',
        i + 1,
        t.sentence ?? '',                               // stored below as the displayed text
        (t.response ?? '').toString(),
        t.response === 'j' ? 'True' : (t.response === 'f' ? 'False' : ''),
        t.rt ?? '',
        '' // no correctness in main
      ]);
    });

    const tsv = toTSV(rows);

    // ---- summaries (optional) ----
    const acc_practice = pracVals.length
      ? pracVals.reduce((s, t) => s + (Number(t.correct) === 1 ? 1 : 0), 0) / pracVals.length
      : 0;
    const n_main = mainVals.length;
    const rt_mean_main = n_main
      ? Math.round(mainVals.reduce((s, t) => s + (t.rt ?? 0), 0) / n_main)
      : '';

    if (returnURL) {
      // Chunk TSV into Embedded Data fields
      const chunks = chunkString(tsv, 1800); // conservative size
      const payload = {
        sid,
        acc_practice: acc_practice.toFixed(3),
        n_main_trials: String(n_main),
        rt_mean_main: String(rt_mean_main),
        tformat: 'tsv-v1',
        tchunks: String(chunks.length)
      };
      chunks.forEach((c, i) => { payload['tchunk' + (i + 1)] = c; });

      postToQualtrics(decodeURIComponent(returnURL), payload);
    } else {
      // Direct-link fallback (show table for debugging)
      jsPsych.data.displayData();
      console.log('[tsv]', tsv);
    }
  }
});

// ---- Practice gating state (top-level, not inside on_finish) ----
let practiceAttempts = 0;   // number of failed full practice rounds so far
let passedPractice = false; // set to true once accuracy reaches 100%

// Tag each row with participant/session info
jsPsych.data.addProperties({
  sid: sid,
  session_start: new Date().toISOString()
});

// -------------------------------
// Stimuli presence checks
// -------------------------------
const startupIssues = [];
if (typeof window.introduction_page === 'undefined') {
  startupIssues.push('introduction_page is undefined (expected from stimuli.js).');
}
if (typeof window.mainTaskTrials === 'undefined') {
  startupIssues.push('mainTaskTrials is undefined (expected from stimuli.js).');
} else if (!Array.isArray(window.mainTaskTrials)) {
  startupIssues.push('mainTaskTrials is not an array.');
} else if (window.mainTaskTrials.length === 0) {
  startupIssues.push('mainTaskTrials is an empty array.');
}

// If misconfigured, show diagnostic and stop
if (startupIssues.length > 0) {
  const diag = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus:
      `<div class="exp-wrap">
         <h2>Experiment configuration problem</h2>
         <p>Fix these in <code>stimuli.js</code> (or script order) and reload.</p>
         <ul>${startupIssues.map(s => `<li>${s}</li>`).join('')}</ul>
         <p>Press any key to view the (empty) data table.</p>
       </div>`
  };
  jsPsych.run([diag]);
} else {

  // ---------------------------
  // Utilities
  // ---------------------------
  function advanceOnEnter(e) {
    if (e.key === 'Enter') jsPsych.finishTrial();
  }

  // Split sentence around "are"/"have" and bold the parts
  function formatSentence(sentence) {
    const match = sentence.match(/\s+(are|have)\s+/i);
    if (match) {
      const connector = match[1];
      const parts = sentence.split(new RegExp(`\\s+${connector}\\s+`, 'i'));
      if (parts.length === 2) {
        return `
          <div class="sentence-fixed">
            <span class="fixed-first"><b>${parts[0]}</b></span>
            <span class="connector">${connector}</span>
            <span class="variable-part"><b>${parts[1]}</b></span>
          </div>
        `;
      }
    }
    // Fallback if no connector found
    return `<div class="sentence-fixed"><b>${sentence}</b></div>`;
  }

  // ---------------------------
  // Instructions (Enter-only)
  // ---------------------------
  const coolInstructions = {
    type: jsPsychInstructions,
    pages: () => [introduction_page],
    show_clickable_nav: false,
    allow_backward: false,
    data: { trial_id: "cool_instructions" },
    on_load: function () {
      const target =
        document.querySelector('#jspsych-content .exp-wrap') ||
        document.querySelector('#jspsych-content') ||
        jsPsych.getDisplayElement();

      const hint = document.createElement('div');
      hint.className = 'enter-hint';
      hint.textContent = 'Press Enter to continue';
      target.appendChild(hint);

      document.addEventListener('keydown', advanceOnEnter);
    },
    on_finish: function () {
      document.removeEventListener('keydown', advanceOnEnter);
      // Inject persistent prompt (no keys here; trials show the keys)
      if (!document.getElementById('fixed-ui')) {
        const ui = document.createElement('div');
        ui.id = 'fixed-ui';
        ui.innerHTML = `
          <div class="prompt-top">Is the following statement <b>True</b> or <b>False</b>?</div>
        `;
        document.body.appendChild(ui);
      }
    }
  };

  // ---------------------------
  // ITI (blank sentence, keys shown)
  // ---------------------------
  const itiTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => `
      <div class="exp-wrap">
        <div class="stimulus-centered" aria-hidden="true">&nbsp;</div>
        <div class="key-reminder">
          <div class="key-col left">
            <div class="key-label">False</div>
            <div class="key-key">Press 'F'</div>
          </div>
          <div class="key-col right">
            <div class="key-label">True</div>
            <div class="key-key">Press 'J'</div>
          </div>
        </div>
      </div>
    `,
    choices: "NO_KEYS",
    trial_duration: 800, // keep fixed or jitter in stimuli.js if you prefer
    data: { trial_id: "iti" }
  };

  // ---------------------------
  // Practice items (8th-grade easy)
  // ---------------------------
  const practiceStimuli = [
    { sentence: "Birds are animals", truth: true },
    { sentence: "Bananas are blue", truth: false },
    { sentence: "Cats are reptiles", truth: false },
    { sentence: "Triangles have three sides", truth: true },
    { sentence: "Cars have wings", truth: false },
    { sentence: "Books have pages", truth: true },
    { sentence: "Apples are vegetables", truth: false },
    { sentence: "Trees have leaves", truth: true }
  ];

  const practiceProcedure = {
    timeline: [
      itiTrial,
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function () {
          const s = jsPsych.timelineVariable('sentence');
          return `
            <div class="exp-wrap">
              <div class="stimulus-centered practice-shift">${formatSentence(s)}</div>
              <div class="key-reminder">
                <div class="key-col left">
                  <div class="key-label">False</div>
                  <div class="key-key">Press 'F'</div>
                </div>
                <div class="key-col right">
                  <div class="key-label">True</div>
                  <div class="key-key">Press 'J'</div>
                </div>
              </div>
            </div>`;
        },
        choices: ['f','j'],
        response_ends_trial: true,
        data: {
          trial_id: 'practice',
          sentence: jsPsych.timelineVariable('sentence'),
          truth: jsPsych.timelineVariable('truth')
        },
        on_finish: function (d) {
          const r = (d.response ?? '').toString().toLowerCase();
          const correctKey = d.truth ? 'j' : 'f';
          d.correct = (r === correctKey) ? 1 : 0;
        }
      },
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function () {
          const last = jsPsych.data.get().last(1).values()[0];
          const msg = last.correct ? 'Correct!' : 'Incorrect';
          return `
            <div class="exp-wrap">
              <div class="stimulus-centered" style="font-weight:700;">${msg}</div>
            </div>`;
        },
        choices: "NO_KEYS",
        trial_duration: 700,
        data: { trial_id: 'practice_feedback' }
      }
    ],
    timeline_variables: practiceStimuli,
    randomize_order: true
  };

  // Helper: last pass practice accuracy
  function lastPracticeAccuracy() {
    const n = practiceStimuli.length;
    const trials = jsPsych.data.get().filter({ trial_id: 'practice' }).last(n).values();
    if (!trials.length) return 0;
    const sum = trials.reduce((s, t) => s + (Number(t.correct) === 1 ? 1 : 0), 0);
    return sum / trials.length;
  }

  // One adaptive gate screen (Enter-only). Hides the prompt.
 // One adaptive gate screen (Enter-only). Hides the prompt.
// One adaptive gate screen (Enter-only). Hides the prompt.
const practiceGateScreen = {
  type: jsPsychHtmlKeyboardResponse,
  choices: "NO_KEYS",
  stimulus: function () {
    const acc = lastPracticeAccuracy();
    const perfect = acc >= 0.999;

    // Show this warning only after the first failure (before the final attempt)
    const warning = (!perfect && practiceAttempts === 0)
      ? `<div class="practice-warning" style="margin-top:12px;">
           <b>You will have ONE MORE chance to complete the practice phase. If you do not successfully complete the practice phase, you will not be allowed to continue with the study.</b>
         </div>`
      : '';

    const successReminder = perfect
      ? `<div class="practice-reminder" style="margin-top:12px;">
           Remember, for the next set of statements, there are no "correct" or "incorrect" answers.
           We are interested in how <b>YOU</b> would personally classify these statements as <b>True</b> or <b>False</b>.
         </div>`
      : '';

    const msg = perfect
      ? `Great job — you answered all practice items correctly.<br/><br/>
         <b>Press Enter to begin the main task.</b>${successReminder}`
      : `You got ${(acc*100).toFixed(0)}% correct.<br/>
         Please reach <b>100%</b> to continue.<br/><br/>
         <b>Press Enter to practice again.</b>${warning}`;

    return `
      <div class="exp-wrap">
        <div class="stimulus-centered">${msg}</div>
      </div>
    `;
  },
  on_start: function () {
    document.body.classList.add('hide-prompt'); // CSS hides #fixed-ui
  },
  on_load: function () {
    window.__gateEnterHandler = function (e) {
      if (e.key === 'Enter') {
        jsPsych.finishTrial();
      }
    };
    document.addEventListener('keydown', window.__gateEnterHandler);
  },
  on_finish: function () {
    document.body.classList.remove('hide-prompt');
    document.removeEventListener('keydown', window.__gateEnterHandler);
    delete window.__gateEnterHandler;
  },
  data: { trial_id: 'practice_gate' }
};



  // Allow only one redo. If still not perfect after two rounds, stop practice.
  const practiceLoop = {
    timeline: [practiceProcedure, practiceGateScreen],
    loop_function: function () {
      const acc = lastPracticeAccuracy();
      if (acc >= 0.999) {
        passedPractice = true;
        return false; // stop looping: passed
      }
      // Not perfect — count this completed round as a failed attempt
      practiceAttempts += 1;
      // Allow exactly one redo (run again only if this was the first failure)
      return practiceAttempts < 2;
    }
  };

  // Fail-out screen if practice not passed after two attempts
  const practiceFailScreen = {
    type: jsPsychHtmlKeyboardResponse,
    choices: "NO_KEYS",
    stimulus: `
      <div class="exp-wrap">
        <div class="stimulus-centered">
          Unfortunately, you did not pass the practice phase after two attempts.
          <br/><br/>
          As a result, you won’t be able to continue with the rest of the study.
        </div>
      </div>
    `,
    trial_duration: 5000,  // or use choices: "ALL_KEYS" to require a keypress
    data: { trial_id: 'practice_fail' },
    on_start: function () { document.body.classList.add('hide-prompt'); },
    on_finish: function () { document.body.classList.remove('hide-prompt'); }
  };

  // Only show the fail screen if practice was NOT passed.
  const maybeFailOut = {
    timeline: [practiceFailScreen],
    conditional_function: function () {
      return !passedPractice;
    }
  };

  // ---------------------------
  // Main task (uses window.mainTaskTrials)
// ---------------------------
  // Build timeline variables from prepared trial objects (no reshuffle here)
  const mainTimelineVars = window.mainTaskTrials.map((t, i) => ({
    index: i,
    sentence: t.text,              // keep legacy field name for export/formatting
    contentType: t.contentType,    // "coalitional" | "trait" | "issue"
    party: t.party,                // "D" | "R"
    exploratory: !!t.exploratory   // true | false
  }));

  const politicalCharacterizationProcedure = {
    timeline: [
      itiTrial,
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function () {
          const tv = jsPsych.timelineVariable('sentence');
          return `
            <div class="exp-wrap">
              <div class="stimulus-centered">${formatSentence(tv)}</div>
              <div class="key-reminder">
                <div class="key-col left">
                  <div class="key-label">False</div>
                  <div class="key-key">Press 'F'</div>
                </div>
                <div class="key-col right">
                  <div class="key-label">True</div>
                  <div class="key-key">Press 'J'</div>
                </div>
              </div>
            </div>`;
        },
        choices: ['f','j'],
        response_ends_trial: true,
        data: {
          trial_id: 'political_characterization',
          sentence: jsPsych.timelineVariable('sentence'),
          contentType: jsPsych.timelineVariable('contentType'),
          party: jsPsych.timelineVariable('party'),
          exploratory: jsPsych.timelineVariable('exploratory'),
          index: jsPsych.timelineVariable('index')
        },
        on_finish: function (d) {
          const r = (d.response ?? '').toString().toLowerCase();
          d.response_meaning = (r === 'j') ? 'True' : (r === 'f') ? 'False' : null;
          // RT is in d.rt (ms)
        }
      }
    ],
    timeline_variables: mainTimelineVars,
    randomize_order: false // order already mixed with constraints in stimuli.js
  };

  // Only run the main task if practice was passed
  const maybeMain = {
    timeline: [politicalCharacterizationProcedure],
    conditional_function: function () {
      return passedPractice;
    }
  };

  // ---------------------------
  // Build & run
  // ---------------------------
  const experiment = [];
  experiment.push(
    coolInstructions,
    practiceLoop,  // runs once; may repeat once if first attempt failed
    maybeFailOut,  // shown only if practice not passed after up to 2 tries
    maybeMain      // runs only if practice passed
  );
  jsPsych.run(experiment);
}
// ================================
// end experiment.js
// ================================
