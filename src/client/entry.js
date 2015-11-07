var CJS = require("../backend/contest_judging_sys.js");
var helpers = require("../helpers/helpers.js");

let urlParams = helpers.general.getUrlParams(window.location.href);

var sizing = {
    width: 400,
    height: 400
};

function createRubricTab($tabList, rubric, kInd) {
    $tabList.append(
        $("<li>")
            .addClass("tab col options-tab")
            .attr("data-score-value", kInd)
            .append($("<a>")
                .text(rubric.keys[kInd])
                .attr("href", `rubric-${kInd}`)
                .click((evt) => {
                    let $thisElem = $(evt.toElement);
                    $tabList.tabs("select_tab", `rubric-${kInd}`);
                    console.log($thisElem.attr("data-score-value"));
                })
            )
    );
}

let controlFactories = {
    keys(rubric, elem) {
        let $tabList = $("<ul>").addClass("tabs judging-control options-control").attr("data-rubric-item", rubric.rubricItem);
        for (let kInd = 0; kInd < rubric.keys.length; kInd++) {
            createRubricTab($tabList, rubric, kInd);
        }
        elem.append($tabList);
        $tabList.tabs();
    },
    slider(rubric, elem) {
        console.log("Hey sliders!");
        elem.append(
            $("<p>")
                .addClass("range-field")
                .append(
                    $("<input>").attr({
                        "type": "range",
                        "min": rubric.min,
                        "max": rubric.max,
                        "value": rubric.min,
                        "step": 1
                    }).addClass("judging-control slider-control").attr("data-rubric-item", rubric.rubricItem)
                )
        );
    }
};

var createJudgingControl = function(rubric, type) {
    var elem = $("<div>")
        .append(
            $("<h5>").text(rubric.rubricItem.replace(/\_/g, " "))
                .addClass("judging-control-title")
        ).addClass("col l6 m6 s12 judging-control center-align");

    controlFactories[type](rubric, elem);

    return elem;
};

var setupPage = function() {
    CJS.getPermLevel(function(permLevel) {
        if (!urlParams.hasOwnProperty("contest") || !urlParams.hasOwnProperty("entry")) {
            alert("Contest ID and/or Entry ID not specified. Returning to previous page.");
            window.history.back();
        } else {
            let contestId = urlParams.contest.replace(/\#/g, "");
            let entryId = urlParams.entry;

            let iframeUrl = `https://www.khanacademy.org/computer-programming/contest-entry/${entryId}/embedded?buttons=no&editor=yes&author=no&width=${sizing.width}&height=${sizing.height}`;

            $("#preview").append(
                $("<iframe>").attr("src", iframeUrl).css("height", (sizing.height + 10) + "px").addClass("entry-frame")
            );

            if (permLevel >= 4) {
                var judgingControlsBox = $("#judgingControls");

                let $controlRow = $("<div>").addClass("row");
                judgingControlsBox.append($controlRow);

                CJS.getContestRubrics(contestId, function(rubrics) {
                    console.log(rubrics);

                    for (let rInd = 0; rInd < rubrics.Order.length; rInd++) {
                        let thisRubric = rubrics.Order[rInd];

                        var rubricType = "";

                        if (rubrics[thisRubric].hasOwnProperty("keys")) {
                            rubricType = "keys";
                        } else {
                            rubricType = "slider";
                        }

                        rubrics[thisRubric].rubricItem = thisRubric;

                        $controlRow.append(createJudgingControl(rubrics[thisRubric], rubricType));

                        if ($controlRow.children().length > 1) {
                            $controlRow = $("<div>").addClass("row");
                            judgingControlsBox.append($controlRow);
                        }
                    }
                });
            } else {
                $(".judgeOnly").hide();
            }
        }
    });

    CJS.fetchContest(urlParams.contest, (contestData) => {
        CJS.fetchContestEntry(urlParams.contest, urlParams.entry, (entryData) => {
            $(".entry-name").text(`${entryData.name}`);
            $(".contest-name").text(`Entry in ${contestData.name}`);
        }, ["name"]);
    }, ["name"]);
};

helpers.authentication.setupPageAuth("#authBtn", CJS);
$(".judge-next-control").hide();
setupPage();

$(".submit-score-control").on("click", (evt) => {
    evt.preventDefault();

    let self = $(evt.toElement);

    $(self).addClass("disabled").text("Submitting scores...");
    $("#judgingControls *").prop("disabled", "true").addClass("disabled");

    var scoreData = {};

    $(".judging-control").each(function(index, item) {
        let $controlElem = $(item);
        let rubricItem = $controlElem.attr("data-rubric-item");

        console.log(rubricItem);

        if (rubricItem !== undefined) {
            if ($controlElem.attr("class").indexOf("options-control") !== -1) {
                let $selectedItem = $controlElem.find(".active");

                scoreData[rubricItem] = parseInt($selectedItem.parent().attr("data-score-value"), 10);
            } else if ($controlElem.attr("class").indexOf("slider-control") !== -1) {
                scoreData[rubricItem] = parseInt($controlElem.val(), 10);
            }
        }
    });

    CJS.judgeEntry(urlParams.contest, urlParams.entry, scoreData, function(error) {
        if (error) {
            alert(error);
            return;
        }

        $("#judgingControls").css("opacity", "0.4");

        $(self).text("Scores submitted!");

        $(".judge-next-control").show();
    });
});

$(".reload-entry-control").on("click", () => {
    $(".entry-frame").attr("src", $(".entry-frame").attr("src"));
});

$(".set-dimensions-control").on("click", () => {
    sizing.width = parseInt($("[name=width]").val(), 10);
    sizing.height = parseInt($("[name=height]").val(), 10);

    console.log(`https://www.khanacademy.org/computer-programming/contest-entry/${urlParams.entry}/embedded?buttons=no&editor=yes&author=no&width=${sizing.width}&height=${sizing.height}`);

    $(".entry-frame").attr("src", `https://www.khanacademy.org/computer-programming/contest-entry/${urlParams.entry}/embedded?buttons=no&editor=yes&author=no&width=${sizing.width}&height=${sizing.height}`);
});

$(".judge-next-control").on("click", () => {
    CJS.fetchContestEntries(urlParams.contest, function(nextEntry) {
        window.location.href = `entry.html?contest=${urlParams.contest}&entry=${nextEntry[0]}`;
    }, 1, false);
});