/* Extract the GET parameters from the URL, and assign them to a new variable. */
var getParams = window.Contest_Judging_System.getGETParams();

/* If a contest ID doesn't exist in the URL, remind the user that they need to specify one, and navigate back one page. */
if (!getParams.contest) {
	alert("Please specify a Contest ID!");
	window.history.back();
}

/* Declare a new variable, and assign it's value to the contest ID that we found in the URL. */
var contestId = getParams.contest;

/* For debugging purposes, let's go ahead and print the contest ID to the Javascript console. */
console.log("Contest ID found! " + contestId);

/* Declare an empty JSON object, which will be used to store the data for each entry. */
var global_entryData = { };

/* The DataTable object representing the leaderboard: */
var leaderboardObj;

/***
 * loadLeaderboard()
 * Sets up a DataTable, to be used as a leaderboard.
 * @author Gigabyte Giant, Noble Mushtak (2015)
 * @param {Object} contestData: An object containing all the data for the current contest.
 * @param {Object} entryData: An object containing all the entrys' data for the current contest.
***/
function loadLeaderboard(contestData, entryData) {
    /* This function loads the leaderboard with the contest data and entry data: */

    /* Get the rubrics: */
    window.Contest_Judging_System.getRubricsForContest(contestData.id, function(rubrics) {
        console.log(rubrics);
        /* Make the columns with id, title, each rubric, and a summed score: */
        var cols = [ { data: "Entry ID" }, { data: "Entry Title" } ];
        for (var i = 0; i < rubrics.Order.length; i++) {
            /* Replace the rubric name's _s with spaces: */
            cols.push({ data: rubrics.Order[i].replace(/_/gi, " ") });
        }
        cols.push({ data: "Summed Score" });

        /* The table heading: */
        var tableHeading = document.querySelector("#leaderboardTable thead tr");
        /* For each column: */
        for (var col = 0; col < cols.length; col++) {
            /* Create a <td> element with the column data and append it into the heading: */
            var td = document.createElement("td");
            td.textContent = cols[col].data;
            tableHeading.appendChild(td);
        }

        /* The list of all the table data: */
        var tableDataList = [ ];
        /* For all entries: */
        for (var eD in entryData) {
            /* This is the object representing the table data for this entry: */
            var objToAdd = {
                "Entry ID": entryData[eD].id,
                "Entry Title": "<a href=\"https://www.khanacademy.org/computer-programming/entry/" + entryData[eD].id + "\">" + entryData[eD].name + "</a>"
            };

            /* The summed score for this entry: */
            var summedScore = 0;
            /* For each rubric: */
            for (var roInd = 0; roInd < rubrics.Order.length; roInd++) {
                /* The score for this rubric is the average, unless it hasn't been graded yet, in which case it's the minimum: */
                var score = entryData[eD].scores.rubric.hasOwnProperty(rubrics.Order[roInd]) ? entryData[eD].scores.rubric[rubrics.Order[roInd]].avg : rubrics[rubrics.Order[roInd]].min;
                /* Increment summedScore by score: */
                summedScore += score;
                /* If this is a keys rubric, set the scores using score and the keys property: */
                if (rubrics[rubrics.Order[roInd]].hasOwnProperty("keys")) {
                    objToAdd[rubrics.Order[roInd].replace(/_/gi, " ")] = "(" + score + ") " + rubrics[rubrics.Order[roInd]].keys[score];
                }
                else {
                    objToAdd[rubrics.Order[roInd].replace(/_/gi, " ")] = score;
                }
            }
            /* Add summedScore to objToAdd: */
            objToAdd["Summed Score"] = summedScore;
            console.log(objToAdd);
            /* Push objToAdd into tableDataList: */
            tableDataList.push(objToAdd);
        }

        /* Create a DataTable using cols and tableDataList: */
        leaderboardObj = $("#leaderboardTable").DataTable({
            columns: cols,
            data: tableDataList
        });

        /* Get the hashtag of the link (if there is one): */
        var hashtagIndex = window.location.href.indexOf("#");

        if (hashtagIndex != -1) {
            var hashtagLink = window.location.href.substring(hashtagIndex + 1, window.location.href.length);

            /* Make sure that the hashtagLink starts with "SortingOrder:": */
            var string = "SortingOrder:";

            if (hashtagLink.substring(0, string.length) == string) {
                /* Get the info from our hashtag link about the ordering: */
                var columnIndex = parseInt(hashtagLink.substring(string.length, hashtagLink.length));
                var lastLetter = hashtagLink.substring(hashtagLink.length - 1, hashtagLink.length);
                /* If our information is valid, sort the DataTable based off of it: */
                if (!isNaN(columnIndex) && columnIndex >= 0 && columnIndex < rubrics.Order.length + 3 && (lastLetter == "A" || lastLetter == "D")) {
                    leaderboardObj.order([columnIndex, (lastLetter == "A") ? "asc" : "desc"]).draw();
                }
            }
        }
        /* Bind the following click event for the sorting arrows: */
        var sortingArrows = $("#leaderboardTable td[aria-controls]");
        sortingArrows.on("click", function() {
            /* Change the hashtag link based off the column sorted and whether or not it was ascending or descending: */
            window.location.href = "#SortingOrder:" + sortingArrows.index(this) + (this.className.indexOf("sorting_desc") == -1 ? "A" : "D");
        });

        /* Hide the loading message and show the content: */
        $(".dataLoadMsg").css("display", "none");
        $(".hideWhileDataLoad").css("display", "block");
    });
}

/***
 * loadData()
 * Loads all the data that we need for the leaderboard, from Firebase.
 * @author Gigabyte Giant, Noble Mushtak (2015)
***/
function loadData() {
    /* The uid can be null because includeJudged is true. */
    window.Contest_Judging_System.get_N_Entries(window.KA_API.misc.allData, contestId, userData.permLevel, null, true, function(contestData, entryData) {
        /* Set global_entryData and call loadLeaderboard(): */
        global_entryData = entryData;
		/* Invoke the function that'll setup the leaderboard. */
        loadLeaderboard(contestData, entryData);
		/* Hide the loading spinner */
        $("#loading").css("display", "none");
	});
}

/* If the user is logged in, go ahead and load the data that we need from Firebase. */
if (userData) {
    loadData();
}
/* Otherwise, append it to userDataRetrievedCallbacks: */
else {
    userDataRetrievedCallbacks.push(loadData);
}
