var CJS = require("../backend/contest_judging_sys.js");
var helpers = require("../generalPurpose.js");

var setupLeaderboard = function(data) {
    console.log(data);

    var leaderboardColumns = [
        {
            data: "Entry ID"
        },
        {
            data: "Entry Name"
        }
    ];

    if (data.rubrics.hasOwnProperty("Order")) {
        for (let rInd = 0; rInd < data.rubrics.Order.length; rInd++) {
            leaderboardColumns.push({
                data: data.rubrics.Order[rInd].replace(/\_/g, " ")
            });
        }
    }

    leaderboardColumns.push({
        data: "Total Score"
    });

    let tableHeader = $("#leaderboard thead tr");

    for (let colInd = 0; colInd < leaderboardColumns.length; colInd++) {
        tableHeader.append(
            $("<td>").text(leaderboardColumns[colInd].data)
        );
    }

    console.log(leaderboardColumns);

    var leaderboardRows = [];

    for (let entry in data.entries) {
        console.log(data.entries[entry]);

        var rowObj = {
            "Entry ID": data.entries[entry].id,
            "Entry Name": "<a href=\"https://www.khanacademy.org/computer-programming/contest-entry/" + data.entries[entry].id + "\">" + data.entries[entry].name + "</a>"
        };

        var totalScore = 0;

        for (let oInd = 0; oInd < data.rubrics.Order.length; oInd++) {
            let currRubric = data.rubrics.Order[oInd];
            let score = data.entries[entry].scores.rubric.hasOwnProperty(currRubric) ? data.entries[entry].scores.rubric[currRubric].avg : data.rubrics[currRubric].min;

            totalScore += score;

            if (data.rubrics[currRubric].hasOwnProperty("keys")) {
                rowObj[currRubric.replace(/\_/g, " ")] = "(" + score + ") " + data.rubrics[currRubric].keys[score];
            } else {
                rowObj[currRubric.replace(/\_/g, " ")] = score;
            }
        }

        rowObj["Total Score"] = totalScore;
        leaderboardRows.push(rowObj);
    }

    var leaderboardObj = $("#leaderboard").DataTable({
        columns: leaderboardColumns,
        data: leaderboardRows
    });

    $("#leaderboard #leaderboard_length").hide();
};

var showPage = function() {
    let urlParams = helpers.getUrlParams(window.location.href);

    var contestId = null;

    if (urlParams.hasOwnProperty("contest")) {
        contestId = urlParams.contest;
    } else {
        alert("Contest ID not specified. Returning to homepage.");
        window.location.href = "index.html";
    }

    CJS.getContestRubrics(contestId, function(rubrics) {
        CJS.fetchContest(contestId, function(contestData) {
            contestData.rubrics = rubrics;

            setupLeaderboard(contestData);
        }, ["id", "name", "desc", "img", "entries"]);
    });
};

CJS.getPermLevel(function(permLevel) {
    if (permLevel >= 5) {
        showPage();
    } else {
        alert("You do not have the required permissions to view this page. Returning to homepage.");
        window.location.href = "index.html";
    }
});