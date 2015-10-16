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
    }, 10);
};

if (fbAuth === null) {
    CJS.authenticate();
} else {
    setupPage();
}
