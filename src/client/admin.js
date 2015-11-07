var CJS = require("../backend/contest_judging_sys.js");
var helpers = require("../helpers/helpers.js");

var gContests = null;

var newData = {
    id: null,
    name: null
};

$(function() {
    CJS.getPermLevel(function(permLevel) {
        if (permLevel >= 5) {
            helpers.authentication.setupPageAuth("#authBtn", CJS);

            CJS.fetchContests(function(contests) {
                $("#start").text("Select a contest...");
                gContests = contests;
                let contestKeys = Object.keys(contests);

                for (let cInd = 0; cInd < contestKeys.length; cInd++) {
                    $("#contestSelect").append(
                        $("<option>").attr("value", contestKeys[cInd]).text(contests[contestKeys[cInd]].name)
                    );
                }
            });
        } else {
            window.location.href = "../index.html";
        }
    });
});

$(".options-tab").on("click", (evt) => {
    evt.preventDefault();

    console.log("Click!");

    $($(evt.toElement).attr("href")).css("display", "block");
});

$("#contestSelect").on("change", () => {
    $("#submitData").attr("disabled", false).removeClass("disabled");

    newData.id = $("#contestSelect").val();
    newData.name = gContests[$("#contestSelect").val()].name;

    $("[name=contestName]").val(newData.name);
});

$("#submitData").on("click", () => {
    newData.id = $("#contestSelect").val();
    newData.name = $("[name=contestName]").val();

    console.log(newData);
});