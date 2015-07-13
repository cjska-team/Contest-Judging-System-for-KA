//contestIds is the <div> that holds the contests.
var contestIds = document.getElementById("contestIds");
//This is a template for a contest represented as a <div>
var contestDiv = document.createElement("div");
//Give the <div> .contest
contestDiv.className = "contest";
//Put an <img> inside of the <div>
contestDiv.appendChild(document.createElement("img"));
//Put an <span>.title inside of the <div>
var title = document.createElement("span");
title.className = "title";
contestDiv.appendChild(title);
//Put a <span>.small inside of the <div> (for number of entries/votes)
var small = document.createElement("span");
small.className = "small";
contestDiv.appendChild(small);

function showContestEntries(entries) {
    /*This returns a click event handler that shows the entries in a contest as represented by entries.*/
    return function event() {
        //Clear contestIds
        contestIds.textContent = "";
        //Loop through entries
        for (var i = 0; i < entries.length; i++) {
            //Our parent will be an <a> linking to the contest
            var curElem = document.createElement("a");
            curElem.href = entries[i].url;
            curElem.target = "_blank";
            //Clone contestIds
            var curDiv = contestDiv.cloneNode(true);
            //Set src attribute of <img>
            curDiv.childNodes[0].src = entries[i].thumb;
            //Insert title into the <span>.title
            curDiv.childNodes[1].textContent = entries[i].name;
            //Put the number of votes in the <span>.small
            curDiv.childNodes[2].textContent = entries[i].votes+" Votes";
            //Insert curDiv into curElem
            curElem.appendChild(curDiv);
            //Insert curElem into contestIds
            contestIds.appendChild(curElem);
        }
    };
};

function loadContests() {
    /*This loads all of the contests*/
    //Tell the user to wait for it.
    contestIds.textContent = "Wait for it...";
    //Call sync() to get the contest data.
    sync(function(contests) {
        //Clear contestIds
        contestIds.textContent = "";
        //Loop through contests
        for (var i = 0; i < contests.length; i++) {
            //Clone contestDiv
            var curDiv = contestDiv.cloneNode(true);
            //Set the src attribute to the <img>
            curDiv.childNodes[0].src = contests[i].thumb;
            //Put the title in the <span>.title
            curDiv.childNodes[1].textContent = contests[i].name;
            //Put the number of entries in the <span>.small
            curDiv.childNodes[2].textContent = contests[i].entries.length+" Entries";
            //Append into contestIds
            contestIds.appendChild(curDiv);
            //Bind showContestEntries([contest entries]) to the click event of curDiv
            curDiv.addEventListener("click", showContestEntries(contests[i].entries));
        }
    });
};
//Call loadContests() at the beginning.
loadContests();
