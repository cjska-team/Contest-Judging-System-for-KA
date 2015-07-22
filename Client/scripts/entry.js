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
var selectedLvlBtn = "n/a";
var selectedCleanCodeBtn = "n/a";
var selectedCreativityBtn = "n/a";
var selectedOverallBtn = "n/a";
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

	var levelSelect = document.createElement("div");
	levelSelect.id = "level-btn-toolbar";
	levelSelect.className = "btn-toolbar";
	
	var levelSelectBtnGroup = document.createElement("div");
	levelSelectBtnGroup.className = "btn-group";
	levelSelectBtnGroup.role = "group";

	var levelSelectBtns = [ ];
	var levels = ["Beginner", "Intermediate", "Advanced"];
	for (var i = 0; i < 3; i++){
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

	var cleanCodeLabel = document.createElement("label");
	cleanCodeLabel.htmlFor = "clean_code";
	cleanCodeLabel.textContent = "Clean Code: ";

	var cleanCodeSelect = document.createElement("div");
	cleanCodeSelect.id = "level-btn-toolbar";
	cleanCodeSelect.className = "btn-toolbar";
	
	var cleanCodeSelectBtnGroup = document.createElement("div");
	cleanCodeSelectBtnGroup.className = "btn-group";
	cleanCodeSelectBtnGroup.role = "group";

	var cleanCodeSelectBtns = [ ];
	for (var i = 0; i < 5; i++) {
		var cleanCodeSelectButton = document.createElement("button");
		cleanCodeSelectButton.type = "button";
		cleanCodeSelectButton.id = ("cleanCodeSelectButton" + (i + 1)).toString();
		cleanCodeSelectButton.className = "btn btn-sm btn-default";
		cleanCodeSelectButton.textContent = (i + 1).toString();
		cleanCodeSelectBtns.push(cleanCodeSelectButton);
	}

	/* Create all the elements we'll need for the "Creativity" rubric */
	var creativityGroup = document.createElement("div");
	creativityGroup.id = "creativity_group";

	var creativityLabel = document.createElement("label");
	creativityLabel.htmlFor = "creativity";
	creativityLabel.textContent = "Creativity: ";

	var creativitySelect = document.createElement("div");
	creativitySelect.id = "level-btn-toolbar";
	creativitySelect.className = "btn-toolbar";
	
	var creativitySelectBtnGroup = document.createElement("div");
	creativitySelectBtnGroup.className = "btn-group";
	creativitySelectBtnGroup.role = "group";

	var creativitySelectBtns = [ ];
	for (var i = 0; i < 5; i++) {
		var creativitySelectButton = document.createElement("button");
		creativitySelectButton.type = "button";
		creativitySelectButton.id = ("creativitySelectButton" + (i + 1)).toString();
		creativitySelectButton.className = "btn btn-sm btn-default";
		creativitySelectButton.textContent = (i + 1).toString();
		creativitySelectBtns.push(creativitySelectButton);
	}

	var overallGroup = document.createElement("div");
	overallGroup.id = "overall_group";

	var overallLabel = document.createElement("label");
	overallLabel.htmlFor = "overall";
	overallLabel.textContent = "Overall: ";

	var overallSelect = document.createElement("div");
	overallSelect.id = "level-btn-toolbar";
	overallSelect.className = "btn-toolbar";
	
	var overallSelectBtnGroup = document.createElement("div");
	overallSelectBtnGroup.className = "btn-group";
	overallSelectBtnGroup.role = "group";

	var overallSelectBtns = [ ];
	for (var i = 0; i < 5; i++) {
		var overallSelectButton = document.createElement("button");
		overallSelectButton.type = "button";
		overallSelectButton.id = ("overallSelectButton" + (i + 1)).toString();
		overallSelectButton.className = "btn btn-sm btn-default";
		overallSelectButton.textContent = (i + 1).toString();
		overallSelectBtns.push(overallSelectButton);
	}
	

	/* Append everything to whatever it needs to be appended to */
	for (var i = 0; i < levelSelectBtns.length; i++){
		levelSelectBtnGroup.appendChild(levelSelectBtns[i]);
	}
	levelSelect.appendChild(levelSelectBtnGroup);
	levelGroup.appendChild(levelLabel);
	levelGroup.appendChild(levelSelect);

	cleanCodeGroup.appendChild(cleanCodeLabel);
	for (var i = 0; i < cleanCodeSelectBtns.length; i++){
		cleanCodeSelectBtnGroup.appendChild(cleanCodeSelectBtns[i]);
	}
	cleanCodeSelect.appendChild(cleanCodeSelectBtnGroup);
	cleanCodeGroup.appendChild(cleanCodeSelect);

	creativityGroup.appendChild(creativityLabel);
	for (var i = 0; i < creativitySelectBtns.length; i++){
		creativitySelectBtnGroup.appendChild(creativitySelectBtns[i]);
	}
	creativitySelect.appendChild(creativitySelectBtnGroup);
	creativityGroup.appendChild(creativitySelect);

	overallGroup.appendChild(overallLabel);
	for (var i = 0; i < overallSelectBtns.length; i++){
		overallSelectBtnGroup.appendChild(overallSelectBtns[i]);
	}
	overallSelect.appendChild(overallSelectBtnGroup);
	overallGroup.appendChild(overallSelect);

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

	/* Bind to click for Level Select */
	for (var i = 0; i < 3; i++) {
		$("#lvlSelectButton" + (i+1).toString()).click(function(event) {
			var id = event.target.id;
			if (selectedLvlBtn != "n/a" && selectedLvlBtn != id) {
				$("#" + selectedLvlBtn).removeClass("btn-success").addClass("btn-default");
			}
			selectedLvlBtn = id;
			$("#" + id).removeClass("btn-default").addClass("btn-success");
		});
	}
	for (var i = 0; i < 5; i++) {
		$("#cleanCodeSelectButton" + (i+1).toString()).click(function(event) {
			var id = event.target.id;
			if (selectedCleanCodeBtn != "n/a" && selectedCleanCodeBtn != id) {
				$("#" + selectedCleanCodeBtn).removeClass("btn-success").addClass("btn-default");
			}
			selectedCleanCodeBtn = id;
			$("#" + id).removeClass("btn-default").addClass("btn-success");
		});
	}
	for (var i = 0; i < 5; i++) {
		$("#creativitySelectButton" + (i+1).toString()).click(function(event){
			var id = event.target.id;
			if (selectedCreativityBtn != "n/a" && selectedCreativityBtn != id) {
				$("#" + selectedCreativityBtn).removeClass("btn-success").addClass("btn-default");
			}
			selectedCreativityBtn = id;
			$("#" + id).removeClass("btn-default").addClass("btn-success");
		});
	}
	for (var i = 0; i < 5; i++) {
		$("#overallSelectButton" + (i+1).toString()).click(function(event){
			var id = event.target.id;
			if (selectedOverallBtn != "n/a" && selectedOverallBtn != id){
				$("#" + selectedOverallBtn).removeClass("btn-success").addClass("btn-default");
			}
			selectedOverallBtn = id;
			$("#" + id).removeClass("btn-default").addClass("btn-success");
		});
	}
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
	var scoreData = { };
	if (selectedLvlBtn != "n/a" && selectedOverallBtn != "n/a" && selectedCreativityBtn != "n/a" && selectedCleanCodeBtn != "n/a") {
		scoreData.Level = parseInt(selectedLvlBtn.replace("lvlSelectButton", ""), 10);
		scoreData.Clean_Code = parseInt(selectedCleanCodeBtn.replace("cleanCodeSelectButton", ""), 10);
		scoreData.Creativity = parseInt(selectedCreativityBtn.replace("creativitySelectButton", ""), 10);
		scoreData.Overall = parseInt(selectedOverallBtn.replace("overallSelectButton", ""), 10);
	} else {
		alert("Please fill out all criteria.");
		return;
	}

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
