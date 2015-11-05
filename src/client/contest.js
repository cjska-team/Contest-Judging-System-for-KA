var CJS = require("../backend/contest_judging_sys.js");
var helpers = require("../generalPurpose.js");

let fbAuth = CJS.fetchFirebaseAuth();
let urlParams = helpers.getUrlParams(window.location.href);

var numEntriesToLoad = 32;

var contestId = null;

if (urlParams.hasOwnProperty("contest")) {
    contestId = urlParams.contest;
} else {
    alert("Please specify a Contest ID!");
    window.history.back();
}

if (urlParams.hasOwnProperty("count")) {
    numEntriesToLoad = parseInt(urlParams.count, 10);
}

var createEntry = function(entry) {
    return $("<div>").attr("id", entry.id)
        .append(
            $("<img>").attr("src", "https://www.khanacademy.org/" + entry.thumb)
                .addClass("img-responsive entry-img")
        )
        .append(
            $("<p>").text(entry.name).addClass("entry-title center-align")
        )
        .addClass("col s12 m3 l3 center-align contest-entry")
        .click(() => {
            window.location.href = `entry.html?contest=${contestId}&entry=${entry.id}`;
        });
};

var setupPage = function() {
    if (fbAuth === null) {
        $("#authBtn").text("Hello, guest! Click me to login.");
    } else {
        $("#authBtn").text(`Welcome, ${CJS.fetchFirebaseAuth().google.displayName}! (Not you? Click here)`);
    }

    CJS.loadXContestEntries(contestId, function(response) {
        console.log(response);
        let numEntries = 0;
        let $entriesRow = $("<div>").addClass("row");
        $("#entries").append($entriesRow);

        for (let entryId in response) {
            numEntries += 1;
            let thisEntry = response[entryId];

            $entriesRow
                .append(createEntry(thisEntry));

            if (numEntries % 4 === 0) {
                $entriesRow = $("<div>").addClass("row");
                $("#entries").append($entriesRow);
            }
        }
    }, numEntriesToLoad);

    CJS.fetchContest(contestId, (data) => {
        $(".contest-name").text(`Entries for ${data.name}`);
    }, ["name"])
};

$(document).ready(setupPage);

$("#authBtn").on("click", function(evt) {
    evt.preventDefault();

    if (fbAuth === null) {
        CJS.authenticate();
    } else {
        CJS.authenticate(true);
    }
});
