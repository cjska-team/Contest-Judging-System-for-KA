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

/* When the user clicks the login button, log them in: */
loginButton.on("click", function() {
    Contest_Judging_System.logUserIn(function(authData) {
        /* Hide login button when done: */
        loginButton.css("display", "none"):
    });
});