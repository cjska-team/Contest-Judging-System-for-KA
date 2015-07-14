/***
 * This file is where all the general purpose, reusable code should go!
***/

/* This function can be used to inject scripts into pages. */
var includeFunc = function(path) {
	var scriptTag = document.createElement("script");
	scriptTag.src = path;

	document.body.appendChild(scriptTag);

	return scriptTag;
};

window.Contest_Judging_System = (function() {
	/* jQuery and Firebase are both dependencies for this project. If we don't have them, exit the function immediately. */
	if (!jQuery || !Firebase || !window.KA_API) return; // TODO: If a project dependency doesn't exist, go ahead an inject it.

	/* Everything from this namespace will be placed in the object that is returned. */
	return {
		/* Puts the script injection function inside of this namespace. */
		include: includeFunc,
		/* Get's all the contests that we have stored on Khan Academy, and passes them into a callback function. */
		getStoredContests: function(callback) {
			var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/contests/");

			/* An array to hold all the data from Firebase. */
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

			/* Currently not used. Might be re-implemented in the future. */
			var addedContests = [];
			var removedContests = [];

			var kaData;
			var fbData;

			/* Get all the contests from Khan Academy. */
			KA_API.getContests(function(response) {
				kaData = response;
				completed.khanacademy = true;
			});

			/* Get all of the known contests from Firebase */
			this.getStoredContests(function(response) {
				fbData = response;
				completed.firebase = true;
			});

			/* Create a new reference to Firebase, to use later on when pushing contests to Firebase. */
			var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/contests/");

			/* Wait until data has been recieved from Firebase and Khan Academy, then push new(er) data to Firebase. */
			var recievedData = setInterval(function() {
				if (completed.firebase && completed.khanacademy) {
					clearInterval(recievedData);
					fbRef.set(kaData);
				}
			}, 1000);
		}
	};
})();