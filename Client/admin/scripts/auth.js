/*
 * Step 1: Check to make sure user is logged in (if not, leave page)
 * Step 2: Check to make sure logged in user, is an administrator (if not, leave page)
 * Step 3: Load all tools onto the page.
 */
/* The data we have on the current user. */
var userData;

/* Get the Firebase auth data: */
var fbAuth = Contest_Judging_System.getFirebaseAuth();
/* If they're not logged in, put them somewhere else: */
if (fbAuth === null) {
    alert("Please log in at the home page. Thanks! Leaving page.");
    window.location.assign("../index.html");
}
Contest_Judging_System.getUserData(fbAuth.uid, function(userDataLocal) {
    /* Set userData: */
    userData = userDataLocal;
    /* Make sure they're an admin. */
    if (userData.permLevel < 5) {
        /* User doesn't appear to be an admin. */
        /* Let the user know that we're leaving the page. */
        alert("You do not have admin permissions! Leaving page.");
        window.location.assign("../index.html");
    }

    /* Stop loading and show the content. */
    document.querySelector("#loading").style.display = "none";
    document.querySelector(".hideWhileAuthCheck").style.display = "block";

    /* Stop checking if we're done with our authentication checks. */
    console.log("Authenticated!");

    /* Welcome the user to the admin dashboard. */
    document.getElementById("welcomeMessage").textContent = document.getElementById("welcomeMessage").textContent.replace("{{name}}", userData.name);
});
