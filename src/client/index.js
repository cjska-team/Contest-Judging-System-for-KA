/**
 * createContestControl(controlData)
 * Creates a button using the data specified, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @param {Object} controlData: The JSON object containing the data for the control (such as display text and where the control should link to)
 * @returns {jQuery} contestControl: The jQuery object containing the newly created contest control
 */
var createContestControl = function(controlData) {
    var contestControl = $("<a>")
        .addClass("waves-effect")
        .addClass("waves-light")
        .addClass("amber")
        .addClass("darken-2")
        .addClass("btn")
        .addClass("contest-control")
        .text(controlData.text)
        .attr("href", (controlData.link === undefined ? null : controlData.link));

    return contestControl;
};

/**
 * createContestDetails(contestData)
 * Creates a "contest details" div, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @param {Object} contestData: A JSON object containing the data for a contest.
 * @returns {jQuery} contestDetails: The jQuery object containing the "contest details" div.
 */
var createContestDetails = function(contestData) {
    var contestDetails = $("<div>")
        .addClass("col")
        .addClass("s9")
        .append(
            $("<h5>").text(contestData.title)
        )
        .append(
            $("<div>")
                .html(contestData.description)
        );

    return contestDetails;
};

/**
 * createContestHolder(contestData)
 * Creates a "contest holder" div, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @param {Object} contestData: A JSON object containing the data for a contest.
 * @returns {jQuery} contestHolder: The jQuery object containing the "contest holder" div.
 */
var createContestHolder = function(contestData) {
    var contestHolder = $("<div>").addClass("section")
        .append(
            $("<div>").addClass("col").addClass("s3")
                .append(
                    $("<img>").attr("src", contestData.thumbnail).addClass("responsive-img")
                )
                .append(
                    $("<div>").addClass("center")
                        .append(
                            createContestControl({
                                text: "View Entries"
                            })
                        )
                        .append(
                            createContestControl({
                                text: "Leaderboard"
                            })
                        )
                )
        )
        .append(
            createContestDetails(contestData)
        );

    return contestHolder;
};

var setupPage = function() {
    for (var i = 0; i < 32; i++) {
        $(".container").append(
            $("<div>").addClass("row")
                .append(
                    createContestHolder({
                        title: "Contest: Some contest",
                        description: "This is a contest. Do something, and win a prize!",
                        thumbnail: "http://newlitfromeurope.org/wp-content/uploads/2015/05/placeholder1.gif"
                    })
                )
        )
        .append(
            $("<div>").addClass("divider")
        );
    }
};

setupPage();