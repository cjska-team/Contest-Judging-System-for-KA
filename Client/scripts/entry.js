/* If it doesn't look like there's a contest ID in the URL, show an alert, and go back one page. */
if (window.location.search.indexOf("?contest") === -1) {
	alert("Contest ID not found!");

	window.history.back();
}

/* If it doesn't look like there's an entry ID in the URL, show an alert, and go back one page. */
if (window.location.search.indexOf("&entry=") === -1) {
	alert("Entry ID not found!");

	window.history.back();
}

/* The id of the button selected for "Level" */
var selectedLvlBtn = "n/a";
/* The score for this entry */
var scoreData = {
    Level: null,
    Clean_Code: 3,
    Creativity: 3,
    Overall: 3
};

/* Locate the contest ID in the URL, and store it for later use. */
var contestId = window.location.href.split("?contest=")[1].split("&")[0];

/* Locate the entry ID in the URL, and store it for later use. */
var entryId = window.location.href.split("&entry=")[1];

/* The base URL for the program preview Iframe. */
var baseURL = "https://www.khanacademy.org/computer-programming/entry/{ENTRYID}/embedded?buttons=no&editor=yes&author=no&embed=yes";

/* A couple elements that we'll be using later on */
var programPreview = document.querySelector(".program-preview");
var judgingPane = document.querySelector(".judging-pane");
var currentScore = document.querySelector(".current-score");
var rubricsDiv = document.querySelector(".rubrics");

/* Print the contest ID that we found, to the console. */
console.log("Contest ID: " + contestId);

/* Print the entry ID that we found, to the console. */
console.log("Entry ID: " + entryId);

/* The number of lines of code of this project */
var linesOfCode;
/* Send an AJAX request to the KA API for this program. */
$.ajax({
    type: "GET",
    url: "https://www.khanacademy.org/api/internal/scratchpads/"+entryId,
    async: true,
    complete: function(response) {
        /* Calculate the number of lines of code in this entry. */
        linesOfCode = response.responseJSON.revision.code.split("\n").length;
        /* Insert it into where it should be in the document. */
        document.querySelector("#program-info").textContent = linesOfCode+" lines of code";
        /* Call loadEntry() */
        loadEntry();
    }
});

