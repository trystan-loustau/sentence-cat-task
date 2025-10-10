// ================================
// experiment.js (refined)
// ================================

// -------------------------------
// Sanity checks (before init)
// -------------------------------
function assert(condition, message) {
  if (!condition) {
    const el = document.createElement('pre');
    el.style.whiteSpace = 'pre-wrap';
    el.style.padding = '16px';
    el.style.border = '1px solid #ccc';
    el.style.maxWidth = '900px';
    el.style.margin = '24px auto';
    el.style.fontFamily =
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    el.textContent = `jsPsych startup error:\n${message}`;
    document.body.appendChild(el);
    throw new Error(message);
  }
}

// Verify jsPsych core + key plugins are loaded
assert(typeof initJsPsych === 'function', 'initJsPsych not found. Is jspsych.js loaded before experiment.js?');
assert(typeof window.jsPsychInstructions !== 'undefined', 'jsPsychInstructions not found. Include @jspsych/plugin-instructions.js.');
assert(typeof window.jsPsychHtmlKeyboardResponse !== 'undefined', 'jsPsychHtmlKeyboardResponse not found. Include @jspsych/plugin-html-keyboard-response.js.');

// -------------------------------
// Qualtrics redirect plumbing
// -------------------------------
const qp = new URLSearchParams(location.search);
const sid = qp.get('sid') || 'localtest-' + Math.random().toString(36).slice(2);
const returnURL = qp.get('returnURL'); // Survey B URL (if launched from Survey A)
console.log('[task] sid =', sid, 'returnURL =', returnURL);

// If you mount into a specific div, use it; otherwise body is fine
const DISPLAY_EL = document.getElementById('jspsych-target') || document.body;

// -------------------------------
// Initialize jsPsych (single init)
// -------------------------------
const jsPsych = initJsPsych({
  display_element: DISPLAY_EL,
  on_finish: function () {
    // Summaries to pass back to Qualtrics (Survey B)
    const prac = jsPsych.data.get().filter({ trial_id: 'practice' });
    const main = jsPsych.data.get().filter({ trial_id: 'political_characterization' });

    const acc_practice = prac.count() ? prac.select('correct').mean() : 0;
    const n_main = main.count();
    const rt_mean_main = n_main ? main.select('rt').mean() : null;

    if (returnURL) {
      const qs = new URLSearchParams({
        sid: sid,
        acc_practice: acc_practice.toFixed(3),
        n_main_trials: String(n_main),
        rt_mean_main: rt_mean_main != null ? String(Math.round(rt_mean_main)) : ''
      });
      window.location.href = decodeURIComponent(returnURL) + '?' + qs.toString();
    } else {
      // Local testing fallback
      jsPsych.data.displayData();
    }
  }
});

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
if (typeof window.politicalCharacterizations === 'undefined') {
  startupIssues.push('politicalCharacterizations is undefined (expected from stimuli.js).');
} else if (!Array.isArray(window.politicalCharacterizations)) {
  startupIssues.push('politicalCharacterizations is not an array.');
} else if (window.politicalCharacterizations.length === 0) {
  startupIssues.push('politicalCharacterizations is an empty array.');
}

