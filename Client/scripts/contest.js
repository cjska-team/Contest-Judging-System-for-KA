/***
 * This file will contain all the scripts required for display entries to judges.
***/
/* If it doesn't look like there's a contest ID in the URL, show an alert, and go back one page. */
if (window.location.search.indexOf("?contest") === -1) {
	alert("Contest ID not found!");

	window.history.back();
}

/* If it doesn't look like there's an entry count in the URL, shown an alert, and go back one page. */
if (window.location.search.indexOf("&entries") === -1) {
	alert("Please specify the number of entries you'd like to view!");

	window.history.back();
}

/* Locate the contest ID in the URL, and store it for later use. */
var contestId = window.location.href.split("?contest=")[1].split("&entries")[0];
var numberOfEntries = window.location.href.split("&entries=")[1] === "all" ? null : parseInt(window.location.href.split("&entries=")[1], 10);

/* Go ahead and find the div that we'll store all the entries in. */
var entriesList = document.querySelector(".media-list");

/* Log some messages to the console if we find a contest. This is used mainly for debugging purposes. */
console.log("Contest found!");
console.log("Contest ID: " + contestId);
console.log("We're going to load " + (numberOfEntries === null ? "all" : numberOfEntries) + " entries!");

/* Hide elements that we've marked with the class "hideWhileLoad". */
$(".hideWhileLoad").css("display", "none");

/* Firebase authentication data and our Firebase user data */
var fbAuthenticationData, global_userData;
/* Log the user in: */
Contest_Judging_System.logInAndGetUserData("popup", function(authData, userData) {
    fbAuthenticationData = authData;
    global_userData = userData;
    
    /* Randomly pick n entries, and then display them on the page. */
    Contest_Judging_System.get_N_Entries((numberOfEntries === null ? KA_API.misc.allData : numberOfEntries), contestId, global_userData.permLevel, function(contest, entries) {
        /* Setup the page */
        $("title").text(contest.name);
        $("#contestName").text(contest.name);

        /* Get the "contestDescription" div, and store it in a variable for later use. */
        var detailsDiv = document.getElementById("contestDescription");
        /* Set the innerHTML of the contestDescription div, to the description stored in Firebase, or "No description found", if we don't have a description stored in Firebase. */
        detailsDiv.innerHTML = contest.desc || "No description found!";

        /* entriesDone.hasOwnProperty(i) iff entries[i] has finished loading. */
        var entriesDone = {};
        /* Add all entries to the page */
        for (var i in entries) {
            /* The JSON object corresponding to this entry. */
            var curr = entries[i];

            /* Create a list item element, and give it Bootstrap's "media" class. */
            var mediaListItem = document.createElement("li");
            mediaListItem.className = "media entry";

            /* Create a div element, and give it Bootstrap's "media-left" class. */
            var mediaLeftDiv = document.createElement("div");
            mediaLeftDiv.className = "media-left";

            /* Create a link element, and set it's href to the URL of this entry... */
            var aElem = document.createElement("a");
            // aElem.href = "https://www.khanacademy.org/computer-programming/entry/" + curr.id;
            aElem.href = "entry.html?contest=" + contestId + "&entry=" + curr.id;

            /* Create an image element and set it's src to this entry's thumbnail */
            var mediaObj = document.createElement("img");
            mediaObj.src = "https://www.khanacademy.org" + curr.thumb;
            mediaObj.alt = "Entry thumbnail";

            /* Create a div element, and give it Bootstrap's "media-body" class. */
            var mediaBody = document.createElement("div");
            mediaBody.className = "media-body";

            /* Create a heading element (tier 4), and set it's text to this entry's name. */
            var mediaHeading = document.createElement("h4");
            mediaHeading.textContent = curr.name;

            /* Append everything */
            aElem.appendChild(mediaObj);
            mediaLeftDiv.appendChild(aElem);
            mediaBody.appendChild(mediaHeading);
            mediaListItem.appendChild(mediaLeftDiv);
            mediaListItem.appendChild(mediaBody);
            entriesList.appendChild(mediaListItem);

            /* If the user can read the scores, get the rubrics. Also, put it in a function wrapper to save the value of mediaBody and i. */
            if (curr.hasOwnProperty("scores")) (function(mediaBody, i) {
                Contest_Judging_System.getAllRubrics(contestId, function(rubrics) {
                    /* Create a div that will hold more information about this entry */
                    var infoDiv = document.createElement("div");
                    infoDiv.className = "info";

                    /* Create a heading element (tier 5), to mark the "Score" heading */
                    var scoreHeading = document.createElement("h5");
                    scoreHeading.textContent = "Score:";

                    /* Create an unordered list element that will be used to display score information for this entry. */
                    var scoreList = document.createElement("ul");

                    /* Go through all the score information for this entry in the order we want, and create a list item for it. */
                    for (var _i = 0; _i < rubrics.Order.length; _i++) {
                        /* Get the current rubric: */
                        var rubric = rubrics.Order[_i];
                        if (Contest_Judging_System.misc.rubricsToIgnore.indexOf(rubric) === -1) {
                            /* Round the average score for the current rubric, down. */
                            var val = Math.floor(curr.scores.rubric[rubric] === undefined ? 0 : curr.scores.rubric[rubric].avg);
                            /* The maximum for this rubric. */
                            var max = rubrics[rubric].max;
                            /* Credit to @NobleMushtak for the following idea. */
                            var selectedRubric = rubric.replace(/_/gi, " ");

                            console.log(rubric);

                            /* If the current rubric has the [optional] keys property, let's convert the IDs to human-readable keys */
                            var listItem = document.createElement("li");
                            if (rubrics[rubric].hasOwnProperty("keys")) {
                                val = rubrics[rubric].keys[val];
                                listItem.textContent = selectedRubric + ": " + val;
                                scoreList.appendChild(listItem);
                            } else {
                                listItem.textContent = selectedRubric + ": " + val + " out of " + max;
                                scoreList.appendChild(listItem);
                            } 
                        }
                    }
                    /* Append everything */
                    infoDiv.appendChild(scoreHeading);
                    infoDiv.appendChild(scoreList);
                    mediaBody.appendChild(infoDiv);
                    /* Tell entriesDone that we're done: */
                    entriesDone[i] = true;
                });
            })(mediaBody, i);
            /* Otherwise, if the user can't read the scores, then tell entriesDone that we're done: */
            else entriesDone[i] = true;
        }

        /* Check every second to see if we're done: */
        var checkDone = setInterval(function() {
            if (Object.keys(entries).length == Object.keys(entriesDone).length) {
                /* If we're done, stop checking if we're done: */
                clearInterval(checkDone);
                /* Hide the loading div and show items that were hidden during loading. */
                $("#loading").css("display", "none");
                $(".hideWhileLoad").css("display", "block");
            }
        }, 1000);
    });
});