function loadEntry() {
    /* Fetch the data for this contest entry, and then use the data to build up the current page. */
    Contest_Judging_System.loadEntry(contestId, entryId, function(entryData) {
        console.log("Entered loadEntry callback!");

        /* Set the text of our "program-name" heading to the name of the current entry */
        document.querySelector("#program-name").textContent = entryData.name;

        /* The following stuff is broken in Firefox. Issue reported on Khan Academy live-editor repo. */
        var programIframe = document.createElement("iframe");
        programIframe.src = baseURL.replace("{ENTRYID}", entryData.id);
        programIframe.width = 940;
        programIframe.height = 400;
        programIframe.scrolling = "no";
        programIframe.frameborder = 0;

        /* Wrap all this code in a callback to our getRubrics function, that way we can get more data from the rubrics */
        Contest_Judging_System.getRubrics(function(rubrics) {
            /* Create a div that will hold all of the elements required to show the current score for this entry */
            var currentScoreDiv = document.querySelector(".current-score");

            /* Create a paragraph element to display the level rubric */
            var levelRubric = document.createElement("p");
            levelRubric.textContent = "Level: " + rubrics["Level"].keys[entryData.scores.rubric.Level.avg];

            /* Create a paragraph element to display the clean code rubric */
            var cleanCodeRubric = document.createElement("p");
            cleanCodeRubric.textContent = "Clean Code: " + Math.round(entryData.scores.rubric.Clean_Code.avg) + " out of " + rubrics["Clean_Code"].max;

            /* Create a paragraph element to display the creativity rubric */
            var creativityRubric = document.createElement("p");
            creativityRubric.textContent = "Creativity: " + Math.round(entryData.scores.rubric.Creativity.avg) + " out of " + rubrics["Creativity"].max;

            /* Create a paragraph element to display the overall rubric */
            var overallRubric = document.createElement("p");
            overallRubric.textContent = "Overall: " + Math.round(entryData.scores.rubric.Overall.avg) + " out of " + rubrics["Overall"].max; 

            /* Create all the elements we'll need for the "Level" rubric */
            var levelGroup = document.createElement("div");
            levelGroup.id = "level_group";

            /* Label for "Level" */
            var levelLabel = document.createElement("label");
            levelLabel.htmlFor = "level";
            levelLabel.textContent = "Level: ";

            /* Container for levelSelectBtnGroup */
            var levelSelect = document.createElement("div");
            levelSelect.id = "level-btn-toolbar";
            levelSelect.className = "btn-toolbar";

            /* Container for levelSelectBtns */
            var levelSelectBtnGroup = document.createElement("div");
            levelSelectBtnGroup.className = "btn-group";
            levelSelectBtnGroup.role = "group";

            /* All buttons for "Level" */
            var levelSelectBtns = [ ];
            /* All levels */
            var levels = ["Beginner", "Intermediate", "Advanced"];
            /* Create all buttons and push into levelSelectBtns */
            for (var i = 0; i < levels.length; i++){
                var levelSelectButton = document.createElement("button");
                levelSelectButton.type = "button";
                levelSelectButton.id = ("lvlSelectButton" + (i + 1)).toString();
                levelSelectButton.className = "btn btn-sm btn-default";
                levelSelectButton.textContent = levels[i];
                levelSelectBtns.push(levelSelectButton);
            }


            /* Create all the elements we'll need for the "Clean_Code" rubric */
            var cleanCodeGroup = document.createElement("div");
            cleanCodeGroup.id = "clean_code_group";

            /* Label for "Clean_Code" */
            var cleanCodeLabel = document.createElement("label");
            cleanCodeLabel.htmlFor = "clean_code";
            cleanCodeLabel.textContent = "Clean Code: 3";

            /* Slider */
            var cleanCodeSlider = document.createElement("div");
            cleanCodeSlider.className = "slider1to5";
            cleanCodeSlider.role = "slider";
            /* Use jQuery UI to create slider */
            $(cleanCodeSlider).slider({
                range: "max",
                min: 1,
                max: 5,
                value: 3,
                slide: function(event, ui) {
                    /* Tell the score in cleanCodeLabel when the slider changes. */
                    cleanCodeLabel.textContent = "Clean Code: "+ui.value;
                    /* Set scoreData */
                    scoreData.Clean_Code = ui.value;
                }
            });

            /* Create all the elements we'll need for the "Creativity" rubric */
            var creativityGroup = document.createElement("div");
            creativityGroup.id = "creativity_group";

            /* Label for "Creativity" */
            var creativityLabel = document.createElement("label");
            creativityLabel.htmlFor = "creativity";
            creativityLabel.textContent = "Creativity: 3";

            /* Slider */
            var creativitySlider = document.createElement("div");
            creativitySlider.className = "slider1to5";
            creativitySlider.role = "slider";
            /* Use jQuery UI to create slider */
            $(creativitySlider).slider({
                range: "max",
                min: 1,
                max: 5,
                value: 3,
                slide: function(event, ui) {
                    /* Tell the score in creativityLabel when the slider changes. */
                    creativityLabel.textContent = "Creativity: "+ui.value;
                    /* Set scoreData */
                    scoreData.Creativity = ui.value;
                }
            });

            /* Create all the elements we'll need for the "Overall" rubric */
            var overallGroup = document.createElement("div");
            overallGroup.id = "overall_group";

            /* Label for "Overall" */
            var overallLabel = document.createElement("label");
            overallLabel.htmlFor = "overall";
            overallLabel.textContent = "Overall: 3";

            /* Slider */
            var overallSlider = document.createElement("div");
            overallSlider.className = "slider1to5";
            overallSlider.role = "slider";
            $(overallSlider).slider({
                range: "max",
                min: 1,
                max: 5,
                value: 3,
                slide: function(event, ui) {
                    /* Tell the score in overallLabel when the slider changes. */
                    overallLabel.textContent = "Overall: "+ui.value;
                    /* Set scoreData */
                    scoreData.Overall = ui.value;
                }
            });

            /* Append everything to whatever it needs to be appended to */
            for (var i = 0; i < levelSelectBtns.length; i++){
                levelSelectBtnGroup.appendChild(levelSelectBtns[i]);
            }
            levelSelect.appendChild(levelSelectBtnGroup);
            levelGroup.appendChild(levelLabel);
            levelGroup.appendChild(levelSelect);

            cleanCodeGroup.appendChild(cleanCodeLabel);
            cleanCodeGroup.appendChild(cleanCodeSlider);

            creativityGroup.appendChild(creativityLabel);
            creativityGroup.appendChild(creativitySlider);

            overallGroup.appendChild(overallLabel);
            overallGroup.appendChild(overallSlider);

            /* Append all of our judging tools to the rubrics div */
            rubricsDiv.appendChild(levelGroup);
            rubricsDiv.appendChild(cleanCodeGroup);
            rubricsDiv.appendChild(creativityGroup);
            rubricsDiv.appendChild(overallGroup);

            /* Append our program iframe to the "program-preview" div. */
            programPreview.appendChild(programIframe);

            /* Append all of the score information to the page. */
            currentScoreDiv.appendChild(levelRubric);
            currentScoreDiv.appendChild(cleanCodeRubric);
            currentScoreDiv.appendChild(creativityRubric);
            currentScoreDiv.appendChild(overallRubric);

            /* Set the widths of our sliders to 30% */
            $(".slider1to5").width("30%");

            /* Bind to click for Level Select */
            for (var i = 0; i < 3; i++) {
                $("#lvlSelectButton" + (i + 1).toString()).click(function(event) {
                    var id = event.target.id;
                    /* Unselect previously selected button */
                    if (selectedLvlBtn != "n/a" && selectedLvlBtn != id) {
                        $("#" + selectedLvlBtn).removeClass("btn-success").addClass("btn-default");
                    }
                    /* Set selectedLvlBtn and scoreData.Level */
                    selectedLvlBtn = id;
                    scoreData.Level = parseInt(selectedLvlBtn.replace("lvlSelectButton", ""), 10);
                    /* Select the selected button */
                    $("#" + id).removeClass("btn-default").addClass("btn-success");
                });
            }
        });

        console.log("Exiting loadEntry callback!");
    });
}

