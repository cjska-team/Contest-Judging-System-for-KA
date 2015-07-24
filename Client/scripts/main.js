//This is the loading element that tells the user to wait.
var loadingDiv = document.querySelector("#loading");
//This is the contests element that shows info on all of the contests.
var contestsDiv = document.querySelector("#contests");

function finishRequest(contests) {
    /* When the request is finished... */

    //Loop through contests
    for (var i in contests) {
        //The JSON object corresponding to this contest.
        var curr = contests[i];
        
        /* When done with AJAX request */
        //http://getbootstrap.com/components/#media-default

        //Create row for this contest
        var rowDiv = document.createElement("div");
        rowDiv.className = "row";
        //Create div inside rowDiv for this contest
        var contestDiv = document.createElement("div");
        contestDiv.className = "contest";
        //Create div inside contestDiv
        var mediaDiv = document.createElement("div");
        mediaDiv.className = "media";

        //Create div containing link and image
        var mediaLeftDiv = document.createElement("div");
        mediaLeftDiv.className = "media-left";
        //Create the link to the contest
        var imgLink = document.createElement("a");
        imgLink.href = "https://www.khanacademy.org/computer-programming/contest/" + curr.id;
        //Create the image that will go in our link
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
        viewAllEntriesBtn.href = "contest.html?contest=" + curr.id + "&entries=all";

        //Create the div containing the body of contest info
        var mediaBody = document.createElement("div");
        mediaBody.className = "media-body";
        //Create the div containing the contest heading
        var mediaHeading = document.createElement("h4");
        mediaHeading.className = "media-heading";
        mediaHeading.textContent = curr.name;
        var mediaSmall = document.createElement("small");
        mediaSmall.textContent = " (" + curr.entryCount + " entries)";
        //Create the div containing the contest details
        var detailsDiv = document.createElement("div");
        detailsDiv.className = "details";
        detailsDiv.innerHTML = curr.desc || "No description provided!";

        //Put image inside link
        imgLink.appendChild(mediaObject);
        //Put link inside mediaLeftDiv
        mediaLeftDiv.appendChild(imgLink);
        /* Put button into mediaLeftDiv */
        mediaLeftDiv.appendChild(viewEntriesBtn);
        mediaLeftDiv.appendChild(viewAllEntriesBtn);

        //Put heading inside body
        mediaHeading.appendChild(mediaSmall);
        mediaBody.appendChild(mediaHeading);
        //Put body inside detailsDiv
        mediaBody.appendChild(detailsDiv);

        //Put mediaLeftDiv and mediaBody inside mediaDiv
        mediaDiv.appendChild(mediaLeftDiv);
        mediaDiv.appendChild(mediaBody);

        //Put mediaDiv inside contestDiv
        contestDiv.appendChild(mediaDiv);
        //Put contestDiv inside rowDiv
        rowDiv.appendChild(contestDiv);
        //Put rowDiv inside the #contests div
        contestsDiv.appendChild(rowDiv);
    }


    //Now we're done, so get rid of the loading screen.
    loadingDiv.style.display = "none";
}

//Get all of the stored contests from the Firebase database and call finishRequest when done
Contest_Judging_System.getStoredContests(finishRequest);