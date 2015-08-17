/* This is the loading element that tells the user to wait. */
var loadingDiv = document.querySelector("#loading");
/* This is the contests element that shows info on all of the contests. */
var contestsDiv = document.querySelector("#contests");

/* This is all of the <div>s representing an individual contest. */
var indContestDivs = [];
/* This is the button that displays more contests. */
var moreContestsBtn = document.querySelector("#more-contests");
/* This is the number of contests we've displayed. */
var numContestsDisplayed = 0;
function displayContests() {
    /* Displays 10 more contests */
    /* This is the number of contests we'll have displayed when we're done. */
    var shouldBeDisplayed = numContestsDisplayed + 10;
    /* Make sure we don't display more contests then there are! */
    if (shouldBeDisplayed > indContestDivs.length) shouldBeDisplayed = indContestDivs.length;
    /* Append more contests into contestsDiv and increment numContestsDisplayed each time. */
    for (; numContestsDisplayed < shouldBeDisplayed; numContestsDisplayed++) contestsDiv.appendChild(indContestDivs[numContestsDisplayed]);
    /* Hide moreContestsBtn when there are no more contests. */
    if (numContestsDisplayed == indContestDivs.length) moreContestsBtn.style.display = "none";
    /* Otherwise, show it. */
    else moreContestsBtn.style.display = "block";
}

function finishRequest(contests) {
    /* When the request is finished... */

    //Loop through contests
    for (var i in contests) {
        /* The JSON object corresponding to this contest. */
        var curr = contests[i];
        
        /* When done with AJAX request */
        /* http://getbootstrap.com/components/#media-default */

        /* Create row for this contest */
        var rowDiv = document.createElement("div");
        rowDiv.className = "row";
        /* Create div inside rowDiv for this contest */
        var contestDiv = document.createElement("div");
        contestDiv.className = "contest";
        /* Create div inside contestDiv */
        var mediaDiv = document.createElement("div");
        mediaDiv.className = "media";

        /* Create div containing link and image */
        var mediaLeftDiv = document.createElement("div");
        mediaLeftDiv.className = "media-left";
        /* Create the link to the contest */
        var imgLink = document.createElement("a");
        imgLink.href = "https://www.khanacademy.org/computer-programming/contest/" + curr.id;
        /* Create the image that will go in our link */
        var mediaObject = document.createElement("img");
        mediaObject.className = "media-object";
        mediaObject.src = "https://www.khanacademy.org" + curr.img;

        var viewEntriesBtn = document.createElement("a");
        viewEntriesBtn.className = "btn btn-sm btn-primary center-block viewEntries";
        viewEntriesBtn.textContent = "View 30 Random Entries";
        viewEntriesBtn.href = "contest.html?contest=" + curr.id + "&entries=30";

        var viewAllEntriesBtn = document.createElement("a");
        viewAllEntriesBtn.className = "btn btn-sm btn-primary center-block";
        viewAllEntriesBtn.textContent = "View all " + curr.entryCount + " Entries";
        viewAllEntriesBtn.href = "contest.html?contest=" + curr.id + "&entries=all&includeJudged";

        var viewLeaderboardBtn = document.createElement("a");
        viewLeaderboardBtn.className = "btn btn-sm btn-primary center-block";
        viewLeaderboardBtn.textContent = "Visit the leaderboard";
        viewLeaderboardBtn.href = "admin/leaderboard.html?contest=" + curr.id;

        /* Create the div containing the body of contest info */
        var mediaBody = document.createElement("div");
        mediaBody.className = "media-body";
        /* Create the div containing the contest heading */
        var mediaHeading = document.createElement("h4");
        mediaHeading.className = "media-heading";
        mediaHeading.textContent = curr.name;
        mediaHeading.innerHTML += " ";
        var mediaSmall = document.createElement("span");
        mediaSmall.className = "badge";
        mediaSmall.textContent = curr.entryCount + " entries";
        /* Create the div containing the contest details */
        var detailsDiv = document.createElement("div");
        detailsDiv.className = "details";
        detailsDiv.innerHTML = curr.desc || "No description provided!";

        /* Put image inside link */
        imgLink.appendChild(mediaObject);
        /* Put link inside mediaLeftDiv */
        mediaLeftDiv.appendChild(imgLink);
        /* Put button into mediaLeftDiv */
        if (curr.entryCount > 30) {
            mediaLeftDiv.appendChild(viewEntriesBtn);
        }
        mediaLeftDiv.appendChild(viewAllEntriesBtn);
        mediaLeftDiv.appendChild(viewLeaderboardBtn);

        /* Put heading inside body */
        mediaHeading.appendChild(mediaSmall);
        mediaBody.appendChild(mediaHeading);
        /* Put body inside detailsDiv */
        mediaBody.appendChild(detailsDiv);

        /* Put mediaLeftDiv and mediaBody inside mediaDiv */
        mediaDiv.appendChild(mediaLeftDiv);
        mediaDiv.appendChild(mediaBody);

        /* Put mediaDiv inside contestDiv */
        contestDiv.appendChild(mediaDiv);
        /* Put contestDiv inside rowDiv */
        rowDiv.appendChild(contestDiv);
        /* Put rowDiv inside contestDivs */
        indContestDivs.push(rowDiv);
    }

    /* Now we're done, so get rid of the loading screen. */
    loadingDiv.style.display = "none";
    /* Display more contests and make sure more contests are displayed each time moreContestsBtn is clicked. */
    displayContests();
    moreContestsBtn.addEventListener("click", displayContests);
}

/* Get all of the stored contests from the Firebase database and call finishRequest when done */
Contest_Judging_System.getStoredContests(finishRequest);