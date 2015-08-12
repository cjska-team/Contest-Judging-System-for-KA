/* The rubrics for this contest: */
var rubrics = {};
/* A <div> containing all of the rubrics: */
var allRubrics = document.querySelector("#rubrics");
/* A default <div> representing a rubric: */
var defaultRubric = document.createElement("div");
defaultRubric.className = "rubric";
/* The label for deleting rubrics: */
var deleteRubricLabel = document.querySelector("#deleteRubricLabel");
/* The number of rubrics we have now: */
var numRubrics = 0;

/* A <div> containing all of the options: */
var allOptions = document.querySelector("#options");
/* The current set of options: */
var currentOptions = [];
/* A default <div> representing an option: */
var defaultOption = document.createElement("button");
defaultOption.className = "btn btn-default";
/* The label for deleting options: */
var deleteOptionLabel = document.querySelector("#deleteOptionLabel");
/* The span referencing deleteOptionLabel: */
var optionsExample = document.querySelector("#optionsExample");

function deleteOption(event) {
    /* This click event handler deletes an option when clicked. */
    /* Make sure the form doesn't redirect: */
    event.preventDefault();
    /* Remove the option from currentOptions and allOptions: */
    currentOptions.splice(currentOptions.indexOf(event.currentTarget.textContent), 1);
    allOptions.removeChild(event.currentTarget);
    /* Hide deleteOptionLabel and optionsExample if there are no more options: */
    if (!currentOptions.length) optionsExample.style.display = "none", deleteOptionLabel.style.display = "none";
}

function addOption(option) {
    /* This adds option as an option to the current rubric. */
    /* Get rid of leading and trailing whitespace: */
    while (/\s/.test(option[0])) option = option.substring(1, option.length);
    while (/\s/.test(option[option.length-1])) option = option.substring(0, option.length-1);
    /* Make sure the array does not already have this option: */
    if (currentOptions.indexOf(option) != -1) {
        alert("You already entered the "+option+" option into this rubric!");
        return;
    }
    /* Append a representation of the option into #options: */
    var curOption = defaultOption.cloneNode();
    curOption.textContent = option;
    allOptions.appendChild(curOption);
    /* Bind deleteOption to the click of curOption: */
    curOption.addEventListener("click", deleteOption);
    /* Push the option into currentOptions. */
    currentOptions.push(option);
    /* Show deleteOptionLabel and optionsExample. */
    optionsExample.style.display = "inline", deleteOptionLabel.style.display = "block";
}

/* Example options: */
var exampleOptions = ["Unknown", "Beginner", "Intermediate", "Advanced"];
/* Add all of the example options: */
for (var i = 0; i < exampleOptions.length; i++) addOption(exampleOptions[i]);

/* When the user tries to add an option: */
document.querySelector("#addoption").addEventListener("click", function(event) {
    /* Make sure the form doesn't redirect. */
    event.preventDefault();
    /* Make sure there is a nonempty option name: */
    if (!document.forms.new_contest.option.value.length) {
        alert("Please enter a option name. Thanks!");
        return;
    }
    /* Get multiple options by splitting on commas: */
    var newOptions = document.forms.new_contest.option.value.split(",");
    /* Add each option: */
    for (var i = 0; i < newOptions.length; i++) addOption(newOptions[i]);
    /* Clear the option textbox */
    document.forms.new_contest.option.value = "";
});

/* Use noUiSlider to create slider */
var slider = document.querySelector("#slider"), sliderLabel = document.querySelector("#sliderLabel");
noUiSlider.create(slider, {
    connect: "lower",
    start: 1,
    step: 1,
    range: {
        min: 1,
        max: 5
    }
});
/* When the slider value changes... */
slider.noUiSlider.on("update", function(values, handle) {
    /* Tell the value in sliderLabel: */
    sliderLabel.textContent = "Value: "+parseInt(values[handle]).toString();
});

function deleteRubric(event) {
    /* This click event handler deletes a rubric when clicked. */
    /* Remove the option from rubrics and allRubrics: */
    delete rubrics[event.currentTarget.id];
    allRubrics.removeChild(event.currentTarget);
    /* Decrement numRubrics and hide deleteRubricLabel if there are no more options: */
    numRubrics--;
    if (!numRubrics) deleteRubricLabel.style.display = "none";
}

