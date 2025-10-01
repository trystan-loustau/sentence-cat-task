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

const cool_instructions = {
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
    on_load: function() {
        document.getElementById("jspsych-content").style.margin = "50px auto" // tbh idk why this is here
    },
    data: {
        type_of_trial: "cool_instructions" // dict identifier for this trial in the data
    }
}

// Create the experiment variable -- you need this to run the experiment!
var experiment = [];

// add your trials to the experiment variable in the order you want them to appear
experiment.push(
    cool_instructions
)

// start the experiment
jsPsych.run(experiment)