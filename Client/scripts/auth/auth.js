/*
 * This file contains all the authentication logic for the Khan Academy Contest Judging System
 */
window.Authentication_Logic = (function() {
	if (!Firebase || !jQuery) {
		console.log("[Authentication_Logic] Firebase and jQuery are both required!");
		return;
	}

	return {
		doesUserExist: function(authData, callback) {
			var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com");
			var usersRef = fbRef.child("users");

			var knownUsers = { };

			usersRef.orderByKey().on("child_added", function(snapshot) {
				knownUsers[snapshot.key()] = snapshot.val();
			});

			usersRef.once("value", function() {
				/* If this user's UID was found in knownUsers... */
				if (knownUsers.hasOwnProperty(authData.uid)) {
					/* ...pass true to our callback! */
					callback(true);
				} else {
					/* ...pass false into our callback. */
					callback(true);
				}
			});
		},
		userHasCorrectPermissions: function(uid, requiredPerms, callback) {
			var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com");
			var usersRef = fbRef.child("users");

			var thisUser = { };

			usersRef.orderByKey().equalTo(uid).on("child_added", function(snapshot) {
				thisUser = snapshot.val();
			});

			usersRef.once("value", function() {
				/* Pass a boolean value to our callback. The boolean is determined based on whether or not the user has the permission level that is required for a certain task. */
				callback(thisUser.permLevel === requiredPerms);
			});
		}
	};
})();