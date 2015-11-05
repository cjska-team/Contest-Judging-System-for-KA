var CJS = require("../backend/contest_judging_sys.js");

let fbAuth = CJS.fetchFirebaseAuth();

/**
 * createContestControl(controlData)
 * Creates a button using the data specified, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @contributors Darryl Yeo (2015)
 * @param {Object} controlData: The JSON object containing the data for the control (such as display text and where the control should link to)
 * @returns {jQuery} contestControl: The jQuery object containing the newly created contest control
 */
var createContestControl = function(controlData) {
    return $("<a>")
        .addClass("waves-effect waves-light amber darken-2 btn contest-control")
        .text(controlData.text)
        .attr("href", (controlData.link === undefined ? null : controlData.link));
};

/**
 * createContestDetails(contestData)
 * Creates a "contest details" div, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @contributors Darryl Yeo (2015)
 * @param {Object} contestData: A JSON object containing the data for a contest.
 * @returns {jQuery} contestDetails: The jQuery object containing the "contest details" div.
 */
var createContestDetails = function(contestData) {
    return $("<div>")
        .addClass("col s12 m9")
        .append(
            $("<h5>").addClass("title").text(contestData.title)
        )
        .append(
            $("<div>")
                .addClass("description")
                .html(contestData.description)
        );
};

/**
 * createContestHolder(contestData)
 * Creates a "contest holder" div, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @contributors Darryl Yeo (2015)
 * @param {Object} contestData: A JSON object containing the data for a contest.
 * @returns {jQuery} contestHolder: The jQuery object containing the "contest holder" div.
 */
var createContestHolder = function(contestData) {
    var contestHolder = $("<div>").addClass("contest section").attr("id", contestData.id)
        .append(
            createContestDetails(contestData)
        )
        .append(
            $("<div>").addClass("col s12 m3")
                .append(
                    $("<div>").addClass("center")
                        .append(
                            $("<img>")
                                .attr("src", contestData.thumbnail)
                                .addClass("img-responsive contest-thumbnail")
                        )
                        .append(
                            createContestControl({
                                text: "View Entries",
                                link: "contest.html?contest=" + contestData.id
                            })
                        )
                )
        );

    CJS.getPermLevel(function(permLevel) {
        if (permLevel >= 5) {
            $("#" + contestData.id + " .center").append(
                createContestControl({
                    text: "View Leaderboard",
                    link: "leaderboard.html?contest=" + contestData.id
                })
            );
        }
    });

    return contestHolder;
};

var setupPage = function(contestData) {
    if (fbAuth === null) {
        $("#authBtn").text("Hello, guest! Click me to login.");
    } else {
        $("#authBtn").text(`Welcome, ${CJS.fetchFirebaseAuth().google.displayName}! (Not you? Click here)`);
    }

    for (let cid in contestData) {
        let contest = contestData[cid];

        $("#contests").append(
            $("<div>").addClass("row")
                .append(
                    createContestHolder({
                        id: contest.id,
                        title: contest.name,
                        description: (contest.desc === "" ? "No description provided." : contest.desc),
                        thumbnail: "https://www.khanacademy.org/" + contest.img
                    })
                )
        )
        .append(
            $("<div>").addClass("divider")
        );
    }
};

CJS.fetchContests(setupPage);

$("#authBtn").on("click", function(evt) {
    evt.preventDefault();

    if (fbAuth === null) {
        CJS.authenticate();
    } else {
        CJS.authenticate(true);
    }
});
