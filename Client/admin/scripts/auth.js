/*
 * Step 1: Check to make sure user is logged in (if not, leave page)
 * Step 2: Check to make sure logged in user, is an administrator (if not, leave page)
 * Step 3: Load all tools onto the page.
 * Step 4: [ ... ]
 */
var userData;
var authChecksDone = false;

document.querySelector(".hideWhileAuthCheck").style.display = "none";

/* Check if user is logged in. We'll be using cookies to store whether or not the user is logged in (unfortunately). */
if (Contest_Judging_System.getCookie("loggedInUser") === "") {
	/* Let the user know that we're leaving the page. */
	alert("You don't appear to be logged in! Leaving page.");
	window.location.assign("../index.html");
} else {
	var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/users/");

	var userID = Contest_Judging_System.getCookie("loggedInUser");

	/* Query Firebase */
	fbRef.orderByKey().on("child_added", function(data) { /* Do nothing here. */ });

	/* Once the query is done... */
	fbRef.once("value", function(data) {
		/* ...make sure the user exists in Firebase. If they do... */
		if (!data.val().hasOwnProperty(userID)) {
			/* User doesn't exist in Firebase, which means they cannot be an admin. */
			/* Let the user know that we're leaving the page. */
			fbRef.child(userID).set({
				name: Contest_Judging_System.getCookie("loggedInUsername"),
				permLevel: 1
			});
			alert("User ID \"" + userID + "\" doesn't exist in Firebase. Leaving page.");
			window.location.assign("../index.html");
		} else {
			/* ...make sure they're an admin. */
			if (data.val()[userID].permLevel !== 5) {
				/* User doesn't appear to be an admin. */
				/* Let the user know that we're leaving the page. */
				alert("You do not have admin permissions! Leaving page.");
				window.location.assign("../index.html");
			}
		}

		userData = data.val()[userID];
		/* Once everything is done, set authChecksDone to true, that way we can move to the next step. */
		authChecksDone = true;
	});
}

/* Check if we're done with our authentication checks every second. */
var authChecks = setInterval(function() {
    /* If we're done with our authentication checks: */
	if (authChecksDone) {
        /* Stop loading and show the content. */
		document.querySelector("#loading").style.display = "none";
		document.querySelector(".hideWhileAuthCheck").style.display = "block";
        
        /* Stop checking if we're done with our authentication checks. */
		clearInterval(authChecks);
		console.log("Authenticated!");

		/* Welcome the user to the admin dashboard. */
		document.getElementById("welcomeMessage").innerHTML = document.getElementById("welcomeMessage").innerHTML.replace("{{name}}", userData.name);
	}
}, 1000);