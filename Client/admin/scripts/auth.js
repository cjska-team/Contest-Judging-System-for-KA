/*
 * Step 1: Check to make sure user is logged in (if not, leave page)
 * Step 2: Check to make sure logged in user, is an administrator (if not, leave page)
 * Step 3: Load all tools onto the page.
 */
/* The data we have on the current user. */
var userData;
/* True iff we're done with the auth checks. */
var authChecksDone = false;

/* Check if user is logged in using Firebase. */
var fbAuth = Contest_Judging_System.getFirebaseAuth();
if (fbAuth === null) {
	/* Let the user know that we're leaving the page. */
	alert("You don't appear to be logged in! Leaving page.");
	window.location.assign("../index.html");
} else {
    /* Connect to Firebase */
	var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/users/");
    /* Get the User ID */
	var userID = fbAuth.uid;

	/* Query Firebase */
	fbRef.orderByKey().on("child_added", function(data) { /* Do nothing here. */ });

	/* Once the query is done... */
	fbRef.once("value", function(data) {
        /* NOTE: We need to keep this case in despite the fixed Client/scripts/auth.js because there might be testers (like Noble) that log themselves in but then forget to add themselves to Firebase. */
        /* ...make sure the user exists in Firebase. If they don't: */
        if (!data.hasChild(userID)) {
            /* User doesn't exist in Firebase, which means they cannot be an admin. Therefore, set them in Firebase with lowest possible permissions. */
            fbRef.child(userID).set({
                name: fbAuth.google.displayName,
                permLevel: 1
            });
            /* Let the user know that we're leaving the page. */
            alert("You're logged in, but we don't know who you are! Leaving page.");
            window.location.assign("../index.html");
        }
        /* Otherwise, if they do exist in Firebase: */
        else {
            /* Set userData: */
            userData = data.val()[userID];
            /* ...make sure they're an admin. */
            if (userData.permLevel !== 5) {
                /* User doesn't appear to be an admin. */
                /* Let the user know that we're leaving the page. */
                alert("You do not have admin permissions! Leaving page.");
                window.location.assign("../index.html");
            }
        }

		/* Once everything is done, set authChecksDone to true, that way we can move to the next step. */
		authChecksDone = true;
        /* Make sure no errors are silenced. */
	}, Contest_Judging_System.logError);
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
		document.getElementById("welcomeMessage").textContent = document.getElementById("welcomeMessage").textContent.replace("{{name}}", userData.name);
	}
}, 1000);