// --- experiment.js --- //

// initialize jsPsych
const jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.displayData()
    }
})

// Define your trials below, using stimuli that you have already defined. You do not
// need to import anything because these files will be combine into one big file (index.html)
// when you run the experiment

const coolInstructions = {
    type: jsPsychInstructions, // this is the type of trial (plug-in), which determines what jsPsych does
    pages: function() { // Instructions, like here, just shows HTML!
        let pages = []

        pages.push(
            introduction_page, // defined in stimuli.js
        )

        return pages
    },
    allow_keys: false, // for each kind of trial (plug-in), there are different parameters you can set
    show_clickable_nav: true,
    allow_backward: true, // for instance, this will show the "previous" button (tho there is no prev page)
    show_page_number: true,
    data: {
        trial_id: "cool_instructions", // add any metadata you want to collect here
        data_of_interest_name: "wow! i'm some data!"
    }
}

// POLITICAL CHARACTERIZATIONS TRIAL (keyboard + top prompt, using timeline_variables)
const politicalCharacterizationProcedure = {
  timeline: [{
    type: jsPsychHtmlKeyboardResponse,

    // Render prompt + sentence + fixed left/right key hints (as you have)
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

    // IMPORTANT: let us handle the key ourselves
    choices: jsPsych.NO_KEYS,

    // Data you want to store regardless
    data: function () {
      return { stimulus: jsPsych.timelineVariable('sentence') };
    },

    // Add a keyboard listener; highlight and delay before advancing
    on_load: function () {
      const sentence = jsPsych.timelineVariable('sentence');
      const left  = document.querySelector('.key-col.left');
      const right = document.querySelector('.key-col.right');
      let responded = false;

      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: function (info) {
          if (responded) return;
          responded = true;

          const key = (info.key || '').toLowerCase();
          if (key === 'f' && left)  left.classList.add('highlight');
          if (key === 'j' && right) right.classList.add('highlight');

          // after 1200ms, end the trial and save the response
          setTimeout(function () {
            jsPsych.finishTrial({
              stimulus: sentence,
              response: key,
              response_meaning: key === 'j' ? 'True' : 'False',
              rt: info.rt
            });
          }, 1200); // adjust: 1000–2000ms
        },
        valid_responses: ['f', 'j'],
        persist: false
      });
    }
  }],
  timeline_variables: politicalCharacterizations.map(sentence => ({ sentence })),
  randomize_order: false
};

// Build & run
var experiment = [];
experiment.push(
  coolInstructions,
  politicalCharacterizationProcedure
);
jsPsych.run(experiment);
