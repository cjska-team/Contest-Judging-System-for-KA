/* Get the GET params: */
var getParams = Contest_Judging_System.getGETParams();
/* If we don't find the contest parameter in the URL, tell the user to specify one, and navigate one page back in their history. */
if (!getParams.contest) {
	alert("Please specify a Contest ID!");
	window.history.back();
}

/* Get the contest ID: */
var contestId = getParams.contest;

/* Log the Contest ID that we found, to the console. */
console.log("Contest ID found! " + contestId);

/* The gloabl entry data: */
var global_entryData = { };
/* The DataTable object representing the leaderboard: */
var leaderboardObj;

function loadLeaderboard(contestData, entryData) {
    /* This function loads the leaderboard with the contest data and entry data: */

    /* Get the rubrics: */
    Contest_Judging_System.getRubricsForContest(contestData.id, function(rubrics) {
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
        for (var k in entryData) {
            /* This is the object representing the table data for this entry: */
            var objToAdd = {
                "Entry ID": entryData[k].id,
                "Entry Title": "<a href=\"https://www.khanacademy.org/computer-programming/entry/"+entryData[k].id+"\">"+entryData[k].name+"</a>"
            };

            /* The summed score for this entry: */
            var summedScore = 0;
            /* For each rubric: */
            for (var i = 0; i < rubrics.Order.length; i++) {
                /* The score for this rubric is the average, unless it hasn't been graded yet, in which case it's the minimum: */
                var score = entryData[k].scores.rubric.hasOwnProperty(rubrics.Order[i]) ? entryData[k].scores.rubric[rubrics.Order[i]].avg : rubrics[rubrics.Order[i]].min;
                /* Increment summedScore by score: */
                summedScore += score;
                /* If this is a keys rubric, set the scores using score and the keys property: */
                if (rubrics[rubrics.Order[i]].hasOwnProperty("keys")) {
                    objToAdd[rubrics.Order[i].replace(/_/gi, " ")] = "("+score+") "+rubrics[rubrics.Order[i]].keys[score];
                }
                else {
                    objToAdd[rubrics.Order[i].replace(/_/gi, " ")] = score;
                }
            }
            /* Add summedScore to objToAdd: */
            objToAdd["Summed Score"] = summedScore;
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
            var hashtagLink = window.location.href.substring(hashtagIndex+1, window.location.href.length);
            /* Make sure that the hashtagLink starts with "SortingOrder:": */
            var string = "SortingOrder:";
            if (hashtagLink.substring(0, string.length) == string) {
                /* Get the info from our hashtag link about the ordering: */
                var columnIndex = parseInt(hashtagLink.substring(string.length, hashtagLink.length));
                var lastLetter = hashtagLink.substring(hashtagLink.length-1, hashtagLink.length);
                /* If our information is valid, sort the DataTable based off of it: */
                if (!isNaN(columnIndex) && columnIndex >= 0 && columnIndex < rubrics.Order.length+3 && (lastLetter == "A" || lastLetter == "D")) {
                    leaderboardObj.order([columnIndex, (lastLetter == "A") ? "asc" : "desc"]).draw();
                }
            }
        }
        /* Bind the following click event for the sorting arrows: */
        var sortingArrows = $("#leaderboardTable td[aria-controls]");
        sortingArrows.on("click", function() {
            /* Change the hashtag link based off the column sorted and whether or not it was ascending or descending: */
            window.location.href = "#SortingOrder:"+sortingArrows.index(this)+(this.className.indexOf("sorting_desc") == -1 ? "A" : "D");
        });
        
        /* Hide the loading message and show the content: */
        $(".dataLoadMsg").css("display", "none");
        $(".hideWhileDataLoad").css("display", "block");
    });
}

function loadData() {
    /* This function loads the contest data and the data for all of the entries: */

    /* The uid can be null because includeJudged is true. */
    Contest_Judging_System.get_N_Entries(KA_API.misc.allData, contestId, userData.permLevel, null, true, function(contestData, entryData) {
        /* Set global_entryData and call loadLeaderboard(): */
        global_entryData = entryData;
        loadLeaderboard(contestData, entryData);
        $("#loading").css("display", "none");
	});
}

/* Check if the user data has been retrieved every second: */
var userDataRetrieved = setInterval(function() {
    if (userData) {
        /* If we have the user data, stop checking: */
        clearInterval(userDataRetrieved);
        /* Load the data: */
        loadData();
    }
}, 1000);