(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = (function () {
    if (!window.jQuery || !window.Firebase) {
        return;
    }

    // The following variable is used to store our "Firebase Key"
    var FIREBASE_KEY = "https://contest-judging-sys.firebaseio.com";

    // The following variable is used to specify the default number of entries to fetch
    var DEF_NUM_ENTRIES_TO_LOAD = 10;

    return {
        reportError: function reportError(error) {
            console.error(error);
        },
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
            }, this.reportError);
        },
        /**
         * fetchContestEntries(contestId, callback)
         *
         * @author Gigabyte Giant (2015)
         * @param {String} contestId: The Khan Academy scratchpad ID of the contest that we want to fetch entries for.
         * @param {Function} callback: The callback function to invoke after we've fetched all the data that we need.
         * @param {Integer} loadHowMany*: The number of entries to load. If no value is passed to this parameter,
         *  fallback onto a default value.
         */
        fetchContestEntries: function fetchContestEntries(contestId, callback) {
            var loadHowMany = arguments.length <= 2 || arguments[2] === undefined ? DEF_NUM_ENTRIES_TO_LOAD : arguments[2];

            // If we don't have a valid callback function, exit the function.
            if (!callback || typeof callback !== "function") {
                return;
            }

            // Used to reference Firebase
            var firebaseRef = new window.Firebase(FIREBASE_KEY);

            // References to Firebase children
            var thisContestRef = firebaseRef.child("contests").child(contestId);
            var contestEntriesRef = thisContestRef.child("entryKeys");

            // Used to keep track of how many entries we've loaded
            var numLoaded = 0;

            // Used to store each of the entries that we've loaded
            var entryKeys = [];

            contestEntriesRef.once("value", function (fbSnapshot) {
                var tmpEntryKeys = fbSnapshot.val();

                // If there aren't at least "n" entries for this contest, load all of them.
                if (Object.keys(tmpEntryKeys).length < loadHowMany) {
                    loadHowMany = Object.keys(tmpEntryKeys).length;
                }

                while (numLoaded < loadHowMany) {
                    var randomIndex = Math.floor(Math.random() * Object.keys(tmpEntryKeys).length);
                    var selectedKey = Object.keys(tmpEntryKeys)[randomIndex];

                    if (entryKeys.indexOf(selectedKey) === -1) {
                        entryKeys.push(selectedKey);
                        numLoaded++;
                    }
                }
            }, this.reportError);

            var callbackWait = setInterval(function () {
                if (numLoaded === loadHowMany) {
                    clearInterval(callbackWait);
                    callback(entryKeys);
                }
            }, 1000);
        },
        /**
         * loadContestEntry(contestId, entryId, callback)
         * Loads a contest entry (which is specified via providing a contest id and an entry id).
         * @author Gigabyte Giant (2015)
         * @param {String} contestId: The scratchpad ID of the contest that this entry resides under.
         * @param {String} entryId: The scratchpad ID of the entry.
         * @param {Function} callback: The callback function to invoke once we've loaded all the required data.
         * @todo (Gigabyte Giant): Add authentication to this function
         */
        loadContestEntry: function loadContestEntry(contestId, entryId, callback) {
            // If we don't have a valid callback function, exit the function.
            if (!callback || typeof callback !== "function") {
                return;
            }

            // Used to reference Firebase
            var firebaseRef = new window.Firebase(FIREBASE_KEY);

            // References to Firebase children
            var contestRef = firebaseRef.child("contests").child(contestId);
            var entriesRef = contestRef.child("entries").child(entryId);

            // A variable containing a list of all the properties that we must load before we can invoke our callback function
            var requiredProps = ["id", "name", "thumb"];

            // The JSON object that we'll pass into the callback function
            var callbackData = {};

            entriesRef.once("value", function (fbSnapshot) {
                var tmpEntry = fbSnapshot.val();

                for (var propInd = 0; propInd < requiredProps.length; propInd++) {
                    var thisProp = requiredProps[propInd];

                    callbackData[thisProp] = tmpEntry[thisProp];
                }

                if (Object.keys(callbackData).length === requiredProps.length) {
                    callback(callbackData);
                }
            }, this.reportError);
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
    var contestHolder = $("<div>").addClass("section").append($("<div>").addClass("col").addClass("s3").append($("<div>").addClass("center").append($("<img>").attr("src", contestData.thumbnail).addClass("img-responsive").addClass("contest-thumbnail")).append(createContestControl({
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

CJS.fetchContests(setupPage);

setupPage();

},{"../backend/contest_judging_sys.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2NsaWVudC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLFlBQVc7QUFDekIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO0FBQ3BDLGVBQU87S0FDVjs7O0FBR0QsUUFBSSxZQUFZLEdBQUcsNENBQTRDLENBQUM7OztBQUdoRSxRQUFJLHVCQUF1QixHQUFHLEVBQUUsQ0FBQzs7QUFFakMsV0FBTztBQUNILG1CQUFXLEVBQUUscUJBQVMsS0FBSyxFQUFFO0FBQ3pCLG1CQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3hCO0FBQ0QseUJBQWlCLEVBQUUsNkJBQVc7QUFDMUIsbUJBQU8sQUFBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUUsT0FBTyxFQUFFLENBQUM7U0FDeEQ7Ozs7Ozs7O0FBUUQscUJBQWEsRUFBRSx1QkFBUyxRQUFRLEVBQUU7QUFDOUIsZ0JBQUksQ0FBQyxRQUFRLElBQUssT0FBTyxRQUFRLEtBQUssVUFBVSxBQUFDLEVBQUU7QUFDL0MsdUJBQU87YUFDVjs7O0FBR0QsZ0JBQUksV0FBVyxHQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQUFBQyxDQUFDOzs7QUFHdEQsZ0JBQUksZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN4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QUUsY0FBYztLQUN2QixDQUFDLENBQ0wsQ0FDQSxNQUFNLENBQ0gsb0JBQW9CLENBQUM7QUFDakIsWUFBSSxFQUFFLGFBQWE7S0FDdEIsQ0FBQyxDQUNMLENBQ1IsQ0FDUixDQUNBLE1BQU0sQ0FDSCxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FDcEMsQ0FBQzs7QUFFTixXQUFPLGFBQWEsQ0FBQztDQUN4QixDQUFDOztBQUVGLElBQUksU0FBUyxHQUFHLFNBQVosU0FBUyxDQUFZLFdBQVcsRUFBRTtBQUNsQyxTQUFLLElBQUksR0FBRyxJQUFJLFdBQVcsRUFBRTtBQUN6QixZQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRS9CLFNBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQ2pCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQ3JCLE1BQU0sQ0FDSCxtQkFBbUIsQ0FBQztBQUNoQixpQkFBSyxFQUFFLE9BQU8sQ0FBQyxJQUFJO0FBQ25CLHVCQUFXLEVBQUcsT0FBTyxDQUFDLElBQUksS0FBSyxFQUFFLEdBQUcsMEJBQTBCLEdBQUcsT0FBTyxDQUFDLElBQUksQUFBQztBQUM5RSxxQkFBUyxFQUFFLDhCQUE4QixHQUFHLE9BQU8sQ0FBQyxHQUFHO1NBQzFELENBQUMsQ0FDTCxDQUNSLENBQ0EsTUFBTSxDQUNILENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQ2pDLENBQUM7S0FDTDtDQUNKLENBQUM7O0FBRUYsR0FBRyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFN0IsU0FBUyxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF3aW5kb3cualF1ZXJ5IHx8ICF3aW5kb3cuRmlyZWJhc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgdmFyaWFibGUgaXMgdXNlZCB0byBzdG9yZSBvdXIgXCJGaXJlYmFzZSBLZXlcIlxuICAgIGxldCBGSVJFQkFTRV9LRVkgPSBcImh0dHBzOi8vY29udGVzdC1qdWRnaW5nLXN5cy5maXJlYmFzZWlvLmNvbVwiO1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyB2YXJpYWJsZSBpcyB1c2VkIHRvIHNwZWNpZnkgdGhlIGRlZmF1bHQgbnVtYmVyIG9mIGVudHJpZXMgdG8gZmV0Y2hcbiAgICBsZXQgREVGX05VTV9FTlRSSUVTX1RPX0xPQUQgPSAxMDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlcG9ydEVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIH0sXG4gICAgICAgIGZldGNoRmlyZWJhc2VBdXRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKS5nZXRBdXRoKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmZXRjaENvbnRlc3RzKGNhbGxiYWNrKVxuICAgICAgICAgKiBGZXRjaGVzIGFsbCBjb250ZXN0cyB0aGF0J3JlIGJlaW5nIHN0b3JlZCBpbiBGaXJlYmFzZSwgYW5kIHBhc3NlcyB0aGVtIGludG8gYSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBjYXB0dXJlZCBhbGwgdGhlIGRhdGEgdGhhdCB3ZSBuZWVkLlxuICAgICAgICAgKiBAdG9kbyAoR2lnYWJ5dGUgR2lhbnQpOiBBZGQgYmV0dGVyIGNvbW1lbnRzIVxuICAgICAgICAgKi9cbiAgICAgICAgZmV0Y2hDb250ZXN0czogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IGNvbnRlc3RLZXlzQ2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RLZXlzXCIpO1xuICAgICAgICAgICAgbGV0IGNvbnRlc3RzQ2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpO1xuXG4gICAgICAgICAgICAvLyBQcm9wZXJ0aWVzIHRoYXQgd2UgbXVzdCBoYXZlIGJlZm9yZSB3ZSBjYW4gaW52b2tlIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgbGV0IHJlcXVpcmVkUHJvcHMgPSBbXG4gICAgICAgICAgICAgICAgXCJpZFwiLFxuICAgICAgICAgICAgICAgIFwibmFtZVwiLFxuICAgICAgICAgICAgICAgIFwiZGVzY1wiLFxuICAgICAgICAgICAgICAgIFwiaW1nXCIsXG4gICAgICAgICAgICAgICAgXCJlbnRyeUNvdW50XCJcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIC8vIGtleXNXZUZvdW5kIGhvbGRzIGEgbGlzdCBvZiBhbGwgb2YgdGhlIGNvbnRlc3Qga2V5cyB0aGF0IHdlJ3ZlIGZvdW5kIHNvIGZhclxuICAgICAgICAgICAgdmFyIGtleXNXZUZvdW5kID0gWyBdO1xuXG4gICAgICAgICAgICAvLyBjYWxsYmFja0RhdGEgaXMgdGhlIG9iamVjdCB0aGF0IGdldHMgcGFzc2VkIGludG8gb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0geyB9O1xuXG4gICAgICAgICAgICAvLyBcIlF1ZXJ5XCIgb3VyIGNvbnRlc3RLZXlzQ2hpbGRcbiAgICAgICAgICAgIGNvbnRlc3RLZXlzQ2hpbGQub3JkZXJCeUtleSgpLm9uKFwiY2hpbGRfYWRkZWRcIiwgZnVuY3Rpb24oZmJJdGVtKSB7XG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBjdXJyZW50IGtleSB0byBvdXIgXCJrZXlzV2VGb3VuZFwiIGFycmF5XG4gICAgICAgICAgICAgICAga2V5c1dlRm91bmQucHVzaChmYkl0ZW0ua2V5KCkpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHRoaXNDb250ZXN0ID0gY29udGVzdHNDaGlsZC5jaGlsZChmYkl0ZW0ua2V5KCkpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHRoaXNDb250ZXN0RGF0YSA9IHsgfTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IHByb3BJbmQgPSAwOyBwcm9wSW5kIDwgcmVxdWlyZWRQcm9wcy5sZW5ndGg7IHByb3BJbmQrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VyclByb3BlcnR5ID0gcmVxdWlyZWRQcm9wc1twcm9wSW5kXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpc0NvbnRlc3QuY2hpbGQoY3VyclByb3BlcnR5KS5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oZmJTbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc0NvbnRlc3REYXRhW2N1cnJQcm9wZXJ0eV0gPSBmYlNuYXBzaG90LnZhbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIChHaWdhYnl0ZSBHaWFudCk6IEdldCByaWQgb2YgYWxsIHRoaXMgbmVzdGVkIFwiY3JhcFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpc0NvbnRlc3REYXRhKS5sZW5ndGggPT09IHJlcXVpcmVkUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhW2ZiSXRlbS5rZXkoKV0gPSB0aGlzQ29udGVzdERhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IGtleXNXZUZvdW5kLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmZXRjaENvbnRlc3RFbnRyaWVzKGNvbnRlc3RJZCwgY2FsbGJhY2spXG4gICAgICAgICAqXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBLaGFuIEFjYWRlbXkgc2NyYXRjaHBhZCBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHdlIHdhbnQgdG8gZmV0Y2ggZW50cmllcyBmb3IuXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIGFmdGVyIHdlJ3ZlIGZldGNoZWQgYWxsIHRoZSBkYXRhIHRoYXQgd2UgbmVlZC5cbiAgICAgICAgICogQHBhcmFtIHtJbnRlZ2VyfSBsb2FkSG93TWFueSo6IFRoZSBudW1iZXIgb2YgZW50cmllcyB0byBsb2FkLiBJZiBubyB2YWx1ZSBpcyBwYXNzZWQgdG8gdGhpcyBwYXJhbWV0ZXIsXG4gICAgICAgICAqICBmYWxsYmFjayBvbnRvIGEgZGVmYXVsdCB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIGZldGNoQ29udGVzdEVudHJpZXM6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2ssIGxvYWRIb3dNYW55ID0gREVGX05VTV9FTlRSSUVTX1RPX0xPQUQpIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSB2YWxpZCBjYWxsYmFjayBmdW5jdGlvbiwgZXhpdCB0aGUgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gUmVmZXJlbmNlcyB0byBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IHRoaXNDb250ZXN0UmVmID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKS5jaGlsZChjb250ZXN0SWQpO1xuICAgICAgICAgICAgbGV0IGNvbnRlc3RFbnRyaWVzUmVmID0gdGhpc0NvbnRlc3RSZWYuY2hpbGQoXCJlbnRyeUtleXNcIik7XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueSBlbnRyaWVzIHdlJ3ZlIGxvYWRlZFxuICAgICAgICAgICAgdmFyIG51bUxvYWRlZCA9IDA7XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gc3RvcmUgZWFjaCBvZiB0aGUgZW50cmllcyB0aGF0IHdlJ3ZlIGxvYWRlZFxuICAgICAgICAgICAgdmFyIGVudHJ5S2V5cyA9IFsgXTtcblxuICAgICAgICAgICAgY29udGVzdEVudHJpZXNSZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKGZiU25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICBsZXQgdG1wRW50cnlLZXlzID0gZmJTbmFwc2hvdC52YWwoKTtcblxuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZW4ndCBhdCBsZWFzdCBcIm5cIiBlbnRyaWVzIGZvciB0aGlzIGNvbnRlc3QsIGxvYWQgYWxsIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRtcEVudHJ5S2V5cykubGVuZ3RoIDwgbG9hZEhvd01hbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhvd01hbnkgPSBPYmplY3Qua2V5cyh0bXBFbnRyeUtleXMpLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAobnVtTG9hZGVkIDwgbG9hZEhvd01hbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogT2JqZWN0LmtleXModG1wRW50cnlLZXlzKS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRLZXkgPSBPYmplY3Qua2V5cyh0bXBFbnRyeUtleXMpW3JhbmRvbUluZGV4XTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnlLZXlzLmluZGV4T2Yoc2VsZWN0ZWRLZXkpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlLZXlzLnB1c2goc2VsZWN0ZWRLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbnVtTG9hZGVkKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzLnJlcG9ydEVycm9yKTtcblxuICAgICAgICAgICAgbGV0IGNhbGxiYWNrV2FpdCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChudW1Mb2FkZWQgPT09IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoY2FsbGJhY2tXYWl0KTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZW50cnlLZXlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGxvYWRDb250ZXN0RW50cnkoY29udGVzdElkLCBlbnRyeUlkLCBjYWxsYmFjaylcbiAgICAgICAgICogTG9hZHMgYSBjb250ZXN0IGVudHJ5ICh3aGljaCBpcyBzcGVjaWZpZWQgdmlhIHByb3ZpZGluZyBhIGNvbnRlc3QgaWQgYW5kIGFuIGVudHJ5IGlkKS5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB0aGlzIGVudHJ5IHJlc2lkZXMgdW5kZXIuXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBlbnRyeUlkOiBUaGUgc2NyYXRjaHBhZCBJRCBvZiB0aGUgZW50cnkuXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgbG9hZGVkIGFsbCB0aGUgcmVxdWlyZWQgZGF0YS5cbiAgICAgICAgICogQHRvZG8gKEdpZ2FieXRlIEdpYW50KTogQWRkIGF1dGhlbnRpY2F0aW9uIHRvIHRoaXMgZnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIGxvYWRDb250ZXN0RW50cnk6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSB2YWxpZCBjYWxsYmFjayBmdW5jdGlvbiwgZXhpdCB0aGUgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gUmVmZXJlbmNlcyB0byBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IGNvbnRlc3RSZWYgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZCk7XG4gICAgICAgICAgICBsZXQgZW50cmllc1JlZiA9IGNvbnRlc3RSZWYuY2hpbGQoXCJlbnRyaWVzXCIpLmNoaWxkKGVudHJ5SWQpO1xuXG4gICAgICAgICAgICAvLyBBIHZhcmlhYmxlIGNvbnRhaW5pbmcgYSBsaXN0IG9mIGFsbCB0aGUgcHJvcGVydGllcyB0aGF0IHdlIG11c3QgbG9hZCBiZWZvcmUgd2UgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIGxldCByZXF1aXJlZFByb3BzID0gW1xuICAgICAgICAgICAgICAgIFwiaWRcIixcbiAgICAgICAgICAgICAgICBcIm5hbWVcIixcbiAgICAgICAgICAgICAgICBcInRodW1iXCJcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIC8vIFRoZSBKU09OIG9iamVjdCB0aGF0IHdlJ2xsIHBhc3MgaW50byB0aGUgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7IH07XG5cbiAgICAgICAgICAgIGVudHJpZXNSZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKGZiU25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICBsZXQgdG1wRW50cnkgPSBmYlNuYXBzaG90LnZhbCgpO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcHJvcEluZCA9IDA7IHByb3BJbmQgPCByZXF1aXJlZFByb3BzLmxlbmd0aDsgcHJvcEluZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0aGlzUHJvcCA9IHJlcXVpcmVkUHJvcHNbcHJvcEluZF07XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhW3RoaXNQcm9wXSA9IHRtcEVudHJ5W3RoaXNQcm9wXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IHJlcXVpcmVkUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcbiIsInZhciBDSlMgPSByZXF1aXJlKFwiLi4vYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzXCIpO1xuXG4vKipcbiAqIGNyZWF0ZUNvbnRlc3RDb250cm9sKGNvbnRyb2xEYXRhKVxuICogQ3JlYXRlcyBhIGJ1dHRvbiB1c2luZyB0aGUgZGF0YSBzcGVjaWZpZWQsIGFuZCByZXR1cm5zIGl0IHRvIHRoZSBjYWxsZXIuXG4gKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRyb2xEYXRhOiBUaGUgSlNPTiBvYmplY3QgY29udGFpbmluZyB0aGUgZGF0YSBmb3IgdGhlIGNvbnRyb2wgKHN1Y2ggYXMgZGlzcGxheSB0ZXh0IGFuZCB3aGVyZSB0aGUgY29udHJvbCBzaG91bGQgbGluayB0bylcbiAqIEByZXR1cm5zIHtqUXVlcnl9IGNvbnRlc3RDb250cm9sOiBUaGUgalF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBuZXdseSBjcmVhdGVkIGNvbnRlc3QgY29udHJvbFxuICovXG52YXIgY3JlYXRlQ29udGVzdENvbnRyb2wgPSBmdW5jdGlvbihjb250cm9sRGF0YSkge1xuICAgIHZhciBjb250ZXN0Q29udHJvbCA9ICQoXCI8YT5cIilcbiAgICAgICAgLmFkZENsYXNzKFwid2F2ZXMtZWZmZWN0XCIpXG4gICAgICAgIC5hZGRDbGFzcyhcIndhdmVzLWxpZ2h0XCIpXG4gICAgICAgIC5hZGRDbGFzcyhcImFtYmVyXCIpXG4gICAgICAgIC5hZGRDbGFzcyhcImRhcmtlbi0yXCIpXG4gICAgICAgIC5hZGRDbGFzcyhcImJ0blwiKVxuICAgICAgICAuYWRkQ2xhc3MoXCJjb250ZXN0LWNvbnRyb2xcIilcbiAgICAgICAgLnRleHQoY29udHJvbERhdGEudGV4dClcbiAgICAgICAgLmF0dHIoXCJocmVmXCIsIChjb250cm9sRGF0YS5saW5rID09PSB1bmRlZmluZWQgPyBudWxsIDogY29udHJvbERhdGEubGluaykpO1xuXG4gICAgcmV0dXJuIGNvbnRlc3RDb250cm9sO1xufTtcblxuLyoqXG4gKiBjcmVhdGVDb250ZXN0RGV0YWlscyhjb250ZXN0RGF0YSlcbiAqIENyZWF0ZXMgYSBcImNvbnRlc3QgZGV0YWlsc1wiIGRpdiwgYW5kIHJldHVybnMgaXQgdG8gdGhlIGNhbGxlci5cbiAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGVzdERhdGE6IEEgSlNPTiBvYmplY3QgY29udGFpbmluZyB0aGUgZGF0YSBmb3IgYSBjb250ZXN0LlxuICogQHJldHVybnMge2pRdWVyeX0gY29udGVzdERldGFpbHM6IFRoZSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIFwiY29udGVzdCBkZXRhaWxzXCIgZGl2LlxuICovXG52YXIgY3JlYXRlQ29udGVzdERldGFpbHMgPSBmdW5jdGlvbihjb250ZXN0RGF0YSkge1xuICAgIHZhciBjb250ZXN0RGV0YWlscyA9ICQoXCI8ZGl2PlwiKVxuICAgICAgICAuYWRkQ2xhc3MoXCJjb2xcIilcbiAgICAgICAgLmFkZENsYXNzKFwiczlcIilcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8aDU+XCIpLnRleHQoY29udGVzdERhdGEudGl0bGUpXG4gICAgICAgIClcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8ZGl2PlwiKVxuICAgICAgICAgICAgICAgIC5odG1sKGNvbnRlc3REYXRhLmRlc2NyaXB0aW9uKVxuICAgICAgICApO1xuXG4gICAgcmV0dXJuIGNvbnRlc3REZXRhaWxzO1xufTtcblxuLyoqXG4gKiBjcmVhdGVDb250ZXN0SG9sZGVyKGNvbnRlc3REYXRhKVxuICogQ3JlYXRlcyBhIFwiY29udGVzdCBob2xkZXJcIiBkaXYsIGFuZCByZXR1cm5zIGl0IHRvIHRoZSBjYWxsZXIuXG4gKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRlc3REYXRhOiBBIEpTT04gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRhdGEgZm9yIGEgY29udGVzdC5cbiAqIEByZXR1cm5zIHtqUXVlcnl9IGNvbnRlc3RIb2xkZXI6IFRoZSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIFwiY29udGVzdCBob2xkZXJcIiBkaXYuXG4gKi9cbnZhciBjcmVhdGVDb250ZXN0SG9sZGVyID0gZnVuY3Rpb24oY29udGVzdERhdGEpIHtcbiAgICB2YXIgY29udGVzdEhvbGRlciA9ICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcInNlY3Rpb25cIilcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcImNvbFwiKS5hZGRDbGFzcyhcInMzXCIpXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiY2VudGVyXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoXCI8aW1nPlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInNyY1wiLCBjb250ZXN0RGF0YS50aHVtYm5haWwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhcImltZy1yZXNwb25zaXZlXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhcImNvbnRlc3QtdGh1bWJuYWlsXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbnRlc3RDb250cm9sKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJWaWV3IEVudHJpZXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbnRlc3RDb250cm9sKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJMZWFkZXJib2FyZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgIGNyZWF0ZUNvbnRlc3REZXRhaWxzKGNvbnRlc3REYXRhKVxuICAgICAgICApO1xuXG4gICAgcmV0dXJuIGNvbnRlc3RIb2xkZXI7XG59O1xuXG52YXIgc2V0dXBQYWdlID0gZnVuY3Rpb24oY29udGVzdERhdGEpIHtcbiAgICBmb3IgKGxldCBjaWQgaW4gY29udGVzdERhdGEpIHtcbiAgICAgICAgbGV0IGNvbnRlc3QgPSBjb250ZXN0RGF0YVtjaWRdO1xuXG4gICAgICAgICQoXCIjY29udGVzdHNcIikuYXBwZW5kKFxuICAgICAgICAgICAgJChcIjxkaXY+XCIpLmFkZENsYXNzKFwicm93XCIpXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29udGVzdEhvbGRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogY29udGVzdC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IChjb250ZXN0LmRlc2MgPT09IFwiXCIgPyBcIk5vIGRlc2NyaXB0aW9uIHByb3ZpZGVkLlwiIDogY29udGVzdC5kZXNjKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbDogXCJodHRwczovL3d3dy5raGFuYWNhZGVteS5vcmcvXCIgKyBjb250ZXN0LmltZ1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiZGl2aWRlclwiKVxuICAgICAgICApO1xuICAgIH1cbn07XG5cbkNKUy5mZXRjaENvbnRlc3RzKHNldHVwUGFnZSk7XG5cbnNldHVwUGFnZSgpO1xuIl19
