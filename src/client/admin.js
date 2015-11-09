var CJS = require("../backend/contest_judging_sys.js");
var helpers = require("../helpers/helpers.js");

var gContests = null;

var newData = {
    id: null,
    name: null,
    newRubrics: []
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

                $("#contestSelect").material_select();
            });
        } else {
            window.location.href = "../index.html";
        }
    });
});

$("#contestSelect").on("change", () => {
    $("#submitData").attr("disabled", false).removeClass("disabled");

    newData.id = $("#contestSelect").val();
    newData.name = gContests[$("#contestSelect").val()].name;

    $("[name=contestName]").val(newData.name);
});

let rubricKeys = [];

function removeRubricKey(index) {
    if (index < rubricKeys.length) {
        let rubricKey = rubricKeys.splice(index, 1)[0];
        rubricKey.$el.remove();
    }
}

function addRubricKey($container) {
    let data = {
        name: "",
        $el: $("<div>").addClass("key col l12 m12 s12")
                .append(
                    $("<label>")
                        .text(`Rubric Key ${rubricKeys.length + 1}`)
                )
    };

    let $input = $("<input>").attr("type", "text").attr("id", "rubric-key")

    data.$input = $input;

    $input.bind("input propertychange", () => {
        console.log("hi");
        data.name = $input.val();
        if ($input.val().length > 0 && data.$el.is(":last-child")) {
            addRubricKey($container);
        }
        if (rubricKeys.length >= 2 &&
            rubricKeys[rubricKeys.length - 2].name === "" &&
            rubricKeys[rubricKeys.length - 1].name === "" &&
            !rubricKeys[rubricKeys.length - 1].$input.is(":focus")) {
                removeRubricKey(rubricKeys.length - 1);
        }
    });

    data.$el.append($input);

    $container.append(data.$el);

    rubricKeys.push(data);

    return data;
}

addRubricKey($(".keys"));

$("#submitData").on("click", () => {
    // TODO (@GigabyteGiant)
});

$(".create-rubric-item").on("click", () => {
    // TODO (@GigabyteGiant)
});
