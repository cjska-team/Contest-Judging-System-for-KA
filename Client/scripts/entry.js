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

/* Locate the contest ID in the URL, and store it for later use. */
var contestId = window.location.href.split("?contest=")[1].split("&")[0];

/* Locate the entry ID in the URL, and store it for later use. */
var entryId = window.location.href.split("&entry=")[1];

/* The base URL for the program preview Iframe. */
var baseURL = "https://www.khanacademy.org/computer-programming/entry/{ENTRYID}/embedded?buttons=no&editor=no&author=no&embed=yes";

/* A couple elements that we'll be using later on */
var programPreview = document.querySelector(".program-preview");
var judgingPane = document.querySelector(".judging-pane");
var currentScore = document.querySelector(".current-score");
var rubricsDiv = document.querySelector(".rubrics");
currentScore.addEventListener("click", function() {
	if (currentScore.className.indexOf("hidden-data") !== -1) {
		currentScore.className = currentScore.className.replace("hidden-data", "");
	} else {
		currentScore.className += " hidden-data";
	}
	console.log(currentScore.className);
});

/* Print the contest ID that we found, to the console. */
console.log("Contest ID: " + contestId);

/* Print the entry ID that we found, to the console. */
console.log("Entry ID: " + entryId);

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

	/* Create a div that will hold all of the elements required to show the current score for this entry */
	var currentScoreDiv = document.createElement("div");
	currentScoreDiv.className = "current-score";

	/* Create a paragraph element to display the level rubric */
	var levelRubric = document.createElement("p");
	levelRubric.textContent = "Level: " + entryData.scores.rubric.Level.avg;

	/* Create a paragraph element to display the clean code rubric */
	var cleanCodeRubric = document.createElement("p");
	cleanCodeRubric.textContent = "Clean Code: " + Math.round(entryData.scores.rubric.Clean_Code.avg);

	/* Create a paragraph element to display the creativity rubric */
	var creativityRubric = document.createElement("p");
	creativityRubric.textContent = "Creativity: " + Math.round(entryData.scores.rubric.Creativity.avg);

	/* Create a paragraph element to display the overall rubric */
	var overallRubric = document.createElement("p");
	overallRubric.textContent = "Overall: " + Math.round(entryData.scores.rubric.Overall.avg); 

	/* Create all the elements we'll need for the "Level" rubric */
	var levelGroup = document.createElement("div");
	levelGroup.id = "level_group";

	var levelLabel = document.createElement("label");
	levelLabel.htmlFor = "level";
	levelLabel.textContent = "Level: ";

	var levelSelect = document.createElement("select");
	levelSelect.id = "level";

	var beginnerOption = document.createElement("option");
	beginnerOption.value = 1;
	beginnerOption.textContent = "Beginner";

	var intermediateOption = document.createElement("option");
	intermediateOption.value = 2;
	intermediateOption.textContent = "Intermediate";

	var advancedOption = document.createElement("option");
	advancedOption.value = 3;
	advancedOption.textContent = "Advanced";

	levelSelect.add(beginnerOption);
	levelSelect.add(intermediateOption);
	levelSelect.add(advancedOption);

	levelSelect.selectedIndex = 0;

	/* Create all the elements we'll need for the "Clean_Code" rubric */
	var cleanCodeGroup = document.createElement("div");
	cleanCodeGroup.id = "clean_code_group";

	var cleanCodeLabel = document.createElement("label");
	cleanCodeLabel.htmlFor = "clean_code";
	cleanCodeLabel.textContent = "Clean Code: ";

	var cleanCodeInput = document.createElement("input");
	cleanCodeInput.id = "clean_code";
	cleanCodeInput.type = "number";
	cleanCodeInput.min = "1";
	cleanCodeInput.value = "1";
	cleanCodeInput.max = "5";

	/* Create all the elements we'll need for the "Creativity" rubric */
	var creativityGroup = document.createElement("div");
	creativityGroup.id = "creativity_group";

	var creativityLabel = document.createElement("label");
	creativityLabel.htmlFor = "creativity";
	creativityLabel.textContent = "Creativity: ";

	var creativityInput = document.createElement("input");
	creativityInput.id = "creativity";
	creativityInput.type = "number";
	creativityInput.min = "1";
	creativityInput.value = "1";
	creativityInput.max = "5";

	var overallGroup = document.createElement("div");
	overallGroup.id = "overall_group";

	var overallLabel = document.createElement("label");
	overallLabel.htmlFor = "overall";
	overallLabel.textContent = "Overall: ";

	var overallInput = document.createElement("input");
	overallInput.id = "overall";
	overallInput.type = "number";
	overallInput.min = "1";
	overallInput.value = "1";
	overallInput.max = "5";

	/* Append everything to whatever it needs to be appended to */
	levelGroup.appendChild(levelLabel);
	levelGroup.appendChild(levelSelect);

	cleanCodeGroup.appendChild(cleanCodeLabel);
	cleanCodeGroup.appendChild(cleanCodeInput);

	creativityGroup.appendChild(creativityLabel);
	creativityGroup.appendChild(creativityInput);

	overallGroup.appendChild(overallLabel);
	overallGroup.appendChild(overallInput);

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
	currentScore.appendChild(currentScoreDiv);

	console.log("Exiting loadEntry callback!");
});

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

/* This bool is true iff the user has been authenticated. */
var authenticated = false;
$("#submitBtn").on("click", function() {
	console.log("Button clicked!");
	var scoreData = {};

	scoreData.Level = parseInt($("#level").val(), 10);
	scoreData.Clean_Code = parseInt($("#clean_code").val(), 10);
	scoreData.Creativity = parseInt($("#creativity").val(), 10);
	scoreData.Overall = parseInt($("#overall").val(), 10);

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
