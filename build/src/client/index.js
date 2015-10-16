(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = (function () {
    if (!window.jQuery || !window.Firebase) {
        return;
    }

    // The following variable is used to store our "Firebase Key"
    var FIREBASE_KEY = "https://contest-judging-sys.firebaseio.com";

    return {
        fetchFirebaseAuth: function fetchFirebaseAuth() {
            return new window.Firebase(FIREBASE_KEY).getAuth();
        },
        /**
         * fetchContests(callback)
         * Fetches all contests that're being stored in Firebase, and passes them into a callback function.
         * @author Gigabyte Giant (2015)
         * @param {Function} callback: The callback function to invoke once we've captured all the data that we need.
         * @todo (Gigabyte Giant): Add better comments!
         */
        fetchContests: function fetchContests(callback) {
            if (!callback || typeof callback !== "function") {
                return;
            }

            // Used to reference Firebase
            var firebaseRef = new window.Firebase(FIREBASE_KEY);

            // Firebase children
            var contestKeysChild = firebaseRef.child("contestKeys");
            var contestsChild = firebaseRef.child("contests");

            // Properties that we must have before we can invoke our callback function
            var requiredProps = ["id", "name", "desc", "img", "entryCount"];

            // keysWeFound holds a list of all of the contest keys that we've found so far
            var keysWeFound = [];

            // callbackData is the object that gets passed into our callback function
            var callbackData = {};

            // "Query" our contestKeysChild
            contestKeysChild.orderByKey().on("child_added", function (fbItem) {
                // Add the current key to our "keysWeFound" array
                keysWeFound.push(fbItem.key());

                var thisContest = contestsChild.child(fbItem.key());

                var thisContestData = {};

                var _loop = function (propInd) {
                    var currProperty = requiredProps[propInd];
                    thisContest.child(currProperty).once("value", function (fbSnapshot) {
                        thisContestData[currProperty] = fbSnapshot.val();

                        // TODO (Gigabyte Giant): Get rid of all this nested "crap"
                        if (Object.keys(thisContestData).length === requiredProps.length) {
                            callbackData[fbItem.key()] = thisContestData;

                            if (Object.keys(callbackData).length === keysWeFound.length) {
                                callback(callbackData);
                            }
                        }
                    });
                };

                for (var propInd = 0; propInd < requiredProps.length; propInd++) {
                    _loop(propInd);
                }
            }, console.error);
        }
    };
})();

},{}],2:[function(require,module,exports){
"use strict";

var CJS = require("../backend/contest_judging_sys.js");

/**
 * createContestControl(controlData)
 * Creates a button using the data specified, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @param {Object} controlData: The JSON object containing the data for the control (such as display text and where the control should link to)
 * @returns {jQuery} contestControl: The jQuery object containing the newly created contest control
 */
var createContestControl = function createContestControl(controlData) {
    var contestControl = $("<a>").addClass("waves-effect").addClass("waves-light").addClass("amber").addClass("darken-2").addClass("btn").addClass("contest-control").text(controlData.text).attr("href", controlData.link === undefined ? null : controlData.link);

    return contestControl;
};

/**
 * createContestDetails(contestData)
 * Creates a "contest details" div, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @param {Object} contestData: A JSON object containing the data for a contest.
 * @returns {jQuery} contestDetails: The jQuery object containing the "contest details" div.
 */
var createContestDetails = function createContestDetails(contestData) {
    var contestDetails = $("<div>").addClass("col").addClass("s9").append($("<h5>").text(contestData.title)).append($("<div>").html(contestData.description));

    return contestDetails;
};

/**
 * createContestHolder(contestData)
 * Creates a "contest holder" div, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @param {Object} contestData: A JSON object containing the data for a contest.
 * @returns {jQuery} contestHolder: The jQuery object containing the "contest holder" div.
 */
var createContestHolder = function createContestHolder(contestData) {
    var contestHolder = $("<div>").addClass("section").append($("<div>").addClass("col").addClass("s3").append($("<img>").attr("src", contestData.thumbnail).addClass("responsive-img").addClass("contest-thumbnail")).append($("<div>").addClass("center").append(createContestControl({
        text: "View Entries"
    })).append(createContestControl({
        text: "Leaderboard"
    })))).append(createContestDetails(contestData));

    return contestHolder;
};

var setupPage = function setupPage(contestData) {
    for (var cid in contestData) {
        var contest = contestData[cid];

        $("#contests").append($("<div>").addClass("row").append(createContestHolder({
            title: contest.name,
            description: contest.desc === "" ? "No description provided." : contest.desc,
            thumbnail: "https://www.khanacademy.org/" + contest.img
        }))).append($("<div>").addClass("divider"));
    }
};

CJS.fetchContests(function (data) {
    setupPage(data);
});

setupPage();

},{"../backend/contest_judging_sys.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9Pd25lci9EZXNrdG9wL3NpdGVzL0tBLUNvbnRlc3QtSnVkZ2luZy1TeXN0ZW0vc3JjL2JhY2tlbmQvY29udGVzdF9qdWRnaW5nX3N5cy5qcyIsIkM6L1VzZXJzL093bmVyL0Rlc2t0b3Avc2l0ZXMvS0EtQ29udGVzdC1KdWRnaW5nLVN5c3RlbS9zcmMvY2xpZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsWUFBVztBQUN6QixRQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7QUFDcEMsZUFBTztLQUNWOzs7QUFHRCxRQUFJLFlBQVksR0FBRyw0Q0FBNEMsQ0FBQzs7QUFFaEUsV0FBTztBQUNILHlCQUFpQixFQUFFLDZCQUFXO0FBQzFCLG1CQUFPLEFBQUMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFFLE9BQU8sRUFBRSxDQUFDO1NBQ3hEOzs7Ozs7OztBQVFELHFCQUFhLEVBQUUsdUJBQVMsUUFBUSxFQUFFO0FBQzlCLGdCQUFJLENBQUMsUUFBUSxJQUFLLE9BQU8sUUFBUSxLQUFLLFVBQVUsQUFBQyxFQUFFO0FBQy9DLHVCQUFPO2FBQ1Y7OztBQUdELGdCQUFJLFdBQVcsR0FBSSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEFBQUMsQ0FBQzs7O0FBR3RELGdCQUFJLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDeEQsZ0JBQUksYUFBYSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7OztBQUdsRCxnQkFBSSxhQUFhLEdBQUcsQ0FDaEIsSUFBSSxFQUNKLE1BQU0sRUFDTixNQUFN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RUFBRyxPQUFPLENBQUMsSUFBSSxLQUFLLEVBQUUsR0FBRywwQkFBMEIsR0FBRyxPQUFPLENBQUMsSUFBSSxBQUFDO0FBQzlFLHFCQUFTLEVBQUUsOEJBQThCLEdBQUcsT0FBTyxDQUFDLEdBQUc7U0FDMUQsQ0FBQyxDQUNMLENBQ1IsQ0FDQSxNQUFNLENBQ0gsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FDakMsQ0FBQztLQUNMO0NBQ0osQ0FBQzs7QUFFRixHQUFHLENBQUMsYUFBYSxDQUFDLFVBQVMsSUFBSSxFQUFFO0FBQzdCLGFBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNuQixDQUFDLENBQUM7O0FBRUgsU0FBUyxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF3aW5kb3cualF1ZXJ5IHx8ICF3aW5kb3cuRmlyZWJhc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgdmFyaWFibGUgaXMgdXNlZCB0byBzdG9yZSBvdXIgXCJGaXJlYmFzZSBLZXlcIlxuICAgIGxldCBGSVJFQkFTRV9LRVkgPSBcImh0dHBzOi8vY29udGVzdC1qdWRnaW5nLXN5cy5maXJlYmFzZWlvLmNvbVwiO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZmV0Y2hGaXJlYmFzZUF1dGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpLmdldEF1dGgoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZldGNoQ29udGVzdHMoY2FsbGJhY2spXG4gICAgICAgICAqIEZldGNoZXMgYWxsIGNvbnRlc3RzIHRoYXQncmUgYmVpbmcgc3RvcmVkIGluIEZpcmViYXNlLCBhbmQgcGFzc2VzIHRoZW0gaW50byBhIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGNhcHR1cmVkIGFsbCB0aGUgZGF0YSB0aGF0IHdlIG5lZWQuXG4gICAgICAgICAqIEB0b2RvIChHaWdhYnl0ZSBHaWFudCk6IEFkZCBiZXR0ZXIgY29tbWVudHMhXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3RzOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIEZpcmViYXNlIGNoaWxkcmVuXG4gICAgICAgICAgICBsZXQgY29udGVzdEtleXNDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdEtleXNcIik7XG4gICAgICAgICAgICBsZXQgY29udGVzdHNDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIik7XG5cbiAgICAgICAgICAgIC8vIFByb3BlcnRpZXMgdGhhdCB3ZSBtdXN0IGhhdmUgYmVmb3JlIHdlIGNhbiBpbnZva2Ugb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICBsZXQgcmVxdWlyZWRQcm9wcyA9IFtcbiAgICAgICAgICAgICAgICBcImlkXCIsXG4gICAgICAgICAgICAgICAgXCJuYW1lXCIsXG4gICAgICAgICAgICAgICAgXCJkZXNjXCIsXG4gICAgICAgICAgICAgICAgXCJpbWdcIixcbiAgICAgICAgICAgICAgICBcImVudHJ5Q291bnRcIlxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgLy8ga2V5c1dlRm91bmQgaG9sZHMgYSBsaXN0IG9mIGFsbCBvZiB0aGUgY29udGVzdCBrZXlzIHRoYXQgd2UndmUgZm91bmQgc28gZmFyXG4gICAgICAgICAgICB2YXIga2V5c1dlRm91bmQgPSBbIF07XG5cbiAgICAgICAgICAgIC8vIGNhbGxiYWNrRGF0YSBpcyB0aGUgb2JqZWN0IHRoYXQgZ2V0cyBwYXNzZWQgaW50byBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7IH07XG5cbiAgICAgICAgICAgIC8vIFwiUXVlcnlcIiBvdXIgY29udGVzdEtleXNDaGlsZFxuICAgICAgICAgICAgY29udGVzdEtleXNDaGlsZC5vcmRlckJ5S2V5KCkub24oXCJjaGlsZF9hZGRlZFwiLCBmdW5jdGlvbihmYkl0ZW0pIHtcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGN1cnJlbnQga2V5IHRvIG91ciBcImtleXNXZUZvdW5kXCIgYXJyYXlcbiAgICAgICAgICAgICAgICBrZXlzV2VGb3VuZC5wdXNoKGZiSXRlbS5rZXkoKSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdGhpc0NvbnRlc3QgPSBjb250ZXN0c0NoaWxkLmNoaWxkKGZiSXRlbS5rZXkoKSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGhpc0NvbnRlc3REYXRhID0geyB9O1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcHJvcEluZCA9IDA7IHByb3BJbmQgPCByZXF1aXJlZFByb3BzLmxlbmd0aDsgcHJvcEluZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyUHJvcGVydHkgPSByZXF1aXJlZFByb3BzW3Byb3BJbmRdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzQ29udGVzdC5jaGlsZChjdXJyUHJvcGVydHkpLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihmYlNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzQ29udGVzdERhdGFbY3VyclByb3BlcnR5XSA9IGZiU25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gKEdpZ2FieXRlIEdpYW50KTogR2V0IHJpZCBvZiBhbGwgdGhpcyBuZXN0ZWQgXCJjcmFwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzQ29udGVzdERhdGEpLmxlbmd0aCA9PT0gcmVxdWlyZWRQcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbZmJJdGVtLmtleSgpXSA9IHRoaXNDb250ZXN0RGF0YTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0ga2V5c1dlRm91bmQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBjb25zb2xlLmVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG59KSgpOyIsInZhciBDSlMgPSByZXF1aXJlKFwiLi4vYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzXCIpO1xuXG4vKipcbiAqIGNyZWF0ZUNvbnRlc3RDb250cm9sKGNvbnRyb2xEYXRhKVxuICogQ3JlYXRlcyBhIGJ1dHRvbiB1c2luZyB0aGUgZGF0YSBzcGVjaWZpZWQsIGFuZCByZXR1cm5zIGl0IHRvIHRoZSBjYWxsZXIuXG4gKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRyb2xEYXRhOiBUaGUgSlNPTiBvYmplY3QgY29udGFpbmluZyB0aGUgZGF0YSBmb3IgdGhlIGNvbnRyb2wgKHN1Y2ggYXMgZGlzcGxheSB0ZXh0IGFuZCB3aGVyZSB0aGUgY29udHJvbCBzaG91bGQgbGluayB0bylcbiAqIEByZXR1cm5zIHtqUXVlcnl9IGNvbnRlc3RDb250cm9sOiBUaGUgalF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBuZXdseSBjcmVhdGVkIGNvbnRlc3QgY29udHJvbFxuICovXG52YXIgY3JlYXRlQ29udGVzdENvbnRyb2wgPSBmdW5jdGlvbihjb250cm9sRGF0YSkge1xuICAgIHZhciBjb250ZXN0Q29udHJvbCA9ICQoXCI8YT5cIilcbiAgICAgICAgLmFkZENsYXNzKFwid2F2ZXMtZWZmZWN0XCIpXG4gICAgICAgIC5hZGRDbGFzcyhcIndhdmVzLWxpZ2h0XCIpXG4gICAgICAgIC5hZGRDbGFzcyhcImFtYmVyXCIpXG4gICAgICAgIC5hZGRDbGFzcyhcImRhcmtlbi0yXCIpXG4gICAgICAgIC5hZGRDbGFzcyhcImJ0blwiKVxuICAgICAgICAuYWRkQ2xhc3MoXCJjb250ZXN0LWNvbnRyb2xcIilcbiAgICAgICAgLnRleHQoY29udHJvbERhdGEudGV4dClcbiAgICAgICAgLmF0dHIoXCJocmVmXCIsIChjb250cm9sRGF0YS5saW5rID09PSB1bmRlZmluZWQgPyBudWxsIDogY29udHJvbERhdGEubGluaykpO1xuXG4gICAgcmV0dXJuIGNvbnRlc3RDb250cm9sO1xufTtcblxuLyoqXG4gKiBjcmVhdGVDb250ZXN0RGV0YWlscyhjb250ZXN0RGF0YSlcbiAqIENyZWF0ZXMgYSBcImNvbnRlc3QgZGV0YWlsc1wiIGRpdiwgYW5kIHJldHVybnMgaXQgdG8gdGhlIGNhbGxlci5cbiAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGVzdERhdGE6IEEgSlNPTiBvYmplY3QgY29udGFpbmluZyB0aGUgZGF0YSBmb3IgYSBjb250ZXN0LlxuICogQHJldHVybnMge2pRdWVyeX0gY29udGVzdERldGFpbHM6IFRoZSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIFwiY29udGVzdCBkZXRhaWxzXCIgZGl2LlxuICovXG52YXIgY3JlYXRlQ29udGVzdERldGFpbHMgPSBmdW5jdGlvbihjb250ZXN0RGF0YSkge1xuICAgIHZhciBjb250ZXN0RGV0YWlscyA9ICQoXCI8ZGl2PlwiKVxuICAgICAgICAuYWRkQ2xhc3MoXCJjb2xcIilcbiAgICAgICAgLmFkZENsYXNzKFwiczlcIilcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8aDU+XCIpLnRleHQoY29udGVzdERhdGEudGl0bGUpXG4gICAgICAgIClcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8ZGl2PlwiKVxuICAgICAgICAgICAgICAgIC5odG1sKGNvbnRlc3REYXRhLmRlc2NyaXB0aW9uKVxuICAgICAgICApO1xuXG4gICAgcmV0dXJuIGNvbnRlc3REZXRhaWxzO1xufTtcblxuLyoqXG4gKiBjcmVhdGVDb250ZXN0SG9sZGVyKGNvbnRlc3REYXRhKVxuICogQ3JlYXRlcyBhIFwiY29udGVzdCBob2xkZXJcIiBkaXYsIGFuZCByZXR1cm5zIGl0IHRvIHRoZSBjYWxsZXIuXG4gKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRlc3REYXRhOiBBIEpTT04gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRhdGEgZm9yIGEgY29udGVzdC5cbiAqIEByZXR1cm5zIHtqUXVlcnl9IGNvbnRlc3RIb2xkZXI6IFRoZSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIFwiY29udGVzdCBob2xkZXJcIiBkaXYuXG4gKi9cbnZhciBjcmVhdGVDb250ZXN0SG9sZGVyID0gZnVuY3Rpb24oY29udGVzdERhdGEpIHtcbiAgICB2YXIgY29udGVzdEhvbGRlciA9ICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcInNlY3Rpb25cIilcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcImNvbFwiKS5hZGRDbGFzcyhcInMzXCIpXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgJChcIjxpbWc+XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInNyY1wiLCBjb250ZXN0RGF0YS50aHVtYm5haWwpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoXCJyZXNwb25zaXZlLWltZ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKFwiY29udGVzdC10aHVtYm5haWxcIilcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiY2VudGVyXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbnRlc3RDb250cm9sKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJWaWV3IEVudHJpZXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbnRlc3RDb250cm9sKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJMZWFkZXJib2FyZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgIGNyZWF0ZUNvbnRlc3REZXRhaWxzKGNvbnRlc3REYXRhKVxuICAgICAgICApO1xuXG4gICAgcmV0dXJuIGNvbnRlc3RIb2xkZXI7XG59O1xuXG52YXIgc2V0dXBQYWdlID0gZnVuY3Rpb24oY29udGVzdERhdGEpIHtcbiAgICBmb3IgKGxldCBjaWQgaW4gY29udGVzdERhdGEpIHtcbiAgICAgICAgbGV0IGNvbnRlc3QgPSBjb250ZXN0RGF0YVtjaWRdO1xuXG4gICAgICAgICQoXCIjY29udGVzdHNcIikuYXBwZW5kKFxuICAgICAgICAgICAgJChcIjxkaXY+XCIpLmFkZENsYXNzKFwicm93XCIpXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29udGVzdEhvbGRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogY29udGVzdC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IChjb250ZXN0LmRlc2MgPT09IFwiXCIgPyBcIk5vIGRlc2NyaXB0aW9uIHByb3ZpZGVkLlwiIDogY29udGVzdC5kZXNjKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbDogXCJodHRwczovL3d3dy5raGFuYWNhZGVteS5vcmcvXCIgKyBjb250ZXN0LmltZ1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiZGl2aWRlclwiKVxuICAgICAgICApO1xuICAgIH1cbn07XG5cbkNKUy5mZXRjaENvbnRlc3RzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBzZXR1cFBhZ2UoZGF0YSk7XG59KTtcblxuc2V0dXBQYWdlKCk7XG4iXX0=
