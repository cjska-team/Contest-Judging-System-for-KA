$(function() {
    var addFooter = function() {
        /* TODO(JavascriptFTW): Use Materialize's builtin footer functionality possibly */
        var footerElem = $("<footer>").addClass("section").addClass("center").addClass("muted");

        footerElem.append(
            $("<p>").text("KACJS; Copyright 2015 Gigabyte Giant & Spark.")
                .append("<br>")
                .append(
                    $("<small>")
                        .text("The code for all contests and/or their entries are owned by their respective authors, and are made available by Khan Academy, under an MIT License.")
                            .append("<br>")
                )
                .append(
                    $("<small>")
                        .text("The non-code items in contests and/or their entries, are also owned by their respective author, and are made available under a Creative Commons 4.0 Attribution License."
                )
            )
        );

        $(".container").append(footerElem);
    };

    addFooter();
});
