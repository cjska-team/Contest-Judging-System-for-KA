var CJS = require("../backend/contest_judging_sys.js");
var helpers = require("../generalPurpose.js");

let fbAuth = CJS.fetchFirebaseAuth();
let urlParams = helpers.getUrlParams(window.location.href);

var contestId = null;

if (urlParams.hasOwnProperty("contest")) {
    contestId = urlParams.contest;
} else {
    alert("Please specify a Contest ID!");
    window.history.back();
}

var createEntry = function(entry) {
    return $("<div>")
        .append(
            $("<img>").attr("src", "https://www.khanacademy.org/" + entry.thumb)
        )
        .append(
            $("<h3>").text(entry.name)
        );
};

var setupPage = function() {
    if (fbAuth === null) {
        $("#authBtn").text("Hello, guest! Click me to login.");
    } else {
        $("#authBtn").text(`Welcome, ${CJS.fetchFirebaseAuth().google.displayName}! (Not you? Click here)`);
    }

    CJS.loadXContestEntries(contestId, function(response) {
        for (let entryId in response) {
            let thisEntry = response[entryId];

            $("#entries")
                .append(createEntry(thisEntry))
                .append(
                    $("<div>").addClass("divider")
                );
        }
    }, 30);
};

setupPage();

$("#authBtn").on("click", function(evt) {
    evt.preventDefault();

    if (fbAuth === null) {
        CJS.authenticate();
    } else {
        CJS.authenticate(true);
    }
});