/* When the user tries to add a rubric: */
document.querySelector("#addrubric").addEventListener("click", function(event) {
    /* Make sure the form doesn't redirect. */
    event.preventDefault();
    /* Make sure there is a nonempty rubric name: */
    if (!document.forms.new_contest.rubric_name.value.length) {
        alert("Please enter a rubric name. Thanks!");
        return;
    }
    
    /* Use this for the actual JSON property of the rubric so there's no whitespace in the property name. */
    var jsonProp = document.forms.new_contest.rubric_name.value.replace(/\s/, "_");
    /* Make sure that the user didn't already use this rubric name: */
    if (rubrics.hasOwnProperty(jsonProp)) {
        alert("Please don't reuse rubric names. You already used this rubric name, so why don't you make another one? Thanks!");
        return;
    }

    /* This will represent the rubric in the DOM: */
    var curRubric = defaultRubric.cloneNode();
    /* Add a heading for the rubric: */
    curRubric.appendChild(document.createTextNode(document.forms.new_contest.rubric_name.value+": "));
    /* Do different things for different types of rubrics: */
    switch (document.forms.new_contest.rubric_type.value) {
        case "minmax":
            /* If the minimum and maximum are not numbers, tell the user to make them numbers. */
            if (isNaN(parseInt(document.forms.new_contest.minimum.value)) || isNaN(parseInt(document.forms.new_contest.maximum.value))) {
                alert("Make sure you have numbers as your minimum and maximum. Thanks!");
                return;
            }
            /* If everything's OK, make a new rubric in rubrics: */
            rubrics[jsonProp] = {
                min: parseInt(document.forms.new_contest.minimum.value),
                max: parseInt(document.forms.new_contest.maximum.value)
            };
            /* Make sure that the minimum is less than the maximum: */
            if (rubrics[jsonProp].min >= rubrics[jsonProp].max) {
                alert("Please make the minimum less than the maximum. Thanks!");
                /* Delete this rubric if the minimum is not less than the maximum. */
                delete rubrics[jsonProp];
                return;
            }
            
            /* A <ul> element for minimum and maximum: */
            var minmaxList = document.createElement("ul");
            /* Add the minimum: */
            var minLi = document.createElement("li");
            minLi.textContent = "Minimum: "+rubrics[jsonProp].min;
            minmaxList.appendChild(minLi);
            /* Add the maximum: */
            var maxLi = document.createElement("li");
            maxLi.textContent = "Maximum: "+rubrics[jsonProp].max;
            minmaxList.appendChild(maxLi);
            /* Add the list to curRubric */
            curRubric.appendChild(minmaxList);
            break;
        case "keys":
            /* If there are no keys or only one, tell the user to add more. */
            if (currentOptions.length < 2) {
                alert("Make sure to have at least two options. Thanks!");
                return;
            }
            /* If everything's OK, make a new rubric in rubrics: */
            rubrics[jsonProp] = {
                keys: currentOptions.slice(0, currentOptions.length),
                min: 0,
                max: currentOptions.length-1
            };
            
            /* A <ul> element for all of the options: */
            var optionsList = document.createElement("ul");
            /* Append all options of this rubric into optionsList: */
            for (var i = 0; i < allOptions.childNodes.length; i++) {
                /* A <li> to represent this option: */
                var curOptionLi = document.createElement("li");
                curOptionLi.textContent = allOptions.childNodes[i].textContent;
                /* Add the current option into optionsList: */
                optionsList.appendChild(curOptionLi);
            }
            /* Add the list to curRubric */
            curRubric.appendChild(optionsList);
            break;
    }
    
    /* Increment numRubrics and show deleteRubricLabel: */
    numRubrics++;
    deleteRubricLabel.style.display = "block";
    /* Set the ID of curRubric so we can find it in rubrics later: */
    curRubric.id = jsonProp;
    /* Add the current rubric into allRubrics: */
    allRubrics.appendChild(curRubric);
    /* Bind deleteRubric to click of curRubric: */
    curRubric.addEventListener("click", deleteRubric);
    /* Clear currentOptions, allOptions, and document.forms.new_contest.rubric_name so the user can start over: */
    currentOptions = [];
    while (allOptions.childNodes.length) allOptions.removeChild(allOptions.childNodes[0]);
    document.forms.new_contest.rubric_name.value = "";
    /* Hide deleteOptionLabel and optionsExample: */
    optionsExample.style.display = "none", deleteOptionLabel.style.display = "none";
});

/* When the user tries to submit a contest: */
document.querySelector("#submitcontest").addEventListener("click", function(event) {
    /* Make sure the form doesn't redirect. */
    event.preventDefault();
    /* Get the program ID: */
    var programID;
    if (document.forms.new_contest.program_id.value.indexOf("/") === -1) {
        programID = (document.forms.new_contest.program_id.value);
    } else {
        programID = (document.forms.new_contest.program_id.value.split("/")[5]);
    }

    console.log(programID);
    /* From the front-end, we simply check if the program ID is a number. From the back end, we'll check if it's an actual contest by Pamela. */
    if (isNaN(parseInt(programID, 10))) {
        alert("Please enter a valid program ID. Only numbers are valid program IDs. A program ID can be found by visiting the link of a contest and looking for a number within that link before the contest title. Thanks!");
        return;
    }
    
    console.log(rubrics);

    /* If everything is OK, then alert to the user that they can't submit contests yet. */
    Contest_Judging_System.createContest(programID, rubrics, function(href) {
        alert("Contest created! Navigating to the contest page on KACJS.");
        window.location.assign(href);
    });
});