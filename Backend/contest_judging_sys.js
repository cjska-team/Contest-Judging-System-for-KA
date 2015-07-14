/***
 * This file is where all the general purpose, reusable code should go!
***/

/*
 * Basic Script Injection
 * Author: Gigabyte Giant
 */
/*var include = function(link) {
    //Append a <script> tag with src link into the <body>
    var scriptTag = document.createElement("script");
    scriptTag.src = link;
    document.body.appendChild(scriptTag);
};

var getApi = function(apiUrl, complete){
    //Send a GET AJAX request to apiUrl and call complete when finished
    //Made by aikaikaik in https://github.com/aikaikaik/KA-Contest-Judging-System/commit/dee9bceaef6c6fc8abf8437d76882e5cfca81718
    return $.ajax({
        type: 'GET',
        url: apiUrl,
        async: true,
        complete: complete
    });
};*/

var includeFunc = function(path) {
	var scriptTag = document.createElement("script");
	scriptTag.src = path;

	document.body.appendChild(scriptTag);

	return scriptTag;
};

window.Contest_Judging_System = (function() {
	// jQuery and Firebase are both dependencies for this project. If we don't have them, exit the function immediately.
	if (!jQuery || !Firebase || !window.KA_API) return; // TODO: If a project dependency doesn't exist, go ahead an inject it.

	return {
		include: includeFunc,
		getStoredContests: function(callback) {
			var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/contests/");

			var fromFirebase = [];

			fbRef.orderByKey().on("child_added", function(item) {
				fromFirebase[item.key()] = item.key();
			});
			fbRef.once("value", function(data) {
				callback(fromFirebase);
			});
		},
		sync: function(callback) {
			/*
			 * Sync just fetches the latest data from Khan Academy and Firebase, and compares it.
			 * If the data does from each source does not match, we add anything that needs to be added, and delete anything that needs to be deleted (deleting has not been implemented yet).
			 * We have two arrays of data; kaData and fbData.
			 * We loop through every item in both, to determine what doesn't exist in the opposite source.
			 * Originally authored by Gigabyte Giant
			 * TODO: Perform added/deleted checking on contest entries.
			 */
			var completed = {
				firebase: false,
				khanacademy: false
			};

			var addedContests = [];
			var removedContests = [];

			var kaData;
			var fbData;

			KA_API.getContests(function(response) {
				kaData = response;
				completed.khanacademy = true;
			});

			this.getStoredContests(function(response) {
				fbData = response;
				completed.firebase = true;
			});

			var recievedData = setInterval(function() {
				if (completed.firebase && completed.khanacademy) {
					clearInterval(recievedData);
					for (kaContest in kaData) {
						console.log(kaData[kaContest]);
						/* If this contest doesn't exist in the data recieve from Firebase, the contest must be new. */
						if (fbData[kaContest] === undefined) {
							addedContests.push(kaData[kaContest]);
						}
					}

					for (fbContest in fbData) {
						/* If this contest doesn't exist in the data recieved from Khan Academy, the contest must've been removed. */
						if (kaData[fbContest] === undefined) {
							removedContests.push(fbContest);
						}
					}

					var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/contests/");

					for (var a = 0; a < addedContests.length; a++) {
						// add contest to firebase
						console.log(addedContests[a].entries);
						var currContest = fbRef.child(addedContests[a].id);
						currContest.set(addedContests[a]);
					}

					for (var r = 0; r < removedContests.length; r++) {
						// remove contest from firebase
						var currContest = fbRef.child(removedContests[r]);
						currContest.set(null);
					}
				}
			}, 1000);
		}
	};
})();
