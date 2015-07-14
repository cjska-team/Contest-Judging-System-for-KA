/**
 * This code is not currently working, but is left here in case the code could be salvaged.
*/

//contestIds is the <div> that holds the contests.
var contestIds = document.getElementById("contestIds");
//This is the <main> element
var main = document.getElementsByTagName("main")[0];

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

//goBack is the button to go back to the contest list after someone has gone to view contest entries.
var goBack = document.getElementById("goBack");
//more is the button to get more contests
var more = document.getElementById("more");

//This is all of the contests retrieved by loadContests()
var contests;
function showContests() {
    /* This shows all of the contests */
    //Hide the goBack button
    goBack.style.display = "none";
    //Hide contestEntries
    entriesElems[curID].style.display = "none";
    //Show contestIds
    contestIds.style.display = "block";
    //Show more depending on if there are contests left
    if (contests.length > numContestsLoaded) more.style.display = "block";
    else more.style.display = "none";
    //Bind more to insertContests
    more.removeEventListener("click", insertContestEntries);
    more.addEventListener("click", insertContests);
}

//The number of inserted contests
var numContestsLoaded = 0;
function insertContests(event) {
    /*This inserts all of the contests*/
    //Loop through contests
    for (var i = numContestsLoaded; i < contests.length; i++) {
        //Break once we've inserted 30 more
        if (i === 30+numContestsLoaded) break;
        //Clone contestDiv
        var curDiv = contestDiv.cloneNode(true);
        //Set the src attribute to the <img>
        curDiv.childNodes[0].src = contests[i].thumb;
        //Put the title in the <span>.title
        curDiv.childNodes[1].textContent = contests[i].name;

        //Set curID
        curID = contests[i].id
        //Insert entries[curID] and convert to contests[i].entries to array.
        entries[curID] = [];
        for (var id in contests[i].entries) entries[curID].push(contests[i].entries[id]);
        //Insert numEntriesLoaded[curID] and entriesElems[curID]
        numEntriesLoaded[curID] = 0;
        entriesElems[curID] = document.createElement("div");
        //Make entriesElems initially invisible
        entriesElems[curID].style.display = "none";

        //Put the number of entries in the <span>.small
        curDiv.childNodes[2].textContent = entries[contests[i].id].length+" Entries";
        //Append into contestIds
        contestIds.appendChild(curDiv);
        //Bind showContestEntries([contest entries]) to the click event of curDiv
        curDiv.addEventListener("click", showContestEntries(contests[i].id));
    }
    //Show more if event exists and there are more contests to be loaded
    //Also, increment numContestsLoaded depending on the number of contests left
    if (contests.length > 30+numContestsLoaded) {
        if (event) more.style.display = "block";
        numContestsLoaded += 30;
    }
    else {
        if (event) more.style.display = "none";
        numContestsLoaded = contests.length;
    }
    //Increment numContestsLoaded
    numContestsLoaded += 30;
}

//All of the contest entries.
var entries = {};
//The elements containing the entries.
var entriesElems = {};
//The number of entries loaded
var numEntriesLoaded = {};
//The current id of the entries the viewer is watching
var curID;
function showContestEntries(id) {
    /*This returns a click event handler that shows the entries in a contest as represented by entries.*/
    return function event() {
        //Hide contestIds
        contestIds.style.display = "none";
        //Set curID
        curID = id;
        //If no entries have been loaded:
        if (!numEntriesLoaded[curID]) {
            //Insert entriesElems[curID] before more
            main.insertBefore(entriesElems[curID], more);
            //Insert the entries
            insertContestEntries();
        }
        //Show contestEntries
        entriesElems[curID].style.display = "block";
        //Show the goBack button
        goBack.style.display = "inline";
        //Show more depending on if there are entries left
        if (entries[curID].length > numEntriesLoaded[curID]) more.style.display = "block";
        else more.style.display = "none";
        //Bind more to insertContestEntries
        more.removeEventListener("click", insertContests);
        more.addEventListener("click", insertContestEntries);
    };
};

function insertContestEntries(event) {
    /*This inserts all of the contest entries*/
    //Loop through entries
    for (var i = numEntriesLoaded[curID]; i < entries[curID].length; i++) {
        if (i == 30+numEntriesLoaded[curID]) break;
        //Our parent will be an <a> linking to the contest
        var curElem = document.createElement("a");
        curElem.href = entries[curID][i].url;
        curElem.target = "_blank";
        //Clone contestCurIDs
        var curDiv = contestDiv.cloneNode(true);
        //Set src attribute of <img>
        curDiv.childNodes[0].src = entries[curID][i].thumb;
        //Insert title into the <span>.title
        curDiv.childNodes[1].textContent = entries[curID][i].name;
        //Put the number of votes in the <span>.small
        curDiv.childNodes[2].textContent = entries[curID][i].votes+" Votes";
        //Insert curDiv into curElem
        curElem.appendChild(curDiv);
        //Insert curElem into contestIds
        entriesElems[curID].appendChild(curElem);
    }
    //Show more if event exists and there are more contests to be loaded
    //Increase numEntriesLoaded[curID] depending on the number of contests left.
    if (entries[curID].length > 30+numEntriesLoaded[curID]) {
        more.style.display = "block";
        numEntriesLoaded[curID] += 30;
    }
    else {
        more.style.display = "none";
        numEntriesLoaded[curID] = entries[curID].length;
    }
}

function loadContests() {
    /*This loads all of the contests*/
    //Tell the user to wait for it.
    contestIds.textContent = "Wait for it...";
    //Call sync() to get the contest data.
    KA_API.getContests(function(allContests) {
        //Set contests to allContests, but as an array;
        contests = [];
        for (var id in allContests) contests.push(allContests[id]);
        //Clear contestIds
        contestIds.textContent = "";
        //Insert the contests
        insertContests();
    });
};
//Call loadContests() at the beginning.
loadContests();
//Bind loadContests to goBack
goBack.addEventListener("click", showContests);
