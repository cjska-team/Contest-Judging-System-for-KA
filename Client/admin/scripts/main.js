/*
 * Step 1: Check to make sure user is logged in (if not, leave page)
 * Step 2: Check to make sure logged in user, is an administrator (if not, leave page)
 * Step 3: Load all tools onto the page.
 * Step 4: [ ... ]
 */

/* Check if user is logged in. We'll be using cookies to store whether or not the user is logged in (unfortunately). */
if (Contest_Judging_System.getCookie("isUserLoggedIn") === "yes" && Contest_Judging_System.getCookie("loggedInUser") !== "") {
	/* User must be logged in! */
	var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/users/");

	var userID = Contest_Judging_System.getCookie("loggedInUser");

	/* Check to make sure the logged in user is an admin. */
	/* TODO */
} else {
	/* User must not be logged in... ;( */
	/* TODO */
}