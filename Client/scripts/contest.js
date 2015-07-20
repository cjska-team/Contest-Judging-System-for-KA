/***
 * This file will contain all the scripts required for display entries to judges.
***/
/* If it doesn't look like there's a contest ID in the URL, show an alert, and go back one page. */
if (window.location.search.indexOf("?contest") === -1) {
	alert("Contest ID not found!");

	window.history.back();
}

/* Locate the contest ID in the URL, and store it for later use. */
var contestId = window.location.href.split("?contest=")[1];

/* Go ahead and find the div that we'll store all the entries in. */
var entriesList = document.querySelector(".media-list");

console.log("Contest found!");
console.log("Contest ID: " + contestId);

/* Hide elements that we've marked with the class "hideWhileLoad". */
$(".hideWhileLoad").css("display", "none");

/* Attempt to load a contest, based on the ID we found in the URL. */
Contest_Judging_System.loadContest(contestId, function(contest) {

	/* Randomly pick n entries, and then display them on the page. */
	Contest_Judging_System.get_N_Entries(10, contest.id, function(entries) {

		/* Setup the page */
		$("title").text(contest.name);
		$("#contestName").text(contest.name);
		$("#contestDescription").html("Description coming soon!");

		/* Add all entries to the page */
		for (var i in entries) {
			(function() {
				/* Instead of having to write entries[i] all the time, let's declare a variable that's a bit shorter. */
				var curr = entries[i];

				$.ajax({
					type: 'GET',
					url: "https://www.khanacademy.org/api/labs/scratchpads/" + curr.id,
					async: true,
					complete: function(response) {
						/* Create a list item element, and give it Bootstrap's "media" class. */
						var mediaListItem = document.createElement("li");
						mediaListItem.className = "media entry";

						/* Create a div element, and give it Bootstrap's "media-left" class. */
						var mediaLeftDiv = document.createElement("div");
						mediaLeftDiv.className = "media-left";

						/* Create a link element, and set it's href to the URL of this entry... */
						var aElem = document.createElement("a");
						// aElem.href = "https://www.khanacademy.org/computer-programming/entry/" + curr.id;
						aElem.href = "entry.html?contest=" + contestId + "&entry=" + curr.id;

						/* Create an image element and set it's src to this entry's thumbnail */
						var mediaObj = document.createElement("img");
						mediaObj.src = response.responseJSON.imageUrl;
						mediaObj.alt = "Entry thumbnail";

						/* Create a div element, and give it Bootstrap's "media-body" class. */
						var mediaBody = document.createElement("div");
						mediaBody.className = "media-body";

						/* Create a heading element (tier 4), and set it's text to this entry's name. */
						var mediaHeading = document.createElement("h4");
						mediaHeading.textContent = curr.name;

						/* Create a div that will hold more information about this entry */
						var infoDiv = document.createElement("div");
						infoDiv.className = "info";

						/* Create a heading element (tier 5), to mark the "Score" heading */
						var scoreHeading = document.createElement("h5");
						scoreHeading.textContent = "Score:";

						/* Create an unordered list element that will be used to display score information for this entry. */
						var scoreList = document.createElement("ul");

						/* Go through all the score information for this entry, and create a list item for it. */
						for (var rubric in curr.scores.rubric) {
							(function() {
								var currRubric = rubric;
								var val = curr.scores.rubric[rubric];

								console.log(val);

								Contest_Judging_System.getRubrics(function(rubrics) {
									var max = rubrics[currRubric].max;
									/* Credit to @NobleMushtak for the following idea. */
									var selectedRubric = currRubric.replace(/_/gi, " ");

									if (rubrics[currRubric].hasOwnProperty("keys")) {
										console.log(rubrics[currRubric].keys);
										val = rubrics[currRubric].keys[val];
										console.log("Value switched to a key!");

										var listItem = document.createElement("li");
										listItem.textContent = selectedRubric + ": " + val;

										scoreList.appendChild(listItem);
									} else {
										var listItem = document.createElement("li");
										listItem.textContent = selectedRubric + ": " + val + " out of " + max;
										scoreList.appendChild(listItem);
									}
								});
							})();
						}

						/* Append everything */
						infoDiv.appendChild(scoreHeading);
						infoDiv.appendChild(scoreList);
						aElem.appendChild(mediaObj);
						mediaLeftDiv.appendChild(aElem);
						mediaBody.appendChild(mediaHeading);
						mediaListItem.appendChild(mediaLeftDiv);
						mediaBody.appendChild(infoDiv);
						mediaListItem.appendChild(mediaBody);
						entriesList.appendChild(mediaListItem);
					}
				});
			})();
		}

		/* Hide the loading div and show items that were hidden during loading. */
		$("#loading").css("display", "none");
		$(".hideWhileLoad").css("display", "block");
	});
});