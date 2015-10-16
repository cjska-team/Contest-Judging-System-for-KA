module.exports = (function() {
    if (!window.jQuery || !window.Firebase) {
        return;
    }

    // The following variable is used to store our "Firebase Key"
    let FIREBASE_KEY = "https://contest-judging-sys.firebaseio.com";

    // The following variable is used to specify the default number of entries to fetch
    let DEF_NUM_ENTRIES_TO_LOAD = 10;

    return {
        reportError: function(error) {
            console.error(error);
        },
        fetchFirebaseAuth: function() {
            return (new window.Firebase(FIREBASE_KEY)).getAuth();
        },
        /**
         * fetchContests(callback)
         * Fetches all contests that're being stored in Firebase, and passes them into a callback function.
         * @author Gigabyte Giant (2015)
         * @param {Function} callback: The callback function to invoke once we've captured all the data that we need.
         * @todo (Gigabyte Giant): Add better comments!
         */
        fetchContests: function(callback) {
            if (!callback || (typeof callback !== "function")) {
                return;
            }

            // Used to reference Firebase
            let firebaseRef = (new window.Firebase(FIREBASE_KEY));

            // Firebase children
            let contestKeysChild = firebaseRef.child("contestKeys");
            let contestsChild = firebaseRef.child("contests");

            // Properties that we must have before we can invoke our callback function
            let requiredProps = [
                "id",
                "name",
                "desc",
                "img",
                "entryCount"
            ];

            // keysWeFound holds a list of all of the contest keys that we've found so far
            var keysWeFound = [ ];

            // callbackData is the object that gets passed into our callback function
            var callbackData = { };

            // "Query" our contestKeysChild
            contestKeysChild.orderByKey().on("child_added", function(fbItem) {
                // Add the current key to our "keysWeFound" array
                keysWeFound.push(fbItem.key());

                let thisContest = contestsChild.child(fbItem.key());

                var thisContestData = { };

                for (let propInd = 0; propInd < requiredProps.length; propInd++) {
                    let currProperty = requiredProps[propInd];
                    thisContest.child(currProperty).once("value", function(fbSnapshot) {
                        thisContestData[currProperty] = fbSnapshot.val();

                        // TODO (Gigabyte Giant): Get rid of all this nested "crap"
                        if (Object.keys(thisContestData).length === requiredProps.length) {
                            callbackData[fbItem.key()] = thisContestData;

                            if (Object.keys(callbackData).length === keysWeFound.length) {
                                callback(callbackData);
                            }
                        }
                    });
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
        fetchContestEntries: function(contestId, callback, loadHowMany = DEF_NUM_ENTRIES_TO_LOAD) {
            // If we don't have a valid callback function, exit the function.
            if (!callback || (typeof callback !== "function")) {
                return;
            }

            // Used to reference Firebase
            let firebaseRef = (new window.Firebase(FIREBASE_KEY));

            // References to Firebase children
            let thisContestRef = firebaseRef.child("contests").child(contestId);
            let contestEntriesRef = thisContestRef.child("entryKeys");

            // Used to keep track of how many entries we've loaded
            var numLoaded = 0;

            // Used to store each of the entries that we've loaded
            var entryKeys = [ ];

            contestEntriesRef.once("value", function(fbSnapshot) {
                let tmpEntryKeys = fbSnapshot.val();

                // If there aren't at least "n" entries for this contest, load all of them.
                if (Object.keys(tmpEntryKeys).length < loadHowMany) {
                    loadHowMany = Object.keys(tmpEntryKeys).length;
                }

                while (numLoaded < loadHowMany) {
                    let randomIndex = Math.floor(Math.random() * Object.keys(tmpEntryKeys).length);
                    let selectedKey = Object.keys(tmpEntryKeys)[randomIndex];

                    if (entryKeys.indexOf(selectedKey) === -1) {
                        entryKeys.push(selectedKey);
                        numLoaded++;
                    }
                }
            }, this.reportError);

            let callbackWait = setInterval(function() {
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
        loadContestEntry: function(contestId, entryId, callback) {
            // If we don't have a valid callback function, exit the function.
            if (!callback || (typeof callback !== "function")) {
                return;
            }

            // Used to reference Firebase
            let firebaseRef = (new window.Firebase(FIREBASE_KEY));

            // References to Firebase children
            let contestRef = firebaseRef.child("contests").child(contestId);
            let entriesRef = contestRef.child("entries").child(entryId);

            // A variable containing a list of all the properties that we must load before we can invoke our callback function
            let requiredProps = [
                "id",
                "name",
                "thumb"
            ];

            // The JSON object that we'll pass into the callback function
            var callbackData = { };

            entriesRef.once("value", function(fbSnapshot) {
                let tmpEntry = fbSnapshot.val();

                for (let propInd = 0; propInd < requiredProps.length; propInd++) {
                    let thisProp = requiredProps[propInd];

                    callbackData[thisProp] = tmpEntry[thisProp];
                }

                if (Object.keys(callbackData).length === requiredProps.length) {
                    callback(callbackData);
                }
            }, this.reportError);
        }
    };
})();
