/* If we don't find the contest parameter in the URL, tell the user to specify one, and navigate one page back in their history. */
if (window.location.search.indexOf("?contest=") === -1) {
	alert("Please specify a Contest ID!");

	window.history.back();
}

/* Find the contest ID that was specified in the URL */
var contestId = window.location.href.split("?contest=")[1];

/* Log the Contest ID that we found, to the console. */
console.log("Contest ID found! " + contestId);

// TODO: Load x of the top entries for this contest.