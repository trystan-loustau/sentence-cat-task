// --- experiment.js --- //

// initialize jsPsych
const jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData();
  }
});

// Instructions trial
const coolInstructions = {
  type: jsPsychInstructions,
  pages: function () {
    let pages = [];
    pages.push(introduction_page); // defined in stimuli.js
    return pages;
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

// POLITICAL CHARACTERIZATIONS TRIAL (keyboard response, prompt fixed at top)
const politicalCharacterizationProcedure = {
  timeline: [{
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
      const sentence = jsPsych.timelineVariable('sentence');
      return `
        <div class="exp-wrap">
          <div class="prompt-top">Is the following statement <b>True</b> or <b>False</b>?</div>
          <div class="stimulus-centered">${sentence}</div>
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
  }],
  timeline_variables: politicalCharacterizations.map(sentence => ({ sentence })),
  randomize_order: false
};

// Build and run experiment
var experiment = [];
experiment.push(
  coolInstructions,
  politicalCharacterizationProcedure
);
jsPsych.run(experiment);
