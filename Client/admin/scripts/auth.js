/*
 * Step 1: Check to make sure user is logged in (if not, leave page)
 * Step 2: Check to make sure logged in user, is an administrator (if not, leave page)
 * Step 3: Load all tools onto the page.
 */
/* The data we have on the current user. */
var userData;

function goBack() {
    /* This goes back to the URL the user came from or, if they didn't come from another URL or they came from the admin interface, goes back to defaultURL: */

    /* Get the portion of the URL that includes the admin interface: */
    var adminURL = "/Client/admin";
    /* Find where adminURL is in window.location.href: */
    var findAdminURL = window.location.href.indexOf(adminURL);
    /* Make findAdminURL the end of this portion, not the beginning: */
    findAdminURL += adminURL.length;
    
    /* If there's history to go back to and it's not the admin interface, go back: */
    if (document.referrer && document.referrer.substring(0, findAdminURL) != window.location.href.substring(0, findAdminURL)) {
        window.location.assign(document.referrer);
    }
    /* Otherwise, go back to the /Client/: */
    else {
        window.location.assign("../");
    }
}

/* Get the Firebase auth data: */
var fbAuth = Contest_Judging_System.getFirebaseAuth();
/* If they're not logged in, tell them that we're leaving this page and leave the page: */
if (fbAuth === null) {
    alert("Please log in at the home page. Thanks! Leaving page.");
    goBack();
}
/* Otherwise, get the user data: */
else {
    Contest_Judging_System.getUserData(fbAuth.uid, function(userDataLocal) {
        /* Set userData: */
        userData = userDataLocal;
        /* If they're not an admin, let the user know that we're leaving the page and leave the page: */
        if (userData.permLevel < 5) {
            alert("You do not have admin permissions! Leaving page.");
            goBack();
        }
        /* If they're an admin: */
        else {
            /* Stop loading and show the content. */
            $("#loading").css("display", "none");
            $(".hideWhileAuthCheck").css("display", "block");

            /* Stop checking if we're done with our authentication checks. */
            console.log("Authenticated!");

            /* Welcome the user to the admin dashboard. */
            var welcomeMessage = document.getElementById("welcomeMessage");
            welcomeMessage.textContent = welcomeMessage.textContent.replace("{{name}}", userData.name);
       }
    });
}