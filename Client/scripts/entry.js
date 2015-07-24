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

/* The ids of the buttons selected on judging tools */
var selectedBtn = {};
/* The score for this entry */
var scoreData = {};

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

function judgingButtonClick(k, kLower) {
    /* Click event handler for judging tool buttons */
    return function(event) {
        var id = event.target.id;
        /* Unselect previously selected button */
        if (selectedBtn[k] != null && selectedBtn[k] != id) {
            $("#"+selectedBtn[k]).removeClass("btn-success").addClass("btn-default");
        }
        /* Set selectedBtn[k] and scoreData[k] */
        selectedBtn[k] = id;
        scoreData[k] = parseInt(selectedBtn[k].replace(kLower+"SelectButton", ""), 10);
        /* Select the selected button */
        $("#"+id).removeClass("btn-default").addClass("btn-success");
    }
}

function loadEntry() {
    /* Fetch the data for this contest entry, and then use the data to build up the current page. */
    /* TODO: Fetch all rubrics to automate the min/max/key fetching. */
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
            console.log(JSON.stringify(rubrics));

            /* For all rubrics... */
            for (var k in rubrics) {
                /* Name of Rubric */
                var rubricName = k.replace(/_/gi, " ");
                /* Lowercase Property */
                var kLower = k.toLowerCase();
                /* The current score in this rubric */
                var curRubric = document.createElement("p");
                /* The container for all elems of this rubric */
                var curGroup = document.createElement("div");
                curGroup.id = kLower+"_group";
                /* Create label for this rubric */
                var curLabel = document.createElement("label");
                curLabel.htmlFor = kLower;
                curLabel.textContent = rubricName+": ";
                
                /* If there are discrete options to this rubric: */
                if (rubrics[k].hasOwnProperty("keys")) {
                    /* Set the current score using keys */
                    curRubric.textContent = rubricName+": " +rubrics[k].keys[Math.round(entryData.scores.rubric[k].avg)];

                    /* Container for curSelectBtnGroup */
                    var curSelect = document.createElement("div");
                    curSelect.id = kLower+"-btn-toolbar";
                    curSelect.className = "btn-toolbar";

                    /* Container for curSelectBtns */
                    var curSelectBtnGroup = document.createElement("div");
                    curSelectBtnGroup.className = "btn-group";
                    curSelectBtnGroup.role = "group";

                    /* All buttons */
                    var curSelectBtns = [ ];
                    /* Initialize selectedBtn[k] and scoreData[k] to null */
                    selectedBtn[k] = scoreData[k] = null;
                    /* Create all buttons and push into curSelectBtns */
                    for (var i = rubrics[k].min; i <= rubrics[k].max; i++){
                        var curSelectButton = document.createElement("button");
                        curSelectButton.type = "button";
                        curSelectButton.id = (kLower+"SelectButton"+(i+1).toString());
                        curSelectButton.className = "btn btn-sm btn-default";
                        /* Remember to set the text using rubrics[k].keys and to add a click event using judgingButtonClick() above. */
                        curSelectButton.textContent = rubrics[k].keys[i];
                        $(curSelectButton).click(judgingButtonClick(k, kLower));
                        curSelectBtns.push(curSelectButton);
                    }

                    /* Append everything to whatever it needs to be appended to */
                    for (var i = 0; i < curSelectBtns.length; i++){
                        curSelectBtnGroup.appendChild(curSelectBtns[i]);
                    }
                    curSelect.appendChild(curSelectBtnGroup);
                    curGroup.appendChild(curLabel);
                    curGroup.appendChild(curSelect);
                }
                /* Otherwise, the rubric is numerical. */
                else {
                    /* Set the current score using numbers */
                    curRubric.textContent = k+": "+Math.round(entryData.scores.rubric[k].avg)+" out of "+rubrics[k].max;
                    /* Edit label textContent */
                    curLabel.textContent += rubrics[k].min;

                    /* Initialize scoreData[k] to the minimum */
                    scoreData[k] = rubrics[k].min;
                    /* Slider */
                    var curSlider = document.createElement("div");
                    curSlider.className = "judgingSlider";
                    curSlider.role = "slider";
                    /* This is put in a function wrapper to save the value of curLabel, scoreData, rubricName, and k for the function inside the JSON object. */
                    (function(curLabel, scoreData, rubricName, k) {
                        /* Use jQuery UI to create slider */
                        $(curSlider).slider({
                            range: "max",
                            min: rubrics[k].min,
                            max: rubrics[k].max,
                            value: rubrics[k].min,
                            slide: function(event, ui) {
                                /* Tell the score in curLabel when the slider changes. */
                                curLabel.textContent = rubricName+": "+ui.value;
                                /* Set scoreData */
                                scoreData[k] = ui.value;
                            }
                        });
                    })(curLabel, scoreData, rubricName, k);

                    /* Append everything to whatever it needs to be appended to */
                    curGroup.appendChild(curLabel);
                    curGroup.appendChild(curSlider);
                }

                /* Add the current rubric to the current score. */
                currentScoreDiv.appendChild(curRubric);
                /* Add this judging tools to the rubrics div */
                rubricsDiv.appendChild(curGroup);
            }

            /* Append our program iframe to the "program-preview" div. */
            programPreview.appendChild(programIframe);

            /* Set the widths of our sliders to 30% */
            $(".judgingSlider").width("30%");
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
	/* Prompt the user with a message warning them about information that could potentially bias them. */
	var promptMsg = prompt("By visiting the following page, you're exposing yourself to information that could bias your judging. If you agree to not let information you see on Khan Academy bias your judging, please type \"I agree\" in the box below to show that you read this message. Otherwise, close this prompt.");
	/* If the user types 'I agree' in the prompt, open the entry on Khan Academy. */
	if (promptMsg != null && promptMsg.toLowerCase().indexOf("i agree") > -1) {
		window.open("https://www.khanacademy.org/computer-programming/entry/" + entryId);
	}
});

/* This bool is true if the user has been authenticated. */
var authenticated = false;
$("#submitBtn").on("click", function() {
    /* Tell the user to fill out all criteria if they haven't filled out everything. */
    for (var k in scoreData) if (scoreData[k] == null) {
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