// If misconfigured, show diagnostic timeline and stop
if (startupIssues.length > 0) {
  const diag = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div class="exp-wrap">
      <h2>Experiment configuration problem</h2>
      <p>The following issue(s) were detected. Fix them in <code>stimuli.js</code> (or your script order) and reload.</p>
      <ul>${startupIssues.map((s) => `<li>${s}</li>`).join('')}</ul>
      <p><b>Tip:</b> Open the browser console for the exact error and stack trace.</p>
      <p>Press any key to view collected (empty) data and confirm jsPsych is working.</p>
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

  // Split sentence around "are"/"have" and bold the parts (spacing handled by CSS grid)
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
  // Practice items (8th-grade easy)
  // ---------------------------
  const practiceStimuli = [
    { sentence: 'Birds are animals', truth: true },
    { sentence: 'Bananas are blue', truth: false },
    { sentence: 'Cats are reptiles', truth: false },
    { sentence: 'Triangles have three sides', truth: true },
    { sentence: 'Cars have wings', truth: false },
    { sentence: 'Books have pages', truth: true },
    { sentence: 'Apples are vegetables', truth: false },
    { sentence: 'Trees have leaves', truth: true }
  ];

  // Compute accuracy for the last full practice pass
  function lastPracticeAccuracy() {
    const n = practiceStimuli.length;
    const trials = jsPsych.data.get().filter({ trial_id: 'practice' }).last(n).values();
    if (!trials.length) return 0;
    const sum = trials.reduce((s, t) => s + (Number(t.correct) === 1 ? 1 : 0), 0);
    return sum / trials.length;
  }

  // ---------------------------
  // Instructions (Enter-only)
  // ---------------------------
  const coolInstructions = {
    type: jsPsychInstructions,
    pages: () => [introduction_page],
    show_clickable_nav: false,
    allow_backward: false,
    data: { trial_id: 'cool_instructions' },
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
      // Inject a persistent prompt (no keys here; trial HTML shows keys)
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
    choices: 'NO_KEYS',
    trial_duration: 800,
    data: { trial_id: 'iti' }
  };

  // ---------------------------
  // Practice block (randomized)
  // ---------------------------
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
        choices: ['f', 'j'],
        response_ends_trial: true,
        data: {
          trial_id: 'practice',
          sentence: jsPsych.timelineVariable('sentence'),
          truth: jsPsych.timelineVariable('truth')
        },
        on_finish: function (d) {
          const r = (d.response ?? '').toString().toLowerCase();
          const correctKey = d.truth ? 'j' : 'f';
          d.correct = r === correctKey ? 1 : 0;
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
        choices: 'NO_KEYS',
        trial_duration: 700,
        data: { trial_id: 'practice_feedback' }
      }
    ],
    timeline_variables: practiceStimuli,
    randomize_order: true
  };

  // One adaptive gate screen (Enter-only). Hides the prompt.
  const practiceGateScreen = {
    type: jsPsychHtmlKeyboardResponse,
    choices: 'NO_KEYS', // disable plugin key handling; we add our own
    stimulus: function () {
      const acc = lastPracticeAccuracy();
      const perfect = acc >= 0.999; // float-safe "all correct"
      const msg = perfect
        ? `Great job — you answered all practice items correctly.<br/><br/>
           <b>Press Enter to begin the main task.</b>`
        : `You got ${(acc * 100).toFixed(0)}% correct.<br/>
           Please reach <b>100%</b> to continue.<br/><br/>
           <b>Press Enter to practice again.</b>`;
      return `
        <div class="exp-wrap">
          <div class="stimulus-centered">${msg}</div>
        </div>
      `;
    },
    on_start: function () {
      document.body.classList.add('hide-prompt'); // CSS should hide #fixed-ui
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

  // Repeat practice until perfect
  const practiceLoop = {
    timeline: [practiceProcedure, practiceGateScreen],
    loop_function: function () {
      const acc = lastPracticeAccuracy();
      return acc < 0.999; // true => repeat
    }
  };

  // ---------------------------
  // Main task (political items)
// ---------------------------
  const politicalCharacterizationProcedure = {
    timeline: [
      itiTrial,
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function () {
          const sentence = jsPsych.timelineVariable('sentence');
          return `
            <div class="exp-wrap">
              <div class="stimulus-centered">${formatSentence(sentence)}</div>
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
        choices: ['f', 'j'],
        response_ends_trial: true,
        data: {
          trial_id: 'political_characterization',
          stimulus: jsPsych.timelineVariable('sentence')
        },
        on_finish: function (d) {
          d.response_meaning = d.response === 'j' ? 'True' : d.response === 'f' ? 'False' : null;
        }
      }
    ],
    timeline_variables: politicalCharacterizations.map((sentence) => ({ sentence })),
    randomize_order: false
  };

  // ---------------------------
  // Build & run
  // ---------------------------
  const experiment = [];
  experiment.push(coolInstructions, practiceLoop, politicalCharacterizationProcedure);
  jsPsych.run(experiment);
}
// ================================
// end experiment.js
// ================================
