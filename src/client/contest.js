var CJS = require("../backend/contest_judging_sys.js");

let fbAuth = CJS.fetchFirebaseAuth();

var createEntryHolder = function(entryData) {
    return $("<h5>").addClass("center").text(entryData.name);
};

var setupPage = function() {
    CJS.loadXContestEntries("4688911017312256", function(response) {
        for (let entryId in response) {
            let thisEntry = response[entryId];

            $("#entries").append(createEntryHolder(thisEntry)).append($("<div>").addClass("divider"));
        }
    }, 30);
};

if (fbAuth === null) {
    CJS.authenticate();
} else {
    if (fbAuth === null) {
        $("#authBtn").text("Hello, guest! Click me to login.");
    } else {
        $("#authBtn").text("Welcome, {name}! (Not you? Click here)".replace("{name}", CJS.fetchFirebaseAuth().google.displayName));
    }

    setupPage();
}

$("#authBtn").on("click", function(evt) {
    evt.preventDefault();

    if (fbAuth === null) {
        CJS.authenticate();
    } else {
        CJS.authenticate(true);
    }
});
