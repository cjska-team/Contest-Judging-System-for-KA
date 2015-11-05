var CJS = require("../backend/contest_judging_sys.js");
var helpers = require("../generalPurpose.js");

let fbAuth = CJS.fetchFirebaseAuth();
let urlParams = helpers.getUrlParams(window.location.href);

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
        let $tabList = $("<ul>").addClass("tabs judging-control options-control");
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
                        "step": 0.1
                    }).addClass("judging-control slider-control")
                )
        );
    }
}

var createJudgingControl = function(rubric, type) {
    var elem = $("<div>")
        .append(
            $("<h5>").text(rubric.displayText)
                .addClass("judging-control-title")
        ).addClass("col l6 m6 s12 judging-control center-align");

    controlFactories[type](rubric, elem);

    return elem;
};

var setupPage = function() {
    if (fbAuth === null) {
        $("#authBtn").text("Hello, guest! Click me to login.");
    } else {
        $("#authBtn").text(`Welcome, ${CJS.fetchFirebaseAuth().google.displayName}! (Not you? Click here)`);
    }

    CJS.getPermLevel(function(permLevel) {

        console.log(urlParams);

        if (!urlParams.hasOwnProperty("contest") || !urlParams.hasOwnProperty("entry")) {
            alert("Contest ID and/or Entry ID not specified. Returning to previous page.");
            window.history.back();
        } else {
            let contestId = urlParams.contest.replace(/\#/g, "");
            let entryId = urlParams.entry;

            var sizing = {
                width: 400,
                height: 400
            };

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

                        rubrics[thisRubric].displayText = thisRubric.replace(/\_/g, " ");

                        $controlRow.append(createJudgingControl(rubrics[thisRubric], rubricType));

                        if ($controlRow.children().length > 1) {
                            $controlRow = $("<div>").addClass("row");
                            judgingControlsBox.append($controlRow);
                        }
                    }
                });
            }
        }
    });

    CJS.fetchContest(urlParams.contest, (data) => {
        $(".contest-name").text(`Entry in ${data.name}`);
    }, ["name"]);
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
