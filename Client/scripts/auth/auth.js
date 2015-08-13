/*
 * This file contains all the authentication logic for the Khan Academy Contest Judging System
 */
/* The login button: */
var loginButton = $(".login");
var logoutButton = $(".logout");

/* Connect to Firebase: */
var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/");
/* The reason we use fbRef.onAuth() here instead of just keeping track of things with the loginButton and logoutButton is because after the loginButton is clicked, the page refreshes, but the user isn't logged in until a few seconds after that page refresh. */
fbRef.onAuth(function(authData) {
    if (authData == null) {
        /* If they're not logged in, show the login button: */
        loginButton.css("display", "block");
        logoutButton.css("display", "none");
        /* Also, hide the stuff needing authentication: */
        $(".hideWhileNotAuthed").css("display", "none");
    } else {
        /* Get the user data to add them to Firebase. We're not actually going to do anything in the callback. */
        Contest_Judging_System.getUserData(authData.uid, function(authData, userData) {});
        /* If they are logged in, then show the logout button: */
        loginButton.css("display", "none");
        logoutButton.css("display", "block");
        /* Also, show the stuff needing authentication: */
        $(".hideWhileNotAuthed").css("display", "block");
    }
});

/* When the user clicks the login button, log them in: */
loginButton.on("click", function() {
    /* Pass an empty callback because .onAuth() will take care of everything once they're logged in: */
    Contest_Judging_System.logUserIn("redirect", function(authData) {});
});

/* When the user clicks the logout button, log them out: */
/* (Don't pass in fbRef.unauth() itself in so MouseEvent will not be passed into fbRef.unauth().) */
logoutButton.on("click", function() {
    fbRef.unauth()
});
