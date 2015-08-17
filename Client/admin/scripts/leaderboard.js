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

/* The gloabl user data and entry data: */
var global_userData = { };
var global_entryData = { };

function loadLeaderboard(data) {
	Contest_Judging_System.loadContest(contestId, function(contestData) {
		console.log(contestData);

		Contest_Judging_System.getRubricsForContest(contestData.id, function(rubrics) {
			console.log(rubrics);
			var cols = [ { data: "Entry ID" }, { data: "Entry Title" } ];

			for (var i = 0; i < rubrics.Order.length; i++) {
				cols.push({ data: rubrics.Order[i] });
			}

			cols.push({ data: "Summed Score" });

			for (var col = 0; col < cols.length; col++) {
				var td = document.createElement("td");
				td.textContent = cols[col].data;
				$("#leaderboardTable thead tr").add(td).appendTo("#leaderboardTable thead tr");
			}

			var tableDataList = [ ];

			for (var i in data) {
				var objToAdd = {
					"Entry ID": data[i].id,
					"Entry Title": data[i].name
				};

				var summedScore = 0;

				for (var j = 0; j < rubrics.Order.length; j++) {
					if (rubrics[rubrics.Order[j]].hasOwnProperty("keys")) {
						objToAdd[rubrics.Order[j]] = (data[i].scores.rubric[rubrics.Order[j]] === undefined ? rubrics[rubrics.Order[j]].keys[0] : rubrics[rubrics.Order[j]].keys[data[i].scores.rubric[rubrics.Order[j]].avg]);
					} else {
						objToAdd[rubrics.Order[j]] = (data[i].scores.rubric[rubrics.Order[j]] === undefined ? 1 : data[i].scores.rubric[rubrics.Order[j]].avg);
					}
					summedScore += (data[i].scores.rubric[rubrics.Order[j]] === undefined ? 1 : data[i].scores.rubric[rubrics.Order[j]].avg);
				}

				objToAdd["Summed Score"] = summedScore;

				tableDataList.push(objToAdd);
			}

			$("#leaderboardTable").DataTable({
				columns: cols,
				data: tableDataList
			});

			$(".dataLoadMsg").css("display", "none");
			$(".hideWhileDataLoad").css("display", "block");
		});
	});
}

function loadData() {
    /* This function loads the contest data and the data for all of the entries: */

    Contest_Judging_System.get_N_Entries(KA_API.misc.allData, contestId, global_userData.permLevel, fbAuth.uid, true, function(contestData, entryData) {
        /* Set global_entryData and call loadLeaderboard(): */
        global_entryData = entryData;
        loadLeaderboard(global_entryData);

        $("#loading").css("display", "none");
	});
}

/* Connect to Firebase: */
var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com");
/* The Firebase auth data: */
var fbAuth;
/* When the auth state changes (and on pageload): */
fbRef.onAuth(function(fbAuthLocal) {
    fbAuth = fbAuthLocal;
    /* Get the user data if they're logged in: */
    if (fbAuth) {
        Contest_Judging_System.getUserData(fbAuth.uid, function(userData) {
            global_userData = userData;
            global_userData.uid = fbAuth.uid;
            /* Load the entries when done: */
            loadData();
        });
    }
    /* Otherwise, just load the entries with default data: */
    else {
        window.location.assign(window.location.replace("/admin/leaderboard.html?contest=" + contestId, ""));
    }
});