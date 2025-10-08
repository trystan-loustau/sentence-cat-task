// --- experiment.js --- //

// QUICK RUNTIME GUARDS (so we don't fail silently)
function assert(condition, message) {
  if (!condition) {
    // Render a visible error into the page as well as throwing, so you don’t just see a blank screen.
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

// Verify plugins (global names depend on how you included them)
// If you included the UMD bundles (script tags), these globals should exist:
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
    pages: function () {
      // introduction_page should be a string of HTML (from stimuli.js)
      return [introduction_page];
    },
    allow_keys: false,
    show_clickable_nav: true,
    allow_backward: true,
    show_page_number: true,
    data: {
      trial_id: "cool_instructions",
      data_of_interest_name: "wow! i'm some data!"
    }
  };

  // ---------------------------
  // Political Characterizations
  // ---------------------------
  // --- Add a 1-second intertrial interval --- //
const itiTrial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '',
  choices: "NO_KEYS",
  trial_duration: 150, // 
  data: { trial_id: "iti" }
};

function formatSentence(sentence) {
  const match = sentence.match(/\s+(are|have)\s+/i);

  if (match) {
    const connector = match[1]; // "are" or "have"
    const parts = sentence.split(new RegExp(`\\s+${connector}\\s+`, 'i'));

    if (parts.length === 2) {
      return `
        <div class="sentence-fixed">
          <span class="fixed-first"><b>${parts[0]}</b></span>
          <span class="connector">&nbsp;&nbsp;${connector}&nbsp;&nbsp;</span>
          <span class="variable-part"><b>${parts[1]}</b></span>
        </div>
      `;
    }
  }

  // fallback if no connector found
  return `<div class="sentence-fixed"><b>${sentence}</b></div>`;
}


// POLITICAL CHARACTERIZATIONS TRIAL (keyboard response, prompt fixed at top)
const politicalCharacterizationProcedure = {
  timeline: [
    itiTrial,  // <-- add this before each real stimulus
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function () {
        const sentence = jsPsych.timelineVariable('sentence');
        return `
          <div class="exp-wrap">
            <div class="prompt-top">Is the following statement <b>True</b> or <b>False</b>?</div>
            <div class="stimulus-centered">${formatSentence(sentence)}</div>
            <div class="key-reminder">
              <div class="key-col left">
                <div class="key-label">False</div>
                <div class="key-key">F</div>
              </div>
              <div class="key-col right">
                <div class="key-label">True</div>
                <div class="key-key">J</div>
              </div>
            </div>
          </div>
        `;
      },
      choices: ['f', 'j'],
      response_ends_trial: true,
      data: { stimulus: jsPsych.timelineVariable('sentence') },
      on_finish: function (data) {
        data.response_meaning = data.response === 'j' ? 'True' : 'False';
      }
    }
  ],
  timeline_variables: politicalCharacterizations.map(sentence => ({ sentence })),
  randomize_order: false
};

  // ---------------------------
  // Build & run
  // ---------------------------
  const experiment = [];
  experiment.push(coolInstructions, politicalCharacterizationProcedure);
  jsPsych.run(experiment);
}