/* Whenever we click the toggleCode button; toggle the code. */
$(".toggleCode").on("click", function() {
	var currentSrc = $("iframe").attr("src");

	if (currentSrc.indexOf("editor=yes") !== -1) {
		$("iframe").attr("src", currentSrc.replace("editor=yes", "editor=no"));
	} else {
		$("iframe").attr("src", currentSrc.replace("editor=no", "editor=yes"));
	}
});

function judgeEntry(scoreData) {
    /* This function simply judges the entry using scoreData. */
    Contest_Judging_System.judgeEntry(contestId, entryId, scoreData, function(data) {
		console.log("Submitted scores!");
	});
}

$(".viewOnKA").on("click", function() {
	var promptMsg = prompt("By visiting the following page, you're exposing yourself to information that could bias your judging. If you agree to not let information you see on Khan Academy bias your judging, please type \"I agree\", otherwise, close this prompt.");
	if (promptMsg == "I agree") {
		window.open("https://www.khanacademy.org/computer-programming/entry/" + entryId);
	}
});

/* This bool is true if the user has been authenticated. */
var authenticated = false;
$("#submitBtn").on("click", function() {
    /* Tell the user to fill out all criteria if they haven't filled out the Level. */
    if (!scoreData.Level) {
		alert("Please fill out all criteria.");
		return;
	}
    console.log(scoreData);

    /* If the user hasn't been authenticated, try to authenticate them and judge the entry if they are a valid judge. */
    /* Notice that this gives them a way to be authenticated multiple times in case a valid judge messes up in logging in the first time. */
	if (!authenticated) Contest_Judging_System.tryAuthentication(function(valid) {
        authenticated = valid;
        if (valid) judgeEntry(scoreData);
        else alert("You aren't in the allowed judges list!");
    });
    /* Otherwise, if they've already been authenticated, just judge the entry. */
    else judgeEntry(scoreData);
});