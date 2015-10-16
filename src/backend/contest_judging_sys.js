module.exports = (function() {
    if (!window.jQuery || !window.Firebase) {
        return;
    }

    // The following variable is used to store our "Firebase Key"
    let FIREBASE_KEY = "https://contest-judging-sys.firebaseio.com";

    return {
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
            }, console.error);
        }
    };
})();