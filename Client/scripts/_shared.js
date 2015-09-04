/*
 * _shared.js
 */

/***
 * setupFooter()
 * Adds a footer to every page that this script is included on.
 * @author Gigabyte Giant (2015)
***/
var setupFooter = function() {
    $("<div>")
        .addClass("footer")
        .addClass("text-muted")
        .html("KACJS is Copyright © 2015 <a href=\"https://github.com/Gigabyte-Giant\" title=\"Gigabyte Giant on GitHub\">Gigabyte Giant</a> & <a href=\"https://github.com/Team-Delta-KA\" title=\"Team Delta on GitHub\">Team Delta</a>. All rights reserved.<br><small>The code for all contests and/or their entries are owned by their respective authors, and are made available by Khan Academy, under an <a href=\"http://opensource.org/licenses/mit-license.php\" title=\"MIT License\">MIT License</a></small><br><small>The non-code items in contests and/or their entries, are also owned by their respective author, and are made available under a <a href=\"https://creativecommons.org/licenses/by/4.0/\" title=\"Creative Commons 4.0 Attribution License\">Creative Commons 4.0 Attribution License</a>.</small>")
        .appendTo(".container");
};

setupFooter();
