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

// ... later when building the experiment:
var experiment = [];
experiment.push(
  coolInstructions,
  politicalCharacterizationProcedure
);

jsPsych.run(experiment);

// Create the experiment variable -- you need this to run the experiment!
var experiment = [];

// add your trials to the experiment variable in the order you want them to appear
experiment.push(
    coolInstructions,
    politicalCharacterizationTrial
)

// start the experiment
jsPsych.run(experiment)
