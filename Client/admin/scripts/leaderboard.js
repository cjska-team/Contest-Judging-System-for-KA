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
	console.log(data);
}

function loadData() {
    /* This function loads the contest data and the data for all of the entries: */

    Contest_Judging_System.get_N_Entries(KA_API.misc.allData, contestId, global_userData.permLevel, fbAuth.uid, true, function(contestData, entryData) {
        /* Set global_entryData and call loadLeaderboard(): */
        global_entryData = entryData;
        loadLeaderboard(global_entryData);
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