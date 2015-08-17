/* If we don't find the contest parameter in the URL, tell the user to specify one, and navigate one page back in their history. */
if (window.location.search.indexOf("?contest=") === -1) {
	alert("Please specify a Contest ID!");

	window.history.back();
}

/* Find the contest ID that was specified in the URL */
var contestId = window.location.href.split("?contest=")[1].split("&")[0];

/* Log the Contest ID that we found, to the console. */
console.log("Contest ID found! " + contestId);

var global_userData = { };
var global_entryData = { };

function loadLeaderboard(data) {
	console.log(data);
}

function loadData() {
	Contest_Judging_System.loadContest(contestId, function(contestData) {
		console.log("Contest Loaded!");
		console.log(contestData);

		for (var i in contestData.entryKeys) {
			console.log("Attempting to load an entry. " + i);
			var thisRoundData;
			(function(local_contestId, local_entryId, local_permLevel) {
				var returnData;

				Contest_Judging_System.loadEntry(local_contestId, local_entryId.toString(), local_permLevel, function(entryData) {
					returnData = entryData;
				});

				var returnWait = setInterval(function() {
					/* TODO: Get rid of the following array */
					var expectedProperties = ["id", "name", "scores", "thumb"];
					for (var i = 0; i < expectedProperties.length; i++) {
						if (returnData !== undefined && !returnData.hasOwnProperty(expectedProperties[i])) {
							return;
						}
					}

					clearInterval(returnWait);
					thisRoundData = returnData;
					console.log(returnData);
				}, 1000);
			})(contestId, i, global_userData.permLevel);
			global_entryData[i] = thisRoundData;
		}

		var loadLeaderboardWait = setInterval(function() {
			for (var i in contestData.entryKeys) {
				if (!global_entryData.hasOwnProperty(i)) {
					return;
				}
			}

			clearInterval(loadLeaderboardWait);
			loadLeaderboard(global_entryData);
		}, 1000);
	});
}

/* Connect to Firebase: */
var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com");
/* When the auth state changes (and on pageload): */
fbRef.onAuth(function(fbAuth) {
    /* Get the user data if they're logged in: */
    if (fbAuth) {
        Contest_Judging_System.getUserData(fbAuth.uid, function(userData) {
            global_userData = userData;
            global_userData.uid = fbAuth.uid;
            $("#loading").css("display", "block");
            $(".hideWhileAuthCheck").css("display", "none");
            /* Load the entries when done: */
            loadData();
        });
    }
    /* Otherwise, just load the entries with default data: */
    else {
        window.location.assign(window.location.replace("/admin/leaderboard.html?contest=" + contestId, ""));
    }
});