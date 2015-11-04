var CJS = require("../backend/contest_judging_sys.js");

let fbAuth = CJS.fetchFirebaseAuth();

var createEntryHolder = function(entryData) {
    return $("<h5>").addClass("center").text(entryData.name);
};

var setupPage = function() {
    if (fbAuth === null) {
        $("#authBtn").text("Hello, guest! Click me to login.");
    } else {
        $("#authBtn").text(`Welcome, ${CJS.fetchFirebaseAuth().google.displayName}! (Not you? Click here)`);
    }

    CJS.loadXContestEntries("4688911017312256", function(response) {
        for (let entryId in response) {
            let thisEntry = response[entryId];

            $("#entries").append(createEntryHolder(thisEntry)).append($("<div>").addClass("divider"));
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
