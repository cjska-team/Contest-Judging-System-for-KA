//Get all of the stored contests from the Firebase database
Contest_Judging_System.getStoredContests(function(contests) {
    /* When the request is finished... */
        
    //Loop through contests
    for (var i in contests) {
        (function() {
            /* This is in a function wrapper so we don't lose the value of curr in the below function. */
            //The JSON object corresponding to this contest.
            var curr = contests[i];

            //Send an AJAX request to the URL containing data for this program.
            $.ajax({
                type: 'GET',
                url: 'http://www.khanacademy.org/api/labs/scratchpads/' + curr.id,
                async: true,
                complete: function(apiResponse) {
                    /* When done with AJAX request */
                    //http://getbootstrap.com/components/#media-default
                    programData = apiResponse.responseJSON;

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
                    imgLink.href = "https://khanacademy.org/cs/contest/" + curr.id;
                    imgLink.target = "_blank";
                    //Create the image that will go in our link
                    var mediaObject = document.createElement("img");
                    mediaObject.className = "media-object";
                    mediaObject.src = "https://khanacademy.org" + curr.img;
                    
                    //Create the div containing the body of contest info
                    var mediaBody = document.createElement("div");
                    mediaBody.className = "media-body";
                    //Create the div containing the contest heading
                    var mediaHeading = document.createElement("h4");
                    mediaHeading.className = "media-heading";
                    mediaHeading.textContent = curr.name;
                    //Create the div containing the contest details
                    var detailsDiv = document.createElement("div");
                    detailsDiv.className = "details";
                    detailsDiv.innerHTML = programData.description || "No description provided!";

                    //Put image inside link
                    imgLink.appendChild(mediaObject);
                    //Put link inside mediaLeftDiv
                    mediaLeftDiv.appendChild(imgLink);

                    //Put heading inside body
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
                    document.querySelector("#contests").appendChild(rowDiv);
                    
                    //Now that we're done, add the done propery to curr so that the below setTimeout() function will know.
                    curr.done = true;
                }
            });
        })();
    }

    //We check if we're done with the above AJAX requests every second.
    var finishedTimeout = setTimeout(function() {
        //Make sure data has been retreived for all contests. If not, return
        for (i in contests) if (contests.hasOwnProperty("done")) return;

        //If we're done, get rid of the loading screen and stop checking if we're done.
        clearTimeout(finishedTimeout);
        $("#loading").css("display", "none");
    });
});