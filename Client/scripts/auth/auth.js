/*
 * This file contains all the authentication logic for the Khan Academy Contest Judging System
 */
/* The login button: */
var loginButton = $(".login");
var logoutButton = $(".logout");
/* Check if the user is logged in and make sure the login button is available if they're not. */
var fbAuth = Contest_Judging_System.getFirebaseAuth();
if (fbAuth == null) {
	loginButton.css("display", "block");
} else {
	console.log("You're logged in! Yay!");
	logoutButton.css("display", "block");
	document.querySelector(".hideWhileNotAuthed").style.display = "block";
}

/* When the user clicks the login button, log them in: */
loginButton.on("click", function() {
    Contest_Judging_System.logUserIn(function(authData) {
        /* Hide login button when done: */
        loginButton.css("display", "none");
        logoutButton.css("display", "block");
		document.querySelector(".hideWhileNotAuthed").style.display = "block";
    });
});

logoutButton.on("click", function() {
	var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/");
	fbRef.unauth();

	logoutButton.css("display", "none");
	loginButton.css("display", "block");
});
