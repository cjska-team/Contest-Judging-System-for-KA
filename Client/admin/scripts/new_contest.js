/* The rubrics for this contest: */
var rubrics = {};

/* A div containing all of the options: */
var allOptions = document.querySelector("#options");
/* The current set of options: */
var currentOptions = [];
/* A default <div> representing an option: */
var defaultOption = document.createElement("button");
defaultOption.className = "btn btn-default";
/* The label for deleting options: */
var deleteOptionLabel = document.querySelector("#deleteOptionLabel");

function deleteOption(event) {
    /* This click event handler deletes an option when clicked. */
    /* Make sure the form doesn't redirect: */
    event.preventDefault();
    /* Remove the option from currentOptions and allOptions: */
    currentOptions.splice(parseInt(event.target.getAttribute("data-index")), 1);
    allOptions.removeChild(event.target);
    /* Hide deleteOptionLabel if there are no more options: */
    if (!currentOptions.length) deleteOptionLabel.style.display = "none";
}

/* When the user tries to add an option: */
document.querySelector("#addoption").addEventListener("click", function(event) {
    /* Make sure the form doesn't redirect. */
    event.preventDefault();
    /* Make sure there is a nonempty option name: */
    if (!document.forms.new_contest.option.value.length) {
        alert("Please enter a option name. Thanks!");
        return;
    }
    /* Make sure the array does not already have this option: */
    if (currentOptions.indexOf(document.forms.new_contest.option.value) != -1) {
        alert("You already entered this option into this rubric!");
        return;
    }
    /* Append a representation of the option into #options: */
    var curOption = defaultOption.cloneNode();
    curOption.textContent = document.forms.new_contest.option.value;
    /* Keep the index of where it is in currentOptions in a data- attribute: */
    curOption.setAttribute("data-index", currentOptions.length);
    allOptions.appendChild(curOption);
    curOption.addEventListener("click", deleteOption);
    /* Push the option into currentOptions. */
    currentOptions.push(document.forms.new_contest.option.value);
    /* Show deleteOptionLabel. */
    deleteOptionLabel.style.display = "block";
});

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
            break;
        case "keys":
            /* If there are no keys or only one, tell the user to add more. */
            if (currentOptions.length < 2) {
                alert("Make sure to have at least two options. Thanks!");
                return;
            }
            /* If everything's OK, make a new rubric in rubrics: */
            rubrics[jsonProp] = {
                keys: Object.create(currentOptions),
                min: 0,
                max: currentOptions.length-1
            };
            break;
    }
    /* Clear currentOptions and allOptions so the user can start over: */
    currentOptions = [];
    while (allOptions.childNodes.length) allOptions.removeChild(allOptions.childNodes[0]);
    /* Hide deleteOptionLabel: */
    deleteOptionLabel.style.display = "none";
});

/* When the user tries to submit a contest: */
document.querySelector("#submitcontest").addEventListener("click", function(event) {
    /* Make sure the form doesn't redirect. */
    event.preventDefault();
    /* From the front-end, we simply check if the contest ID is a number. From the back end, we'll check if it's an actual contest by Pamela. */
    if (isNaN(parseInt(document.forms.new_contest.program_id.value))) {
        alert("Please enter a valid program ID. Only numbers are valid program IDs. A program ID can be found by visiting the link of a contest and looking for a number within that link before the contest title. Thanks!");
        return;
    }
    
    /* Make sure that the user has added some rubrics: */
    var rubricsPresent = false;
    for (var k in rubrics) {
        rubricsPresent = true;
        break;
    }
    /* If there aren't rubrics, tell the user: */
    if (!rubricsPresent) alert("Please add some rubrics for your contest. Thanks!");
    
    /* If everything is OK, then alert to the user that they can't submit contests yet. */
    alert("You can't submit contests yet. Sorry!");
});