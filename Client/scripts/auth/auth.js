/*
 * This file contains all the authentication logic for the Khan Academy Contest Judging System
 */
/* The login button: */
var loginButton = $(".login");
/* Check if the user is logged in and make sure the login button is available if they're not. */
var fbAuth = Contest_Judging_System.getFirebaseAuth();
if (fbAuth == null) {
	loginButton.css("display", "block");
} else {
	console.log("You're logged in! Yay!");
}

/* When the user clicks the login button... */
loginButton.on("click", function() {
    /* Connect to Firebase: */
	var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com");

    /* Try to log the user in: */
	fbRef.authWithOAuthPopup("google", function(error, authData) {
        /* Error Handling: */
		if (error) {
			alert("An error occured. Please try again later.");
			console.log(error);
		} else {
            /* Update fbAuth */
            fbAuth = Contest_Judging_System.getFirebaseAuth();
            /* Add this user as someone with no permissions in Firebase if they don't already exist. */
            var usersRef = fbRef.child("users");
            usersRef.on("value", function(snapshot) { 
                if (!snapshot.hasChild(fbAuth.uid)) {
                    usersRef.child(fbAuth.uid).set({
                        name: fbAuth.google.displayName,
                        permLevel: 1
                    });
                    console.log("Added new user in Firebase!");
                }
                console.log("Logged user in!");
                /* When we're done, hide the login button. */
	     		loginButton.css("display", "none");
            });
		}
        /* This makes Firebase remember the login for 30 days (which has been set as the default in Firebase). */
	}, {remember: "default"});
});