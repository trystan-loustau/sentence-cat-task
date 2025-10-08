// --- experiment.js --- //

// QUICK RUNTIME GUARDS (so we don't fail silently)
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

// Verify jsPsych core
assert(typeof initJsPsych === 'function', 'initJsPsych not found. Is jspsych.js loaded before experiment.js?');

// Verify plugins (UMD globals)
assert(typeof window.jsPsychInstructions !== 'undefined', 'jsPsychInstructions not found. Did you include @jspsych/plugin-instructions?');
assert(typeof window.jsPsychHtmlKeyboardResponse !== 'undefined', 'jsPsychHtmlKeyboardResponse not found. Did you include @jspsych/plugin-html-keyboard-response?');

// initialize jsPsych
const jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData();
  }
});

// Gather any startup issues about your external stimuli
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

// If there are issues, run a visible diagnostic timeline and stop
if (startupIssues.length > 0) {
  const diag = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus:
      `<div class="exp-wrap">
         <h2>Experiment configuration problem</h2>
         <p>The following issue(s) were detected. Fix them in <code>stimuli.js</code> (or your script order) and reload.</p>
         <ul>${startupIssues.map(s => `<li>${s}</li>`).join('')}</ul>
         <p><b>Tip:</b> Open the browser console for the exact error and stack trace.</p>
         <p>Press any key to view collected (empty) data and confirm jsPsych is working.</p>
       </div>`
  };
  jsPsych.run([diag]);
  // Don’t proceed to the real timeline
} else {

  // ---------------------------
  // Instructions
  // ---------------------------
const coolInstructions = {
  type: jsPsychInstructions,
  pages: function () { return [introduction_page]; },
  show_clickable_nav: false,
  allow_backward: false,
  data: { trial_id: "cool_instructions" },
  on_load: function () {
    // append the hint inside your intro wrapper if available, else to the root
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
    if (!document.getElementById('fixed-ui')) {
  const ui = document.createElement('div');
  ui.id = 'fixed-ui';
 // in coolInstructions.on_finish
ui.innerHTML = `
  <div class="prompt-top">Is the following statement <b>True</b> or <b>False</b>?</div>
`;
  document.body.appendChild(ui);
}
  }
};

function advanceOnEnter(e) {
  if (e.key === 'Enter') jsPsych.finishTrial();
}

  // ---------------------------
  // ITI (blank sentence, header persists)
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
  trial_duration: 800,
  data: { trial_id: "iti" }
};

  // ---------------------------
  // Sentence formatter
  // ---------------------------
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
    return `<div class="sentence-fixed"><b>${sentence}</b></div>`;
  }
// ---------------------------
// Practice stimuli (non-political)
// ---------------------------
// truth: true  → correct key is 'j' (True)
// truth: false → correct key is 'f' (False)
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

// Practice trial with feedback
// Practice trial with feedback
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
        const correctKey = d.truth ? 'j' : 'f';
        d.correct = (d.response === correctKey);
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
  randomize_order: true   // ⬅️ randomize practice
};
// Shown only when practice isn't perfect

// One screen that adapts message based on accuracy
const practiceGateScreen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function () {
    const n = practiceStimuli.length;
    const lastBlock = jsPsych.data.get().filter({ trial_id: 'practice' }).last(n);
    const acc = lastBlock.select('correct').mean() || 0;
    const perfect = acc === 1;

    const msg = perfect
      ? `Great job — you answered all practice items correctly.<br/><br/>
         Press any key to begin the <b>main practice</b>.`
      : `You got ${(acc*100).toFixed(0)}% correct.<br/>
         Please reach <b>100%</b> to continue.<br/><br/>
         Press any key to try the practice again.`;

    return `
      <div class="exp-wrap">
        <div class="stimulus-centered">${msg}</div>
      </div>
    `;
  },
  choices: "ALL_KEYS",
  data: { trial_id: 'practice_gate' }
};

  
// Repeat practice until perfect; the gate screen shows either "try again" or "begin main practice"
const practiceLoop = {
  timeline: [practiceProcedure, practiceGateScreen],
  loop_function: function(data) {
    const acc = data.filter({ trial_id: 'practice' }).select('correct').mean() || 0;
    return acc < 1; // true => repeat practice
  }
};



  // ---------------------------
  // Political Characterizations
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
      choices: ['f','j'],
      response_ends_trial: true,
      data: { trial_id:'political_characterization', stimulus: jsPsych.timelineVariable('sentence') },
      on_finish: function (d){
        d.response_meaning = d.response==='j'?'True':(d.response==='f'?'False':null);
      }
    }
  ],
  timeline_variables: politicalCharacterizations.map(sentence => ({ sentence })),
  randomize_order: false
};



  // ---------------------------
  // ---------------------------
// Build & run
// ---------------------------
const experiment = [];
experiment.push(
  coolInstructions,
  practiceLoop,        // repeats until 100%
  // practiceComplete  ← remove this; the gate screen already handles the “begin” message
  politicalCharacterizationProcedure
);
jsPsych.run(experiment);


} // <— closes the big else
