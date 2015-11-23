module.exports = (function() {
    if (!window.jQuery || !window.Firebase) {
        return;
    }

    // The following variable is used to store our "Firebase Key"
    let FIREBASE_KEY = "https://contest-judging-sys.firebaseio.com";

    // The following variable is used to specify the default number of entries to fetch
    let DEF_NUM_ENTRIES_TO_LOAD = 10;

    // Error messages.
    let ERROR_MESSAGES = {
        ERR_NOT_JUDGE: "Error: You do not have permission to judge contest entries.",
        ERR_ALREADY_VOTED: "Error: You've already judged this entry."
    };

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
        fetchContestEntries: function(contestId, callback, loadHowMany = DEF_NUM_ENTRIES_TO_LOAD, includeJudged = true) {
            // If we don't have a valid callback function, exit the function.
            if (!callback || (typeof callback !== "function")) {
                return;
            }

            // Used to reference Firebase
            let firebaseRef = (new window.Firebase(FIREBASE_KEY));

            // References to Firebase children
            let thisContestRef = firebaseRef.child("contests").child(contestId);
            let contestEntriesRef = thisContestRef.child("entries");

            // Used to keep track of how many entries we've loaded
            var numLoaded = 0;

            // Used to store each of the entries that we've loaded
            var entryKeys = [ ];

            var alreadyChecked = [];

            let self = this;

            contestEntriesRef.once("value", function(fbSnapshot) {
                let tmpEntryKeys = Object.keys(fbSnapshot.val());

                if (tmpEntryKeys.length < loadHowMany) {
                    loadHowMany = tmpEntryKeys.length;
                }

                while (numLoaded < loadHowMany) {
                    let randomIndex = Math.floor(Math.random() * tmpEntryKeys.length);
                    let selectedKey = tmpEntryKeys[randomIndex];

                    if (entryKeys.indexOf(selectedKey) === -1 && (!fbSnapshot.val()[selectedKey].hasOwnProperty("archived") || fbSnapshot.val()[selectedKey].archived === false)) {
                        if (fbSnapshot.val()[selectedKey].hasOwnProperty("scores") && !includeJudged) {
                            if (!fbSnapshot.val()[selectedKey].scores.rubric.hasOwnProperty("judgesWhoVoted") || fbSnapshot.val()[selectedKey].scores.rubric.judgesWhoVoted.indexOf(self.fetchFirebaseAuth().uid) === -1) {
                                entryKeys.push(selectedKey);
                                numLoaded++;
                            } else {
                                if (alreadyChecked.indexOf(selectedKey) === -1) {
                                    console.log("Already judged " + selectedKey);
                                    alreadyChecked.push(selectedKey);
                                } else {
                                    loadHowMany--;
                                }
                            }
                        } else {
                            entryKeys.push(selectedKey);
                            numLoaded++;
                        }
                    }
                }
            });

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
        loadXContestEntries: function(contestId, callback, loadHowMany, includeJudged = true) {
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
            }, loadHowMany, includeJudged);
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
        },
        /**
         * judgeEntry(contestId, entryId, scoreData, callback)
         * @author Gigabyte Giant (2015)
         * @param {String} contestId: The ID of the contest that we're judging an entry for
         * @param {String} entryId: The ID of the entry that we're judging
         * @param {Object} scoreData: The scoring data
         * @param {Function} callback: The callback function to invoke after we've validated the scores, and submitted them.
         */
        judgeEntry: function(contestId, entryId, scoreData, callback) {
            // 0: Check the users perm level, if their permLevel isn't >= 4, exit.
            // 1: Fetch the rubrics for the current contest, to make sure we're not doing anything funky
            // 2: Validate the data that was submitted to the function
            // 3: Submit the data to Firebase

            let self = this;

            this.getPermLevel(function(permLevel) {
                if (permLevel >= 4) {
                    let thisJudge = self.fetchFirebaseAuth().uid;

                    self.getContestRubrics(contestId, function(contestRubrics) {
                        contestRubrics.judgesWhoVoted = (contestRubrics.judgesWhoVoted === undefined ? [] : contestRubrics.judgesWhoVoted);

                        if (contestRubrics.hasOwnProperty("judgesWhoVoted")) {
                            if (contestRubrics.judgesWhoVoted.indexOf(thisJudge) !== -1) {
                                callback(ERROR_MESSAGES.ERR_ALREADY_VOTED);
                            }
                        }

                        var thisJudgesVote = {};

                        for (let score in scoreData) {
                            if (contestRubrics.hasOwnProperty(score)) {
                                var scoreVal = -1;

                                if (scoreData[score] > contestRubrics[score].max) {
                                    scoreVal = contestRubrics[score].max;
                                } else if (scoreData[score] < contestRubrics[score].min) {
                                    scoreVal = contestRubrics[score].min;
                                } else {
                                    scoreVal = scoreData[score];
                                }

                                thisJudgesVote[score] = scoreVal;
                            }
                        }

                        console.log(thisJudgesVote);

                        self.fetchContestEntry(contestId, entryId, function(existingScoreData) {
                            existingScoreData = existingScoreData.scores;

                            contestRubrics.judgesWhoVoted.push(thisJudge);

                            var dataToWrite = {
                                judgesWhoVoted: contestRubrics.judgesWhoVoted
                            };

                            if (existingScoreData.hasOwnProperty("rubric")) {
                                let existingRubricItemScores = existingScoreData.rubric;
                                
                                let rubricItems = contestRubrics;

                                for (let rubricItem in rubricItems) {
                                    if (thisJudgesVote.hasOwnProperty(rubricItem)) {
                                        console.log("The item: " + rubricItem);

                                        var tmpScoreObj = {
                                            avg: (existingRubricItemScores[rubricItem] === undefined ? 1 : existingRubricItemScores[rubricItem].avg),
                                            rough: (existingRubricItemScores[rubricItem] === undefined ? 1 : existingRubricItemScores[rubricItem].rough)
                                        };

                                        if (dataToWrite.judgesWhoVoted.length - 1 === 0) {
                                            tmpScoreObj.rough = 1;
                                            tmpScoreObj.avg = 1;
                                        }

                                        tmpScoreObj.rough = tmpScoreObj.rough + thisJudgesVote[rubricItem];
                                        tmpScoreObj.avg = tmpScoreObj.rough / (contestRubrics.judgesWhoVoted.length);

                                        dataToWrite[rubricItem] = tmpScoreObj;
                                    }
                                }
                            }

                            console.log(dataToWrite);

                            let fbRef = (new window.Firebase(FIREBASE_KEY))
                                .child("contests").child(contestId)
                                .child("entries").child(entryId)
                                .child("scores").child("rubric");

                            fbRef.set(dataToWrite, function(error) {
                                if (error) {
                                    self.reportError(error);
                                    return;
                                }

                                callback();
                            });
                        }, ["scores"]);
                    });
                } else {
                    callback(ERROR_MESSAGES.ERR_NOT_JUDGE);
                }
            });
        }
    };
})();
