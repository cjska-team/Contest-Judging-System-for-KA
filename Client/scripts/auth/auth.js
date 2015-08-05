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

loginButton.on("click", function() {
	var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com");

	fbRef.authWithOAuthPopup("google", function(error, authData) {
		if (error) {
			alert("An error occured. Please try again later.");
			console.log(error);
		} else {
			loginButton.css("display", "none");
		}
        /* This makes Firebase remember the login for 30 days (which has been set as the default in Firebase). */
	}, {remember: "default"});
});