var CJS = require("../backend/contest_judging_sys.js");
var helpers = require("../generalPurpose.js");

var setupPage = function() {
    CJS.getPermLevel(function(permLevel) {
        let urlParams = helpers.getUrlParams(window.location.href);
        var judgingControls = (permLevel >= 4);

        if (!urlParams.hasOwnProperty("contest") || !urlParams.hasOwnProperty("entry")) {
            alert("Contest ID and/or Entry ID not specified. Returning to previous page.");
            window.history.back();
        } else {
            let contestId = urlParams.contest;
            let entryId = urlParams.entry;

            var sizing = {
                width: 400,
                height: 400
            };

            let iframeUrl = `https://www.khanacademy.org/computer-programming/contest-entry/${entryId}/embedded?buttons=no&editor=yes&author=no&width=${sizing.width}&height=${sizing.height}`;

            $("#preview").append(
                $("<iframe>").attr("src", iframeUrl).css("width", "100%").css("height", (sizing.height + 10) + "px").css("border", "none")
            );
        }
    });
};

setupPage();