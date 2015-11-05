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
        onceAuthed: function(callback) {
            (new window.Firebase(FIREBASE_KEY)).onAuth(callback, this.reportError);
        },
        /**
         * authenticate(logout)
         * If logout is false (or undefined), we redirect to a google login page.
         * If logout is true, we invoke Firebase's unauth method (to log the user out), and reload the page.
         * @author Gigabyte Giant (2015)
         * @param {Boolean} logout*: Should we log the user out? (Defaults to false)
         */
        authenticate: function(logout = false) {
            let firebaseRef = (new window.Firebase(FIREBASE_KEY));

            if (!logout) {
                firebaseRef.authWithOAuthRedirect("google", this.reportError);
            } else {
                firebaseRef.unauth();

                window.location.reload();
            }
        },
        /**
         * getPermLevel()
         * Gets the perm level of the user that is currently logged in.
         * @author Gigabyte Giant (2015)
         * @param {Function} callback: The callback function to invoke once we've recieved the data.
         */
        getPermLevel: function(callback) {
            let authData = this.fetchFirebaseAuth();

            if (authData !== null) {
                let firebaseRef = (new window.Firebase(FIREBASE_KEY));
                let thisUserChild = firebaseRef.child("users").child(authData.uid);

                thisUserChild.once("value", function(snapshot) {
                    callback(snapshot.val().permLevel);
                });
            } else {
                callback(1);
            }
        },
        /**
         * fetchContestEntry(contestId, entryId, callback, properties)
         * @author Gigabyte Giant (2015)
         * @param {String} contestId: The ID of the contest that the entry we want to load data for resides under
         * @param {String} entryId: The ID of the contest entry that we want to load data for
         * @param {Function} callback: The callback function to invoke once we've loaded all of the required data
         * @param {Array} properties*: A list of all the properties that you want to load from this contest entry
         */
        fetchContestEntry: function(contestId, entryId, callback, properties) {
            if (!callback || (typeof callback !== "function")) {
                return;
            }

            // Used to reference Firebase
            let firebaseRef = (new window.Firebase(FIREBASE_KEY));

            // Firebase children
            let contestChild = firebaseRef.child("contests").child(contestId);
            let entryChild = contestChild.child("entries").child(entryId);

            let requiredProps = (properties === undefined ? ["id", "name", "thumb"] : properties);

            var callbackData = {};

            for (let propInd = 0; propInd < requiredProps.length; propInd++) {
                let currProp = requiredProps[propInd];

                entryChild.child(currProp).once("value", function(snapshot) {
                    callbackData[currProp] = snapshot.val();

                    if (Object.keys(callbackData).length === requiredProps.length) {
                        callback(callbackData);
                    }
                }, this.reportError);
            }
        },
        /**
         * fetchContest(contestId, callback, properties)
         * @author Gigabyte Giant (2015)
         * @param {String} contestId: The ID of the contest that you want to load data for
         * @param {Function} callback: The callback function to invoke once we've received the data.
         * @param {Array} properties*: A list of all the properties that you want to load from this contest.
         */
        fetchContest: function(contestId, callback, properties) {
            if (!callback || (typeof callback !== "function")) {
                return;
            }

            // Used to reference Firebase
            let firebaseRef = (new window.Firebase(FIREBASE_KEY));

            // Firebase children
            let contestChild = firebaseRef.child("contests").child(contestId);

            // Properties that we must have before can invoke our callback function
            let requiredProps = (properties === undefined ? ["id", "name", "desc", "img", "entryCount"] : properties);

            // The object that we pass into our callback function
            var callbackData = {};

            for (let propInd = 0; propInd < requiredProps.length; propInd++) {
                let currProp = requiredProps[propInd];

                contestChild.child(currProp).once("value", function(snapshot) {
                    callbackData[currProp] = snapshot.val();

                    if (Object.keys(callbackData).length === requiredProps.length) {
                        callback(callbackData);
                    }
                }, this.reportError);
            }
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

            let self = this;

            this.getPermLevel(function(permLevel) {
                // A variable containing a list of all the properties that we must load before we can invoke our callback function
                var requiredProps = ["id", "name", "thumb"];

                if (permLevel >= 5) {
                    requiredProps.push("scores");
                }

                // The JSON object that we'll pass into the callback function
                var callbackData = { };

                for (let i = 0; i < requiredProps.length; i++) {
                    let propRef = entriesRef.child(requiredProps[i]);

                    propRef.once("value", function(snapshot) {
                        callbackData[requiredProps[i]] = snapshot.val();

                        if (Object.keys(callbackData).length === requiredProps.length) {
                            callback(callbackData);
                        }
                    }, self.reportError);
                }
            });
        },
        /**
         * loadXContestEntries(contestId, callback, loadHowMany)
         * Loads "x" contest entries, and passes them into a callback function.
         * @author Gigabyte Giant (2015)
         * @param {String} contestId: The scratchpad ID of the contest that we want to load entries from.
         * @param {Function} callback: The callback function to invoke once we've loaded all the required data.
         * @param {Integer} loadHowMany: The number of entries that we'd like to load.
         */
        loadXContestEntries: function(contestId, callback, loadHowMany) {
            var callbackData = {};

            let self = this;

            this.fetchContestEntries(contestId, function(response) {
                for (let eInd = 0; eInd < response.length; eInd++) {
                    self.loadContestEntry(contestId, response[eInd], function(entryData) {
                        callbackData[response[eInd]] = entryData;

                        if (Object.keys(callbackData).length === response.length) {
                            callback(callbackData);
                        }
                    });
                }
            }, loadHowMany);

            // "this" will eventually go out of scope (later on in this function),
            //  that's why we have this variable.
            // let self = this;

            // this.fetchContestEntries(contestId, function(response) {
            //     var callbackData = { };

            //     for (let entryId = 0; entryId < response.length; entryId++) {
            //         let thisEntryId = response[entryId];

            //         self.loadContestEntry(contestId, thisEntryId, function(response) {
            //             callbackData[thisEntryId] = response;
            //         });
            //     }

            //     let callbackWait = setInterval(function() {
            //         if (Object.keys(callbackData).length === loadHowMany) {
            //             clearInterval(callbackWait);
            //             callback(callbackData);
            //         }
            //     }, 1000);
            // }, loadHowMany);
        },
        /**
         * getDefaultRubrics(callback)
         * @author Gigabyte Giant (2015)
         * @param {Function} callback: The callback function to invoke once we've loaded all the default rubrics
         */
        getDefaultRubrics: function(callback) {
            let firebaseRef = (new window.Firebase(FIREBASE_KEY));
            let rubricsChild = firebaseRef.child("rubrics");

            rubricsChild.once("value", function(snapshot) {
                callback(snapshot.val());
            });
        },
        /**
         * getContestRubrics(contestId, callback)
         * @author Gigabyte Giant (2015)
         * @param {String} contestId: The ID of the contest that we want to load the rubrics for
         * @param {Function} callback: The callback function to invoke once we've loaded all of the rubrics
         */
        getContestRubrics: function(contestId, callback) {
            var callbackData = {};

            let self = this;

            this.getDefaultRubrics(function(defaultRubrics) {
                callbackData = defaultRubrics;
                self.fetchContest(contestId, function(contestRubrics) {
                    let customRubrics = contestRubrics.rubrics;

                    if (customRubrics !== null) {
                        for (let customRubric in customRubrics) {
                            if (!callbackData.hasOwnProperty(customRubric)) {
                                callbackData[customRubric] = customRubrics[customRubric];
                            }
                        }

                        if (customRubrics.hasOwnProperty("Order")) {
                            for (let oInd = 0; oInd < customRubrics.Order.length; oInd++) {
                                // Make sure the current rubric item is actually a valid rubric item, and make sure it's not the "Order" item.
                                if (customRubrics.hasOwnProperty(customRubrics.Order[oInd]) && customRubrics.Order[oInd] !== "Order") {
                                    let thisRubric = customRubrics.Order[oInd];

                                    if (callbackData.Order.indexOf(thisRubric) === -1) {
                                        callbackData.Order.push(thisRubric);
                                    }
                                }
                            }
                        } else {
                            customRubrics.Order = [];
                        }
                    }

                    callback(callbackData);
                }, ["rubrics"]);
            });
        }
    };
})();
