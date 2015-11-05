var CJS = require("../backend/contest_judging_sys.js");
var helpers = require("../generalPurpose.js");

let fbAuth = CJS.fetchFirebaseAuth();

var createJudgingControl = function(rubric, type) {
    var elem = $("<div>")
        .append(
            $("<h4>").text(rubric.displayText)
        );

    switch (type) {
        case "keys":
            for (let kInd = 0; kInd < rubric.keys.length; kInd++) {
                elem.append(
                    $("<button>")
                        .addClass("btn waves-effect waves-light amber judgingBtn").attr("data-score-value", kInd).text(rubric.keys[kInd])
                        .click((evt) => {
                            let thisElem = evt.toElement;
                            console.log($(thisElem).attr("data-score-value"));
                        })
                );
            }
            break;
        case "slider":
            elem.append(
                $("<input>").attr("type", "range").attr("min", rubric.min).attr("max", rubric.max).attr("value", rubric.min)
                    .update((evt) => {
                        
                    })
            );
            break;
    }

    return elem;
};

var setupPage = function() {
    if (fbAuth === null) {
        $("#authBtn").text("Hello, guest! Click me to login.");
    } else {
        $("#authBtn").text(`Welcome, ${CJS.fetchFirebaseAuth().google.displayName}! (Not you? Click here)`);
    }

    CJS.getPermLevel(function(permLevel) {
        let urlParams = helpers.getUrlParams(window.location.href);

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
                $("<iframe>").attr("src", iframeUrl).css("width", "100%").css("height", (sizing.height + 10) + "px").css("border", "none")
            );

            if (permLevel >= 4) {
                var judgingControlsBox = $("#judgingControls");

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

                        judgingControlsBox.append(createJudgingControl(rubrics[thisRubric], rubricType));
                    }                    
                });
            }
        }
    });
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