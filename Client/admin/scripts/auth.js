/*
 * Step 1: Check to make sure user is logged in (if not, leave page)
 * Step 2: Check to make sure logged in user, is an administrator (if not, leave page)
 * Step 3: Load all tools onto the page.
 */
/* The data we have on the current user. */
var userData;
/* True iff we're done with the auth checks. */
var authChecksDone = false;

Contest_Judging_System.logInAndGetUserData("popup", function(authData, userDataLocal) {
    /* Set userData: */
    userData = userDataLocal;
    /* Make sure they're an admin. */
    if (userData.permLevel < 5) {
        /* User doesn't appear to be an admin. */
        /* Let the user know that we're leaving the page. */
        alert("You do not have admin permissions! Leaving page.");
        window.location.assign("../index.html");
    }

    /* Once everything is done, set authChecksDone to true, that way we can move to the next step. */
    authChecksDone = true;
});

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
