/*
 * Step 1: Check to make sure user is logged in (if not, leave page)
 * Step 2: Check to make sure logged in user, is an administrator (if not, leave page)
 * Step 3: Load all tools onto the page.
 * Step 4: [ ... ]
 */

/* Check if user is logged in. We'll be using cookies to store whether or not the user is logged in (unfortunately). */
if (Contest_Judging_System.getCookie("loggedInUser") === "") {
	console.log("User doesn't appear to be logged in.");
} else {
	/* User must be logged in! */
	var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/users/");

	var userID = Contest_Judging_System.getCookie("loggedInUser");

	/* Query Firebase */
	fbRef.orderByKey().on("child_added", function(data) { /* Do nothing here. */ });

	/* Once the query is done... */
	fbRef.once("value", function(data) {
		/* ...make sure the user exists in Firebase. If they do... */
		if (!data.val().hasOwnProperty(userID)) {
			/* User doesn't exist in Firebase, which means they cannot be an admin. */
			console.log("User ID \"" + userID + "\" doesn't exist in Firebase.");
		} else {
			/* ...make sure they're an admin. */
			if (data.val()[userID].permLevel !== 5) {
				/* User doesn't appear to be an admin. */
				console.log(data.val()[userID].name + " is not an admin!");
			}
		}
	});
}

/* Do stuff here! */