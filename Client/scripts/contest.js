/***
 * This file will contain all the scripts required for display entries to judges.
***/
$(function() {
	/* If it doesn't look like there's a contest ID in the URL, show an alert, and go back one page. */
	if (window.location.search.indexOf("?contest") === -1) {
		alert("Contest ID not found!");

		window.history.back();
	}

	/* Locate the contest ID in the URL, and store it for later use. */
	var contestId = window.location.href.split("?contest=")[1];

	/* Go ahead and find the div that we'll store all the entries in. */
	var entriesDiv = document.querySelector("#entries");

	console.log("Contest found!");
	console.log("Contest ID: " + contestId);

	/* Hide elements that we've marked with the class "hideWhileLoad". */
	$(".hideWhileLoad").css("display", "none");

	/* Attempt to load a contest, based on the ID we found in the URL. */
	Contest_Judging_System.loadContest(contestId, function(contest) {
		/* Instead of typing contest.entries all the time, let's allow ourselves to just type entries. */
		var entries = contest.entries;

		/* Setup the page */
		$("title").text(contest.name);
		$("#contestName").text(contest.name);
		$("#contestDescription").html("Description coming soon!");

		/* Add all entries to the page */
		for (var i in entries) {
			/* Instead of having to write entries[i] all the time, let's declare a variable that's a bit shorter. */
			var curr = entries[i];

			/* Create a div and give it Bootstrap's "row" class */
			var rowDiv = document.createElement("row");
			rowDiv.className = "row";

			/* Create a paragraph element that'll eventually hold a link to this entry */
			var paragraphElem = document.createElement("p");

			/* Create a link element and set it's text to the name of this entry */
			var aElem = document.createElement("a");
			aElem.textContent = curr.name;
			aElem.href = "https://www.khanacademy.org/computer-programming/entry/" + curr.id;

			/* Add the link element to our paragraph element */
			paragraphElem.appendChild(aElem);

			/* Add our paragraph element to our row div */
			rowDiv.appendChild(paragraphElem);

			/* Add our row div to the entries div */
			entriesDiv.appendChild(rowDiv);
		}

		/* Hide the loading div and show items that were hidden during loading. */
		$("#loading").css("display", "none");
		$(".hideWhileLoad").css("display", "block");
	});
}); 