/**
 * createContestHolder(contestData)
 * Creates a "contest holder" div, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @param {Object} contestData: A JSON object containing the data for a contest.
 * @returns {jQuery} contestHolder: The jQuery object containing the "contest holder" div.
 * @todo (GigabyteGiant): Modify this function to use any data that gets passed in via the "contestData" object.
 */
var createContestHolder = function(contestData) {
    // Begin Card Root
    var contestHolder = $("<div>").addClass("card").addClass("contest")
        // Begin Card Image
        .append(
            $("<div>").addClass("card-image").addClass("center")
                .append(
                    $("<img>").attr("src", "http://newlitfromeurope.org/wp-content/uploads/2015/05/placeholder1.gif").css("width", "200px")
                )
                .append(
                    $("<span>").addClass("card-title").addClass("amber").addClass("lighten-2")
                        .text("Contest: Some contest")
                )
        )
        // End Card Image
        // Begin Card Content
        .append(
            $("<div>").addClass("card-content")
                .append(
                    $("<p>").text("This is the description for some contest...")
                )
        )
        // End Card Content
        // Begin Card Action
        .append(
            $("<div>").addClass("card-action").addClass("center")
                .append(
                    $("<a>").attr("href", "#").text("All Entries")
                )
                .append(
                    $("<a>").attr("href", "#").text("Leaderboard")
                )
        );
        // End Card Action
    // End Card Root

    return contestHolder;
};

/**
 * createColumn()
 * Creates a materialize column div, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @returns {jQuery} columnElement: The jQuery object containing the materialize column div.
 */
var createColumn = function() {
    // Begin Column
    var columnElement = $("<div>")
        .addClass("col").addClass("s12").addClass("m12");
    // End Column

    return columnElement;
};

var setupPage = function() {
    for (var i = 0; i < 32; i++) {
        $(".row").append(
            createColumn()
                .append(createContestHolder())
        );
    }
};

setupPage();
