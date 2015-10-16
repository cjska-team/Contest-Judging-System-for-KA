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
        onceAuthed: function onceAuthed(callback) {
            new window.Firebase(FIREBASE_KEY).onAuth(callback, this.reportError);
        },
        /**
         * authenticate(logout)
         * If logout is false (or undefined), we redirect to a google login page.
         * If logout is true, we invoke Firebase's unauth method (to log the user out), and reload the page.
         * @author Gigabyte Giant (2015)
         * @param {Boolean} logout*: Should we log the user out? (Defaults to false)
         */
        authenticate: function authenticate() {
            var logout = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var firebaseRef = new window.Firebase(FIREBASE_KEY);

            if (!logout) {
                firebaseRef.authWithOAuthRedirect("google", this.reportError);
            } else {
                firebaseRef.unauth();

                window.location.reload();
            }
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
        },
        /**
         * loadXContestEntries(contestId, callback, loadHowMany)
         * Loads "x" contest entries, and passes them into a callback function.
         * @author Gigabyte Giant (2015)
         * @param {String} contestId: The scratchpad ID of the contest that we want to load entries from.
         * @param {Function} callback: The callback function to invoke once we've loaded all the required data.
         * @param {Integer} loadHowMany: The number of entries that we'd like to load.
         */
        loadXContestEntries: function loadXContestEntries(contestId, callback, loadHowMany) {
            // "this" will eventually go out of scope (later on in this function),
            //  that's why we have this variable.
            var self = this;

            this.fetchContestEntries(contestId, function (response) {
                var callbackData = {};

                var _loop2 = function (entryId) {
                    var thisEntryId = response[entryId];

                    self.loadContestEntry(contestId, thisEntryId, function (response) {
                        callbackData[thisEntryId] = response;
                    });
                };

                for (var entryId = 0; entryId < response.length; entryId++) {
                    _loop2(entryId);
                }

                var callbackWait = setInterval(function () {
                    if (Object.keys(callbackData).length === loadHowMany) {
                        clearInterval(callbackWait);
                        callback(callbackData);
                    }
                }, 1000);
            }, loadHowMany);
        }
    };
})();

},{}],2:[function(require,module,exports){
"use strict";

var CJS = require("../backend/contest_judging_sys.js");

var fbAuth = CJS.fetchFirebaseAuth();

/**
 * createContestControl(controlData)
 * Creates a button using the data specified, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @contributors Darryl Yeo (2015)
 * @param {Object} controlData: The JSON object containing the data for the control (such as display text and where the control should link to)
 * @returns {jQuery} contestControl: The jQuery object containing the newly created contest control
 */
var createContestControl = function createContestControl(controlData) {
    return $("<a>").addClass("waves-effect waves-light amber darken-2 btn contest-control").text(controlData.text).attr("href", controlData.link === undefined ? null : controlData.link);
};

/**
 * createContestDetails(contestData)
 * Creates a "contest details" div, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @contributors Darryl Yeo (2015)
 * @param {Object} contestData: A JSON object containing the data for a contest.
 * @returns {jQuery} contestDetails: The jQuery object containing the "contest details" div.
 */
var createContestDetails = function createContestDetails(contestData) {
    return $("<div>").addClass("col s12 m9").append($("<h5>").text(contestData.title)).append($("<div>").html(contestData.description));
};

/**
 * createContestHolder(contestData)
 * Creates a "contest holder" div, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @contributors Darryl Yeo (2015)
 * @param {Object} contestData: A JSON object containing the data for a contest.
 * @returns {jQuery} contestHolder: The jQuery object containing the "contest holder" div.
 */
var createContestHolder = function createContestHolder(contestData) {
    return $("<div>").addClass("section").append($("<div>").addClass("col s12 m3").append($("<div>").addClass("center").append($("<img>").attr("src", contestData.thumbnail).addClass("img-responsive contest-thumbnail")).append(createContestControl({
        text: "View Entries",
        link: "contest.html"
    })).append(createContestControl({
        text: "Leaderboard"
    })))).append(createContestDetails(contestData));
};

var setupPage = function setupPage(contestData) {
    if (fbAuth === null) {
        $("#authBtn").text("Hello, guest! Click me to login.");
    } else {
        $("#authBtn").text("Welcome, {name}! (Not you? Click here)".replace("{name}", CJS.fetchFirebaseAuth().google.displayName));
    }

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

$("#authBtn").on("click", function (evt) {
    evt.preventDefault();

    if (fbAuth === null) {
        CJS.authenticate();
    } else {
        CJS.authenticate(true);
    }
});

},{"../backend/contest_judging_sys.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2NsaWVudC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLFlBQVc7QUFDekIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO0FBQ3BDLGVBQU87S0FDVjs7O0FBR0QsUUFBSSxZQUFZLEdBQUcsNENBQTRDLENBQUM7OztBQUdoRSxRQUFJLHVCQUF1QixHQUFHLEVBQUUsQ0FBQzs7QUFFakMsV0FBTztBQUNILG1CQUFXLEVBQUUscUJBQVMsS0FBSyxFQUFFO0FBQ3pCLG1CQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3hCO0FBQ0QseUJBQWlCLEVBQUUsNkJBQVc7QUFDMUIsbUJBQU8sQUFBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUUsT0FBTyxFQUFFLENBQUM7U0FDeEQ7QUFDRCxrQkFBVSxFQUFFLG9CQUFTLFFBQVEsRUFBRTtBQUMzQixBQUFDLGdCQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDMUU7Ozs7Ozs7O0FBUUQsb0JBQVksRUFBRSx3QkFBeUI7Z0JBQWhCLE1BQU0seURBQUcsS0FBSzs7QUFDakMsZ0JBQUksV0FBVyxHQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMs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QyxDQUNqQyxDQUFDO0tBQ0w7Q0FDSixDQUFDOztBQUVGLEdBQUcsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRTdCLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVMsR0FBRyxFQUFFO0FBQ3BDLE9BQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQzs7QUFFckIsUUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO0FBQ2pCLFdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztLQUN0QixNQUFNO0FBQ0gsV0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMxQjtDQUNKLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgICBpZiAoIXdpbmRvdy5qUXVlcnkgfHwgIXdpbmRvdy5GaXJlYmFzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVGhlIGZvbGxvd2luZyB2YXJpYWJsZSBpcyB1c2VkIHRvIHN0b3JlIG91ciBcIkZpcmViYXNlIEtleVwiXG4gICAgbGV0IEZJUkVCQVNFX0tFWSA9IFwiaHR0cHM6Ly9jb250ZXN0LWp1ZGdpbmctc3lzLmZpcmViYXNlaW8uY29tXCI7XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIHZhcmlhYmxlIGlzIHVzZWQgdG8gc3BlY2lmeSB0aGUgZGVmYXVsdCBudW1iZXIgb2YgZW50cmllcyB0byBmZXRjaFxuICAgIGxldCBERUZfTlVNX0VOVFJJRVNfVE9fTE9BRCA9IDEwO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVwb3J0RXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgZmV0Y2hGaXJlYmFzZUF1dGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpLmdldEF1dGgoKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25jZUF1dGhlZDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpLm9uQXV0aChjYWxsYmFjaywgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhdXRoZW50aWNhdGUobG9nb3V0KVxuICAgICAgICAgKiBJZiBsb2dvdXQgaXMgZmFsc2UgKG9yIHVuZGVmaW5lZCksIHdlIHJlZGlyZWN0IHRvIGEgZ29vZ2xlIGxvZ2luIHBhZ2UuXG4gICAgICAgICAqIElmIGxvZ291dCBpcyB0cnVlLCB3ZSBpbnZva2UgRmlyZWJhc2UncyB1bmF1dGggbWV0aG9kICh0byBsb2cgdGhlIHVzZXIgb3V0KSwgYW5kIHJlbG9hZCB0aGUgcGFnZS5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtCb29sZWFufSBsb2dvdXQqOiBTaG91bGQgd2UgbG9nIHRoZSB1c2VyIG91dD8gKERlZmF1bHRzIHRvIGZhbHNlKVxuICAgICAgICAgKi9cbiAgICAgICAgYXV0aGVudGljYXRlOiBmdW5jdGlvbihsb2dvdXQgPSBmYWxzZSkge1xuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIGlmICghbG9nb3V0KSB7XG4gICAgICAgICAgICAgICAgZmlyZWJhc2VSZWYuYXV0aFdpdGhPQXV0aFJlZGlyZWN0KFwiZ29vZ2xlXCIsIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVJlZi51bmF1dGgoKTtcblxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZldGNoQ29udGVzdHMoY2FsbGJhY2spXG4gICAgICAgICAqIEZldGNoZXMgYWxsIGNvbnRlc3RzIHRoYXQncmUgYmVpbmcgc3RvcmVkIGluIEZpcmViYXNlLCBhbmQgcGFzc2VzIHRoZW0gaW50byBhIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGNhcHR1cmVkIGFsbCB0aGUgZGF0YSB0aGF0IHdlIG5lZWQuXG4gICAgICAgICAqIEB0b2RvIChHaWdhYnl0ZSBHaWFudCk6IEFkZCBiZXR0ZXIgY29tbWVudHMhXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3RzOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIEZpcmViYXNlIGNoaWxkcmVuXG4gICAgICAgICAgICBsZXQgY29udGVzdEtleXNDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdEtleXNcIik7XG4gICAgICAgICAgICBsZXQgY29udGVzdHNDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIik7XG5cbiAgICAgICAgICAgIC8vIFByb3BlcnRpZXMgdGhhdCB3ZSBtdXN0IGhhdmUgYmVmb3JlIHdlIGNhbiBpbnZva2Ugb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICBsZXQgcmVxdWlyZWRQcm9wcyA9IFtcbiAgICAgICAgICAgICAgICBcImlkXCIsXG4gICAgICAgICAgICAgICAgXCJuYW1lXCIsXG4gICAgICAgICAgICAgICAgXCJkZXNjXCIsXG4gICAgICAgICAgICAgICAgXCJpbWdcIixcbiAgICAgICAgICAgICAgICBcImVudHJ5Q291bnRcIlxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgLy8ga2V5c1dlRm91bmQgaG9sZHMgYSBsaXN0IG9mIGFsbCBvZiB0aGUgY29udGVzdCBrZXlzIHRoYXQgd2UndmUgZm91bmQgc28gZmFyXG4gICAgICAgICAgICB2YXIga2V5c1dlRm91bmQgPSBbIF07XG5cbiAgICAgICAgICAgIC8vIGNhbGxiYWNrRGF0YSBpcyB0aGUgb2JqZWN0IHRoYXQgZ2V0cyBwYXNzZWQgaW50byBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7IH07XG5cbiAgICAgICAgICAgIC8vIFwiUXVlcnlcIiBvdXIgY29udGVzdEtleXNDaGlsZFxuICAgICAgICAgICAgY29udGVzdEtleXNDaGlsZC5vcmRlckJ5S2V5KCkub24oXCJjaGlsZF9hZGRlZFwiLCBmdW5jdGlvbihmYkl0ZW0pIHtcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGN1cnJlbnQga2V5IHRvIG91ciBcImtleXNXZUZvdW5kXCIgYXJyYXlcbiAgICAgICAgICAgICAgICBrZXlzV2VGb3VuZC5wdXNoKGZiSXRlbS5rZXkoKSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdGhpc0NvbnRlc3QgPSBjb250ZXN0c0NoaWxkLmNoaWxkKGZiSXRlbS5rZXkoKSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGhpc0NvbnRlc3REYXRhID0geyB9O1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcHJvcEluZCA9IDA7IHByb3BJbmQgPCByZXF1aXJlZFByb3BzLmxlbmd0aDsgcHJvcEluZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyUHJvcGVydHkgPSByZXF1aXJlZFByb3BzW3Byb3BJbmRdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzQ29udGVzdC5jaGlsZChjdXJyUHJvcGVydHkpLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihmYlNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzQ29udGVzdERhdGFbY3VyclByb3BlcnR5XSA9IGZiU25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gKEdpZ2FieXRlIEdpYW50KTogR2V0IHJpZCBvZiBhbGwgdGhpcyBuZXN0ZWQgXCJjcmFwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzQ29udGVzdERhdGEpLmxlbmd0aCA9PT0gcmVxdWlyZWRQcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbZmJJdGVtLmtleSgpXSA9IHRoaXNDb250ZXN0RGF0YTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0ga2V5c1dlRm91bmQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzLnJlcG9ydEVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZldGNoQ29udGVzdEVudHJpZXMoY29udGVzdElkLCBjYWxsYmFjaylcbiAgICAgICAgICpcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIEtoYW4gQWNhZGVteSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgd2Ugd2FudCB0byBmZXRjaCBlbnRyaWVzIGZvci5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2UgYWZ0ZXIgd2UndmUgZmV0Y2hlZCBhbGwgdGhlIGRhdGEgdGhhdCB3ZSBuZWVkLlxuICAgICAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IGxvYWRIb3dNYW55KjogVGhlIG51bWJlciBvZiBlbnRyaWVzIHRvIGxvYWQuIElmIG5vIHZhbHVlIGlzIHBhc3NlZCB0byB0aGlzIHBhcmFtZXRlcixcbiAgICAgICAgICogIGZhbGxiYWNrIG9udG8gYSBkZWZhdWx0IHZhbHVlLlxuICAgICAgICAgKi9cbiAgICAgICAgZmV0Y2hDb250ZXN0RW50cmllczogZnVuY3Rpb24oY29udGVzdElkLCBjYWxsYmFjaywgbG9hZEhvd01hbnkgPSBERUZfTlVNX0VOVFJJRVNfVE9fTE9BRCkge1xuICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIHZhbGlkIGNhbGxiYWNrIGZ1bmN0aW9uLCBleGl0IHRoZSBmdW5jdGlvbi5cbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBSZWZlcmVuY2VzIHRvIEZpcmViYXNlIGNoaWxkcmVuXG4gICAgICAgICAgICBsZXQgdGhpc0NvbnRlc3RSZWYgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZCk7XG4gICAgICAgICAgICBsZXQgY29udGVzdEVudHJpZXNSZWYgPSB0aGlzQ29udGVzdFJlZi5jaGlsZChcImVudHJ5S2V5c1wiKTtcblxuICAgICAgICAgICAgLy8gVXNlZCB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IGVudHJpZXMgd2UndmUgbG9hZGVkXG4gICAgICAgICAgICB2YXIgbnVtTG9hZGVkID0gMDtcblxuICAgICAgICAgICAgLy8gVXNlZCB0byBzdG9yZSBlYWNoIG9mIHRoZSBlbnRyaWVzIHRoYXQgd2UndmUgbG9hZGVkXG4gICAgICAgICAgICB2YXIgZW50cnlLZXlzID0gWyBdO1xuXG4gICAgICAgICAgICBjb250ZXN0RW50cmllc1JlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oZmJTbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgIGxldCB0bXBFbnRyeUtleXMgPSBmYlNuYXBzaG90LnZhbCgpO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlbid0IGF0IGxlYXN0IFwiblwiIGVudHJpZXMgZm9yIHRoaXMgY29udGVzdCwgbG9hZCBhbGwgb2YgdGhlbS5cbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModG1wRW50cnlLZXlzKS5sZW5ndGggPCBsb2FkSG93TWFueSkge1xuICAgICAgICAgICAgICAgICAgICBsb2FkSG93TWFueSA9IE9iamVjdC5rZXlzKHRtcEVudHJ5S2V5cykubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdoaWxlIChudW1Mb2FkZWQgPCBsb2FkSG93TWFueSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBPYmplY3Qua2V5cyh0bXBFbnRyeUtleXMpLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEtleSA9IE9iamVjdC5rZXlzKHRtcEVudHJ5S2V5cylbcmFuZG9tSW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeUtleXMuaW5kZXhPZihzZWxlY3RlZEtleSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRyeUtleXMucHVzaChzZWxlY3RlZEtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBudW1Mb2FkZWQrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuXG4gICAgICAgICAgICBsZXQgY2FsbGJhY2tXYWl0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bUxvYWRlZCA9PT0gbG9hZEhvd01hbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChjYWxsYmFja1dhaXQpO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlbnRyeUtleXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogbG9hZENvbnRlc3RFbnRyeShjb250ZXN0SWQsIGVudHJ5SWQsIGNhbGxiYWNrKVxuICAgICAgICAgKiBMb2FkcyBhIGNvbnRlc3QgZW50cnkgKHdoaWNoIGlzIHNwZWNpZmllZCB2aWEgcHJvdmlkaW5nIGEgY29udGVzdCBpZCBhbmQgYW4gZW50cnkgaWQpLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgc2NyYXRjaHBhZCBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHRoaXMgZW50cnkgcmVzaWRlcyB1bmRlci5cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGVudHJ5SWQ6IFRoZSBzY3JhdGNocGFkIElEIG9mIHRoZSBlbnRyeS5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIHRoZSByZXF1aXJlZCBkYXRhLlxuICAgICAgICAgKiBAdG9kbyAoR2lnYWJ5dGUgR2lhbnQpOiBBZGQgYXV0aGVudGljYXRpb24gdG8gdGhpcyBmdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgbG9hZENvbnRlc3RFbnRyeTogZnVuY3Rpb24oY29udGVzdElkLCBlbnRyeUlkLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIHZhbGlkIGNhbGxiYWNrIGZ1bmN0aW9uLCBleGl0IHRoZSBmdW5jdGlvbi5cbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBSZWZlcmVuY2VzIHRvIEZpcmViYXNlIGNoaWxkcmVuXG4gICAgICAgICAgICBsZXQgY29udGVzdFJlZiA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKTtcbiAgICAgICAgICAgIGxldCBlbnRyaWVzUmVmID0gY29udGVzdFJlZi5jaGlsZChcImVudHJpZXNcIikuY2hpbGQoZW50cnlJZCk7XG5cbiAgICAgICAgICAgIC8vIEEgdmFyaWFibGUgY29udGFpbmluZyBhIGxpc3Qgb2YgYWxsIHRoZSBwcm9wZXJ0aWVzIHRoYXQgd2UgbXVzdCBsb2FkIGJlZm9yZSB3ZSBjYW4gaW52b2tlIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgbGV0IHJlcXVpcmVkUHJvcHMgPSBbXG4gICAgICAgICAgICAgICAgXCJpZFwiLFxuICAgICAgICAgICAgICAgIFwibmFtZVwiLFxuICAgICAgICAgICAgICAgIFwidGh1bWJcIlxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgLy8gVGhlIEpTT04gb2JqZWN0IHRoYXQgd2UnbGwgcGFzcyBpbnRvIHRoZSBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHsgfTtcblxuICAgICAgICAgICAgZW50cmllc1JlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oZmJTbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgIGxldCB0bXBFbnRyeSA9IGZiU25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwcm9wSW5kID0gMDsgcHJvcEluZCA8IHJlcXVpcmVkUHJvcHMubGVuZ3RoOyBwcm9wSW5kKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRoaXNQcm9wID0gcmVxdWlyZWRQcm9wc1twcm9wSW5kXTtcblxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbdGhpc1Byb3BdID0gdG1wRW50cnlbdGhpc1Byb3BdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0gcmVxdWlyZWRQcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzLnJlcG9ydEVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGxvYWRYQ29udGVzdEVudHJpZXMoY29udGVzdElkLCBjYWxsYmFjaywgbG9hZEhvd01hbnkpXG4gICAgICAgICAqIExvYWRzIFwieFwiIGNvbnRlc3QgZW50cmllcywgYW5kIHBhc3NlcyB0aGVtIGludG8gYSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSB3YW50IHRvIGxvYWQgZW50cmllcyBmcm9tLlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgdGhlIHJlcXVpcmVkIGRhdGEuXG4gICAgICAgICAqIEBwYXJhbSB7SW50ZWdlcn0gbG9hZEhvd01hbnk6IFRoZSBudW1iZXIgb2YgZW50cmllcyB0aGF0IHdlJ2QgbGlrZSB0byBsb2FkLlxuICAgICAgICAgKi9cbiAgICAgICAgbG9hZFhDb250ZXN0RW50cmllczogZnVuY3Rpb24oY29udGVzdElkLCBjYWxsYmFjaywgbG9hZEhvd01hbnkpIHtcbiAgICAgICAgICAgIC8vIFwidGhpc1wiIHdpbGwgZXZlbnR1YWxseSBnbyBvdXQgb2Ygc2NvcGUgKGxhdGVyIG9uIGluIHRoaXMgZnVuY3Rpb24pLFxuICAgICAgICAgICAgLy8gIHRoYXQncyB3aHkgd2UgaGF2ZSB0aGlzIHZhcmlhYmxlLlxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmZldGNoQ29udGVzdEVudHJpZXMoY29udGVzdElkLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7IH07XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBlbnRyeUlkID0gMDsgZW50cnlJZCA8IHJlc3BvbnNlLmxlbmd0aDsgZW50cnlJZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0aGlzRW50cnlJZCA9IHJlc3BvbnNlW2VudHJ5SWRdO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYubG9hZENvbnRlc3RFbnRyeShjb250ZXN0SWQsIHRoaXNFbnRyeUlkLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhW3RoaXNFbnRyeUlkXSA9IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgY2FsbGJhY2tXYWl0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0gbG9hZEhvd01hbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoY2FsbGJhY2tXYWl0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgIH0sIGxvYWRIb3dNYW55KTtcbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuIiwidmFyIENKUyA9IHJlcXVpcmUoXCIuLi9iYWNrZW5kL2NvbnRlc3RfanVkZ2luZ19zeXMuanNcIik7XG5cbmxldCBmYkF1dGggPSBDSlMuZmV0Y2hGaXJlYmFzZUF1dGgoKTtcblxuLyoqXG4gKiBjcmVhdGVDb250ZXN0Q29udHJvbChjb250cm9sRGF0YSlcbiAqIENyZWF0ZXMgYSBidXR0b24gdXNpbmcgdGhlIGRhdGEgc3BlY2lmaWVkLCBhbmQgcmV0dXJucyBpdCB0byB0aGUgY2FsbGVyLlxuICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAqIEBjb250cmlidXRvcnMgRGFycnlsIFllbyAoMjAxNSlcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250cm9sRGF0YTogVGhlIEpTT04gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRhdGEgZm9yIHRoZSBjb250cm9sIChzdWNoIGFzIGRpc3BsYXkgdGV4dCBhbmQgd2hlcmUgdGhlIGNvbnRyb2wgc2hvdWxkIGxpbmsgdG8pXG4gKiBAcmV0dXJucyB7alF1ZXJ5fSBjb250ZXN0Q29udHJvbDogVGhlIGpRdWVyeSBvYmplY3QgY29udGFpbmluZyB0aGUgbmV3bHkgY3JlYXRlZCBjb250ZXN0IGNvbnRyb2xcbiAqL1xudmFyIGNyZWF0ZUNvbnRlc3RDb250cm9sID0gZnVuY3Rpb24oY29udHJvbERhdGEpIHtcbiAgICByZXR1cm4gJChcIjxhPlwiKVxuICAgICAgICAuYWRkQ2xhc3MoXCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYW1iZXIgZGFya2VuLTIgYnRuIGNvbnRlc3QtY29udHJvbFwiKVxuICAgICAgICAudGV4dChjb250cm9sRGF0YS50ZXh0KVxuICAgICAgICAuYXR0cihcImhyZWZcIiwgKGNvbnRyb2xEYXRhLmxpbmsgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBjb250cm9sRGF0YS5saW5rKSk7XG59O1xuXG4vKipcbiAqIGNyZWF0ZUNvbnRlc3REZXRhaWxzKGNvbnRlc3REYXRhKVxuICogQ3JlYXRlcyBhIFwiY29udGVzdCBkZXRhaWxzXCIgZGl2LCBhbmQgcmV0dXJucyBpdCB0byB0aGUgY2FsbGVyLlxuICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAqIEBjb250cmlidXRvcnMgRGFycnlsIFllbyAoMjAxNSlcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXN0RGF0YTogQSBKU09OIG9iamVjdCBjb250YWluaW5nIHRoZSBkYXRhIGZvciBhIGNvbnRlc3QuXG4gKiBAcmV0dXJucyB7alF1ZXJ5fSBjb250ZXN0RGV0YWlsczogVGhlIGpRdWVyeSBvYmplY3QgY29udGFpbmluZyB0aGUgXCJjb250ZXN0IGRldGFpbHNcIiBkaXYuXG4gKi9cbnZhciBjcmVhdGVDb250ZXN0RGV0YWlscyA9IGZ1bmN0aW9uKGNvbnRlc3REYXRhKSB7XG4gICAgcmV0dXJuICQoXCI8ZGl2PlwiKVxuICAgICAgICAuYWRkQ2xhc3MoXCJjb2wgczEyIG05XCIpXG4gICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAkKFwiPGg1PlwiKS50ZXh0KGNvbnRlc3REYXRhLnRpdGxlKVxuICAgICAgICApXG4gICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAkKFwiPGRpdj5cIilcbiAgICAgICAgICAgICAgICAuaHRtbChjb250ZXN0RGF0YS5kZXNjcmlwdGlvbilcbiAgICAgICAgKTtcbn07XG5cbi8qKlxuICogY3JlYXRlQ29udGVzdEhvbGRlcihjb250ZXN0RGF0YSlcbiAqIENyZWF0ZXMgYSBcImNvbnRlc3QgaG9sZGVyXCIgZGl2LCBhbmQgcmV0dXJucyBpdCB0byB0aGUgY2FsbGVyLlxuICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAqIEBjb250cmlidXRvcnMgRGFycnlsIFllbyAoMjAxNSlcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXN0RGF0YTogQSBKU09OIG9iamVjdCBjb250YWluaW5nIHRoZSBkYXRhIGZvciBhIGNvbnRlc3QuXG4gKiBAcmV0dXJucyB7alF1ZXJ5fSBjb250ZXN0SG9sZGVyOiBUaGUgalF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBcImNvbnRlc3QgaG9sZGVyXCIgZGl2LlxuICovXG52YXIgY3JlYXRlQ29udGVzdEhvbGRlciA9IGZ1bmN0aW9uKGNvbnRlc3REYXRhKSB7XG4gICAgcmV0dXJuICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcInNlY3Rpb25cIilcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcImNvbCBzMTIgbTNcIilcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgICAgICAgICAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJjZW50ZXJcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcIjxpbWc+XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3JjXCIsIGNvbnRlc3REYXRhLnRodW1ibmFpbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKFwiaW1nLXJlc3BvbnNpdmUgY29udGVzdC10aHVtYm5haWxcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29udGVzdENvbnRyb2woe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIlZpZXcgRW50cmllc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rOiBcImNvbnRlc3QuaHRtbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29udGVzdENvbnRyb2woe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIkxlYWRlcmJvYXJkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgY3JlYXRlQ29udGVzdERldGFpbHMoY29udGVzdERhdGEpXG4gICAgICAgICk7XG59O1xuXG52YXIgc2V0dXBQYWdlID0gZnVuY3Rpb24oY29udGVzdERhdGEpIHtcbiAgICBpZiAoZmJBdXRoID09PSBudWxsKSB7XG4gICAgICAgICQoXCIjYXV0aEJ0blwiKS50ZXh0KFwiSGVsbG8sIGd1ZXN0ISBDbGljayBtZSB0byBsb2dpbi5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJChcIiNhdXRoQnRuXCIpLnRleHQoXCJXZWxjb21lLCB7bmFtZX0hIChOb3QgeW91PyBDbGljayBoZXJlKVwiLnJlcGxhY2UoXCJ7bmFtZX1cIiwgQ0pTLmZldGNoRmlyZWJhc2VBdXRoKCkuZ29vZ2xlLmRpc3BsYXlOYW1lKSk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgY2lkIGluIGNvbnRlc3REYXRhKSB7XG4gICAgICAgIGxldCBjb250ZXN0ID0gY29udGVzdERhdGFbY2lkXTtcblxuICAgICAgICAkKFwiI2NvbnRlc3RzXCIpLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcInJvd1wiKVxuICAgICAgICAgICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbnRlc3RIb2xkZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGNvbnRlc3QubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoY29udGVzdC5kZXNjID09PSBcIlwiID8gXCJObyBkZXNjcmlwdGlvbiBwcm92aWRlZC5cIiA6IGNvbnRlc3QuZGVzYyksXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHVtYm5haWw6IFwiaHR0cHM6Ly93d3cua2hhbmFjYWRlbXkub3JnL1wiICsgY29udGVzdC5pbWdcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcImRpdmlkZXJcIilcbiAgICAgICAgKTtcbiAgICB9XG59O1xuXG5DSlMuZmV0Y2hDb250ZXN0cyhzZXR1cFBhZ2UpO1xuXG4kKFwiI2F1dGhCdG5cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbihldnQpIHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGlmIChmYkF1dGggPT09IG51bGwpIHtcbiAgICAgICAgQ0pTLmF1dGhlbnRpY2F0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIENKUy5hdXRoZW50aWNhdGUodHJ1ZSk7XG4gICAgfVxufSk7XG4iXX0=
