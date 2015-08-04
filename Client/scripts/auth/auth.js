/*
 * This file contains all the authentication logic for the Khan Academy Contest Judging System
 */
if (Contest_Judging_System.getCookie("loggedInUser") === "") {
	$(".login").css("display", "block");
} else {
	console.log("You're logged in! Yay!");
}

$(".login").on("click", function() {
	var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com");

	fbRef.authWithOAuthPopup("google", function(error, authData) {
		if (error) {
			alert("An error occured. Please try again later.");
			console.log(error);
		} else {
			Contest_Judging_System.setCookie("loggedInUser", authData.uid);
			Contest_Judging_System.setCookie("loggedInUsername", authData.google.displayName);
			$(this).css("display", "none");
		}
	}, { remember: "sessionOnly" });
});