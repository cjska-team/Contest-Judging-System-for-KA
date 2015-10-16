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
        }
    };
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsWUFBVztBQUN6QixRQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7QUFDcEMsZUFBTztLQUNWOzs7QUFHRCxRQUFJLFlBQVksR0FBRyw0Q0FBNEMsQ0FBQzs7O0FBR2hFLFFBQUksdUJBQXVCLEdBQUcsRUFBRSxDQUFDOztBQUVqQyxXQUFPO0FBQ0gsbUJBQVcsRUFBRSxxQkFBUyxLQUFLLEVBQUU7QUFDekIsbUJBQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEI7QUFDRCx5QkFBaUIsRUFBRSw2QkFBVztBQUMxQixtQkFBTyxBQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBRSxPQUFPLEVBQUUsQ0FBQztTQUN4RDs7Ozs7Ozs7QUFRRCxvQkFBWSxFQUFFLHdCQUF5QjtnQkFBaEIsTUFBTSx5REFBRyxLQUFLOztBQUNqQyxnQkFBSSxXQUFXLEdBQUksSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxBQUFDLENBQUM7O0FBRXRELGdCQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1QsMkJBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ2pFLE1BQU07QUFDSCwyQkFBVyxDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUVyQixzQkFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUM1QjtTQUNKOzs7Ozs7OztBQVFE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USxDQUFDLFlBQVksQ0FBQyxBQUFDLENBQUM7OztBQUd0RCxnQkFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEUsZ0JBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs7QUFHNUQsZ0JBQUksYUFBYSxHQUFHLENBQ2hCLElBQUksRUFDSixNQUFNLEVBQ04sT0FBTyxDQUNWLENBQUM7OztBQUdGLGdCQUFJLFlBQVksR0FBRyxFQUFHLENBQUM7O0FBRXZCLHNCQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFTLFVBQVUsRUFBRTtBQUMxQyxvQkFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDOztBQUVoQyxxQkFBSyxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsT0FBTyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUU7QUFDN0Qsd0JBQUksUUFBUSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFdEMsZ0NBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQy9DOztBQUVELG9CQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxLQUFLLGFBQWEsQ0FBQyxNQUFNLEVBQUU7QUFDM0QsNEJBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDMUI7YUFDSixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUN4QjtLQUNKLENBQUM7Q0FDTCxDQUFBLEVBQUcsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgICBpZiAoIXdpbmRvdy5qUXVlcnkgfHwgIXdpbmRvdy5GaXJlYmFzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVGhlIGZvbGxvd2luZyB2YXJpYWJsZSBpcyB1c2VkIHRvIHN0b3JlIG91ciBcIkZpcmViYXNlIEtleVwiXG4gICAgbGV0IEZJUkVCQVNFX0tFWSA9IFwiaHR0cHM6Ly9jb250ZXN0LWp1ZGdpbmctc3lzLmZpcmViYXNlaW8uY29tXCI7XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIHZhcmlhYmxlIGlzIHVzZWQgdG8gc3BlY2lmeSB0aGUgZGVmYXVsdCBudW1iZXIgb2YgZW50cmllcyB0byBmZXRjaFxuICAgIGxldCBERUZfTlVNX0VOVFJJRVNfVE9fTE9BRCA9IDEwO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVwb3J0RXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgZmV0Y2hGaXJlYmFzZUF1dGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpLmdldEF1dGgoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGF1dGhlbnRpY2F0ZShsb2dvdXQpXG4gICAgICAgICAqIElmIGxvZ291dCBpcyBmYWxzZSAob3IgdW5kZWZpbmVkKSwgd2UgcmVkaXJlY3QgdG8gYSBnb29nbGUgbG9naW4gcGFnZS5cbiAgICAgICAgICogSWYgbG9nb3V0IGlzIHRydWUsIHdlIGludm9rZSBGaXJlYmFzZSdzIHVuYXV0aCBtZXRob2QgKHRvIGxvZyB0aGUgdXNlciBvdXQpLCBhbmQgcmVsb2FkIHRoZSBwYWdlLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGxvZ291dCo6IFNob3VsZCB3ZSBsb2cgdGhlIHVzZXIgb3V0PyAoRGVmYXVsdHMgdG8gZmFsc2UpXG4gICAgICAgICAqL1xuICAgICAgICBhdXRoZW50aWNhdGU6IGZ1bmN0aW9uKGxvZ291dCA9IGZhbHNlKSB7XG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgaWYgKCFsb2dvdXQpIHtcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVJlZi5hdXRoV2l0aE9BdXRoUmVkaXJlY3QoXCJnb29nbGVcIiwgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcmViYXNlUmVmLnVuYXV0aCgpO1xuXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0cyhjYWxsYmFjaylcbiAgICAgICAgICogRmV0Y2hlcyBhbGwgY29udGVzdHMgdGhhdCdyZSBiZWluZyBzdG9yZWQgaW4gRmlyZWJhc2UsIGFuZCBwYXNzZXMgdGhlbSBpbnRvIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgY2FwdHVyZWQgYWxsIHRoZSBkYXRhIHRoYXQgd2UgbmVlZC5cbiAgICAgICAgICogQHRvZG8gKEdpZ2FieXRlIEdpYW50KTogQWRkIGJldHRlciBjb21tZW50cyFcbiAgICAgICAgICovXG4gICAgICAgIGZldGNoQ29udGVzdHM6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0S2V5c0NoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0S2V5c1wiKTtcbiAgICAgICAgICAgIGxldCBjb250ZXN0c0NoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKTtcblxuICAgICAgICAgICAgLy8gUHJvcGVydGllcyB0aGF0IHdlIG11c3QgaGF2ZSBiZWZvcmUgd2UgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIGxldCByZXF1aXJlZFByb3BzID0gW1xuICAgICAgICAgICAgICAgIFwiaWRcIixcbiAgICAgICAgICAgICAgICBcIm5hbWVcIixcbiAgICAgICAgICAgICAgICBcImRlc2NcIixcbiAgICAgICAgICAgICAgICBcImltZ1wiLFxuICAgICAgICAgICAgICAgIFwiZW50cnlDb3VudFwiXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAvLyBrZXlzV2VGb3VuZCBob2xkcyBhIGxpc3Qgb2YgYWxsIG9mIHRoZSBjb250ZXN0IGtleXMgdGhhdCB3ZSd2ZSBmb3VuZCBzbyBmYXJcbiAgICAgICAgICAgIHZhciBrZXlzV2VGb3VuZCA9IFsgXTtcblxuICAgICAgICAgICAgLy8gY2FsbGJhY2tEYXRhIGlzIHRoZSBvYmplY3QgdGhhdCBnZXRzIHBhc3NlZCBpbnRvIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHsgfTtcblxuICAgICAgICAgICAgLy8gXCJRdWVyeVwiIG91ciBjb250ZXN0S2V5c0NoaWxkXG4gICAgICAgICAgICBjb250ZXN0S2V5c0NoaWxkLm9yZGVyQnlLZXkoKS5vbihcImNoaWxkX2FkZGVkXCIsIGZ1bmN0aW9uKGZiSXRlbSkge1xuICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgY3VycmVudCBrZXkgdG8gb3VyIFwia2V5c1dlRm91bmRcIiBhcnJheVxuICAgICAgICAgICAgICAgIGtleXNXZUZvdW5kLnB1c2goZmJJdGVtLmtleSgpKTtcblxuICAgICAgICAgICAgICAgIGxldCB0aGlzQ29udGVzdCA9IGNvbnRlc3RzQ2hpbGQuY2hpbGQoZmJJdGVtLmtleSgpKTtcblxuICAgICAgICAgICAgICAgIHZhciB0aGlzQ29udGVzdERhdGEgPSB7IH07XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwcm9wSW5kID0gMDsgcHJvcEluZCA8IHJlcXVpcmVkUHJvcHMubGVuZ3RoOyBwcm9wSW5kKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJQcm9wZXJ0eSA9IHJlcXVpcmVkUHJvcHNbcHJvcEluZF07XG4gICAgICAgICAgICAgICAgICAgIHRoaXNDb250ZXN0LmNoaWxkKGN1cnJQcm9wZXJ0eSkub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKGZiU25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNDb250ZXN0RGF0YVtjdXJyUHJvcGVydHldID0gZmJTbmFwc2hvdC52YWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyAoR2lnYWJ5dGUgR2lhbnQpOiBHZXQgcmlkIG9mIGFsbCB0aGlzIG5lc3RlZCBcImNyYXBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXNDb250ZXN0RGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtmYkl0ZW0ua2V5KCldID0gdGhpc0NvbnRlc3REYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSBrZXlzV2VGb3VuZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0RW50cmllcyhjb250ZXN0SWQsIGNhbGxiYWNrKVxuICAgICAgICAgKlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgS2hhbiBBY2FkZW15IHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSB3YW50IHRvIGZldGNoIGVudHJpZXMgZm9yLlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBhZnRlciB3ZSd2ZSBmZXRjaGVkIGFsbCB0aGUgZGF0YSB0aGF0IHdlIG5lZWQuXG4gICAgICAgICAqIEBwYXJhbSB7SW50ZWdlcn0gbG9hZEhvd01hbnkqOiBUaGUgbnVtYmVyIG9mIGVudHJpZXMgdG8gbG9hZC4gSWYgbm8gdmFsdWUgaXMgcGFzc2VkIHRvIHRoaXMgcGFyYW1ldGVyLFxuICAgICAgICAgKiAgZmFsbGJhY2sgb250byBhIGRlZmF1bHQgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3RFbnRyaWVzOiBmdW5jdGlvbihjb250ZXN0SWQsIGNhbGxiYWNrLCBsb2FkSG93TWFueSA9IERFRl9OVU1fRU5UUklFU19UT19MT0FEKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdmFsaWQgY2FsbGJhY2sgZnVuY3Rpb24sIGV4aXQgdGhlIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZXMgdG8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCB0aGlzQ29udGVzdFJlZiA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKTtcbiAgICAgICAgICAgIGxldCBjb250ZXN0RW50cmllc1JlZiA9IHRoaXNDb250ZXN0UmVmLmNoaWxkKFwiZW50cnlLZXlzXCIpO1xuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgZW50cmllcyB3ZSd2ZSBsb2FkZWRcbiAgICAgICAgICAgIHZhciBudW1Mb2FkZWQgPSAwO1xuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHN0b3JlIGVhY2ggb2YgdGhlIGVudHJpZXMgdGhhdCB3ZSd2ZSBsb2FkZWRcbiAgICAgICAgICAgIHZhciBlbnRyeUtleXMgPSBbIF07XG5cbiAgICAgICAgICAgIGNvbnRlc3RFbnRyaWVzUmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihmYlNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgbGV0IHRtcEVudHJ5S2V5cyA9IGZiU25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmVuJ3QgYXQgbGVhc3QgXCJuXCIgZW50cmllcyBmb3IgdGhpcyBjb250ZXN0LCBsb2FkIGFsbCBvZiB0aGVtLlxuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0bXBFbnRyeUtleXMpLmxlbmd0aCA8IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIb3dNYW55ID0gT2JqZWN0LmtleXModG1wRW50cnlLZXlzKS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKG51bUxvYWRlZCA8IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE9iamVjdC5rZXlzKHRtcEVudHJ5S2V5cykubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkS2V5ID0gT2JqZWN0LmtleXModG1wRW50cnlLZXlzKVtyYW5kb21JbmRleF07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJ5S2V5cy5pbmRleE9mKHNlbGVjdGVkS2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5S2V5cy5wdXNoKHNlbGVjdGVkS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bUxvYWRlZCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcy5yZXBvcnRFcnJvcik7XG5cbiAgICAgICAgICAgIGxldCBjYWxsYmFja1dhaXQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVtTG9hZGVkID09PSBsb2FkSG93TWFueSkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhbGxiYWNrV2FpdCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVudHJ5S2V5cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsb2FkQ29udGVzdEVudHJ5KGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2spXG4gICAgICAgICAqIExvYWRzIGEgY29udGVzdCBlbnRyeSAod2hpY2ggaXMgc3BlY2lmaWVkIHZpYSBwcm92aWRpbmcgYSBjb250ZXN0IGlkIGFuZCBhbiBlbnRyeSBpZCkuXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgdGhpcyBlbnRyeSByZXNpZGVzIHVuZGVyLlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZW50cnlJZDogVGhlIHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGVudHJ5LlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgdGhlIHJlcXVpcmVkIGRhdGEuXG4gICAgICAgICAqIEB0b2RvIChHaWdhYnl0ZSBHaWFudCk6IEFkZCBhdXRoZW50aWNhdGlvbiB0byB0aGlzIGZ1bmN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBsb2FkQ29udGVzdEVudHJ5OiBmdW5jdGlvbihjb250ZXN0SWQsIGVudHJ5SWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdmFsaWQgY2FsbGJhY2sgZnVuY3Rpb24sIGV4aXQgdGhlIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZXMgdG8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0UmVmID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKS5jaGlsZChjb250ZXN0SWQpO1xuICAgICAgICAgICAgbGV0IGVudHJpZXNSZWYgPSBjb250ZXN0UmVmLmNoaWxkKFwiZW50cmllc1wiKS5jaGlsZChlbnRyeUlkKTtcblxuICAgICAgICAgICAgLy8gQSB2YXJpYWJsZSBjb250YWluaW5nIGEgbGlzdCBvZiBhbGwgdGhlIHByb3BlcnRpZXMgdGhhdCB3ZSBtdXN0IGxvYWQgYmVmb3JlIHdlIGNhbiBpbnZva2Ugb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICBsZXQgcmVxdWlyZWRQcm9wcyA9IFtcbiAgICAgICAgICAgICAgICBcImlkXCIsXG4gICAgICAgICAgICAgICAgXCJuYW1lXCIsXG4gICAgICAgICAgICAgICAgXCJ0aHVtYlwiXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAvLyBUaGUgSlNPTiBvYmplY3QgdGhhdCB3ZSdsbCBwYXNzIGludG8gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0geyB9O1xuXG4gICAgICAgICAgICBlbnRyaWVzUmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihmYlNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgbGV0IHRtcEVudHJ5ID0gZmJTbmFwc2hvdC52YWwoKTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IHByb3BJbmQgPSAwOyBwcm9wSW5kIDwgcmVxdWlyZWRQcm9wcy5sZW5ndGg7IHByb3BJbmQrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGhpc1Byb3AgPSByZXF1aXJlZFByb3BzW3Byb3BJbmRdO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVt0aGlzUHJvcF0gPSB0bXBFbnRyeVt0aGlzUHJvcF07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG4iXX0=
