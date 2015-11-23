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

    // Error messages.
    var ERROR_MESSAGES = {
        ERR_NOT_JUDGE: "Error: You do not have permission to judge contest entries.",
        ERR_ALREADY_VOTED: "Error: You've already judged this entry."
    };

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
            var _this = this;

            var logout = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var firebaseRef = new window.Firebase(FIREBASE_KEY);

            if (!logout) {
                (function () {
                    var self = _this;

                    firebaseRef.authWithOAuthPopup("google", function (err, authData) {
                        if (err) {} else {
                            (function () {
                                var fbUsersRef = firebaseRef.child("users");

                                fbUsersRef.once("value", function (usersSnapshot) {
                                    if (!usersSnapshot.hasChild(authData.uid)) {
                                        fbUsersRef.child(authData.uid).set({
                                            name: authData.google.displayName,
                                            permLevel: 1
                                        }, self.reportError);

                                        console.log("Added new user to Firebase! Welcome to CJSKA \"" + authData.google.displayName + "\"!");
                                    }
                                });
                            })();
                        }
                    });
                })();
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
        getPermLevel: function getPermLevel(callback) {
            var authData = this.fetchFirebaseAuth();

            if (authData !== null) {
                var firebaseRef = new window.Firebase(FIREBASE_KEY);
                var thisUserChild = firebaseRef.child("users").child(authData.uid);

                thisUserChild.once("value", function (snapshot) {
                    if (snapshot.val() !== null) {
                        callback(snapshot.val().permLevel);
                    } else {
                        callback(1);
                    }
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
        fetchContestEntry: function fetchContestEntry(contestId, entryId, callback, properties) {
            var _this2 = this;

            if (!callback || typeof callback !== "function") {
                return;
            }

            // Used to reference Firebase
            var firebaseRef = new window.Firebase(FIREBASE_KEY);

            // Firebase children
            var contestChild = firebaseRef.child("contests").child(contestId);
            var entryChild = contestChild.child("entries").child(entryId);

            var requiredProps = properties === undefined ? ["id", "name", "thumb"] : properties;

            var callbackData = {};

            var _loop = function (propInd) {
                var currProp = requiredProps[propInd];

                entryChild.child(currProp).once("value", function (snapshot) {
                    callbackData[currProp] = snapshot.val();

                    if (Object.keys(callbackData).length === requiredProps.length) {
                        callback(callbackData);
                    }
                }, _this2.reportError);
            };

            for (var propInd = 0; propInd < requiredProps.length; propInd++) {
                _loop(propInd);
            }
        },
        /**
         * fetchContest(contestId, callback, properties)
         * @author Gigabyte Giant (2015)
         * @param {String} contestId: The ID of the contest that you want to load data for
         * @param {Function} callback: The callback function to invoke once we've received the data.
         * @param {Array} properties*: A list of all the properties that you want to load from this contest.
         */
        fetchContest: function fetchContest(contestId, callback, properties) {
            var _this3 = this;

            if (!callback || typeof callback !== "function") {
                return;
            }

            // Used to reference Firebase
            var firebaseRef = new window.Firebase(FIREBASE_KEY);

            // Firebase children
            var contestChild = firebaseRef.child("contests").child(contestId);

            // Properties that we must have before can invoke our callback function
            var requiredProps = properties === undefined ? ["id", "name", "desc", "img", "entryCount"] : properties;

            // The object that we pass into our callback function
            var callbackData = {};

            var _loop2 = function (propInd) {
                var currProp = requiredProps[propInd];

                contestChild.child(currProp).once("value", function (snapshot) {
                    callbackData[currProp] = snapshot.val();

                    if (Object.keys(callbackData).length === requiredProps.length) {
                        callback(callbackData);
                    }
                }, _this3.reportError);
            };

            for (var propInd = 0; propInd < requiredProps.length; propInd++) {
                _loop2(propInd);
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

                var _loop3 = function (propInd) {
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
                    _loop3(propInd);
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
            var includeJudged = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

            // If we don't have a valid callback function, exit the function.
            if (!callback || typeof callback !== "function") {
                return;
            }

            // Used to reference Firebase
            var firebaseRef = new window.Firebase(FIREBASE_KEY);

            // References to Firebase children
            var thisContestRef = firebaseRef.child("contests").child(contestId);
            var contestEntriesRef = thisContestRef.child("entries");

            // Used to keep track of how many entries we've loaded
            var numLoaded = 0;

            // Used to store each of the entries that we've loaded
            var entryKeys = [];

            var alreadyChecked = [];

            var self = this;

            contestEntriesRef.once("value", function (fbSnapshot) {
                var tmpEntryKeys = Object.keys(fbSnapshot.val());

                if (tmpEntryKeys.length < loadHowMany) {
                    loadHowMany = tmpEntryKeys.length;
                }

                while (numLoaded < loadHowMany) {
                    var randomIndex = Math.floor(Math.random() * tmpEntryKeys.length);
                    var selectedKey = tmpEntryKeys[randomIndex];

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

            var self = this;

            this.getPermLevel(function (permLevel) {
                // A variable containing a list of all the properties that we must load before we can invoke our callback function
                var requiredProps = ["id", "name", "thumb"];

                if (permLevel >= 5) {
                    requiredProps.push("scores");
                }

                // The JSON object that we'll pass into the callback function
                var callbackData = {};

                var _loop4 = function (i) {
                    var propRef = entriesRef.child(requiredProps[i]);

                    propRef.once("value", function (snapshot) {
                        callbackData[requiredProps[i]] = snapshot.val();

                        if (Object.keys(callbackData).length === requiredProps.length) {
                            callback(callbackData);
                        }
                    }, self.reportError);
                };

                for (var i = 0; i < requiredProps.length; i++) {
                    _loop4(i);
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
        loadXContestEntries: function loadXContestEntries(contestId, callback, loadHowMany) {
            var includeJudged = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

            var callbackData = {};

            var self = this;

            this.fetchContestEntries(contestId, function (response) {
                var _loop5 = function (eInd) {
                    self.loadContestEntry(contestId, response[eInd], function (entryData) {
                        callbackData[response[eInd]] = entryData;

                        if (Object.keys(callbackData).length === response.length) {
                            callback(callbackData);
                        }
                    });
                };

                for (var eInd = 0; eInd < response.length; eInd++) {
                    _loop5(eInd);
                }
            }, loadHowMany, includeJudged);
        },
        /**
         * getDefaultRubrics(callback)
         * @author Gigabyte Giant (2015)
         * @param {Function} callback: The callback function to invoke once we've loaded all the default rubrics
         */
        getDefaultRubrics: function getDefaultRubrics(callback) {
            var firebaseRef = new window.Firebase(FIREBASE_KEY);
            var rubricsChild = firebaseRef.child("rubrics");

            rubricsChild.once("value", function (snapshot) {
                callback(snapshot.val());
            });
        },
        /**
         * getContestRubrics(contestId, callback)
         * @author Gigabyte Giant (2015)
         * @param {String} contestId: The ID of the contest that we want to load the rubrics for
         * @param {Function} callback: The callback function to invoke once we've loaded all of the rubrics
         */
        getContestRubrics: function getContestRubrics(contestId, callback) {
            var callbackData = {};

            var self = this;

            this.getDefaultRubrics(function (defaultRubrics) {
                callbackData = defaultRubrics;
                self.fetchContest(contestId, function (contestRubrics) {
                    var customRubrics = contestRubrics.rubrics;

                    if (customRubrics !== null) {
                        for (var customRubric in customRubrics) {
                            if (!callbackData.hasOwnProperty(customRubric)) {
                                callbackData[customRubric] = customRubrics[customRubric];
                            }
                        }

                        if (customRubrics.hasOwnProperty("Order")) {
                            for (var oInd = 0; oInd < customRubrics.Order.length; oInd++) {
                                // Make sure the current rubric item is actually a valid rubric item, and make sure it's not the "Order" item.
                                if (customRubrics.hasOwnProperty(customRubrics.Order[oInd]) && customRubrics.Order[oInd] !== "Order") {
                                    var thisRubric = customRubrics.Order[oInd];

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
        judgeEntry: function judgeEntry(contestId, entryId, scoreData, callback) {
            // 0: Check the users perm level, if their permLevel isn't >= 4, exit.
            // 1: Fetch the rubrics for the current contest, to make sure we're not doing anything funky
            // 2: Validate the data that was submitted to the function
            // 3: Submit the data to Firebase

            var self = this;

            this.getPermLevel(function (permLevel) {
                if (permLevel >= 4) {
                    (function () {
                        var thisJudge = self.fetchFirebaseAuth().uid;

                        self.getContestRubrics(contestId, function (contestRubrics) {
                            contestRubrics.judgesWhoVoted = contestRubrics.judgesWhoVoted === undefined ? [] : contestRubrics.judgesWhoVoted;

                            if (contestRubrics.hasOwnProperty("judgesWhoVoted")) {
                                if (contestRubrics.judgesWhoVoted.indexOf(thisJudge) !== -1) {
                                    callback(ERROR_MESSAGES.ERR_ALREADY_VOTED);
                                }
                            }

                            var thisJudgesVote = {};

                            for (var score in scoreData) {
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

                            self.fetchContestEntry(contestId, entryId, function (existingScoreData) {
                                existingScoreData = existingScoreData.scores;

                                contestRubrics.judgesWhoVoted.push(thisJudge);

                                var dataToWrite = {
                                    judgesWhoVoted: contestRubrics.judgesWhoVoted
                                };

                                if (existingScoreData.hasOwnProperty("rubric")) {
                                    var existingRubricItemScores = existingScoreData.rubric;

                                    var rubricItems = contestRubrics;

                                    for (var rubricItem in rubricItems) {
                                        if (thisJudgesVote.hasOwnProperty(rubricItem)) {
                                            console.log("The item: " + rubricItem);

                                            var tmpScoreObj = {
                                                avg: existingRubricItemScores[rubricItem] === undefined ? 1 : existingRubricItemScores[rubricItem].avg,
                                                rough: existingRubricItemScores[rubricItem] === undefined ? 1 : existingRubricItemScores[rubricItem].rough
                                            };

                                            if (dataToWrite.judgesWhoVoted.length - 1 === 0) {
                                                tmpScoreObj.rough = 1;
                                                tmpScoreObj.avg = 1;
                                            }

                                            tmpScoreObj.rough = tmpScoreObj.rough + thisJudgesVote[rubricItem];
                                            tmpScoreObj.avg = tmpScoreObj.rough / contestRubrics.judgesWhoVoted.length;

                                            dataToWrite[rubricItem] = tmpScoreObj;
                                        }
                                    }
                                }

                                console.log(dataToWrite);

                                var fbRef = new window.Firebase(FIREBASE_KEY).child("contests").child(contestId).child("entries").child(entryId).child("scores").child("rubric");

                                fbRef.set(dataToWrite, function (error) {
                                    if (error) {
                                        self.reportError(error);
                                        return;
                                    }

                                    callback();
                                });
                            }, ["scores"]);
                        });
                    })();
                } else {
                    callback(ERROR_MESSAGES.ERR_NOT_JUDGE);
                }
            });
        }
    };
})();

},{}],2:[function(require,module,exports){
"use strict";

var CJS = require("../backend/contest_judging_sys.js");
var helpers = require("../helpers/helpers.js");

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
    return $("<div>").addClass("col s12 m9").append($("<h5>").addClass("title").text(contestData.title)).append($("<div>").addClass("description").html(contestData.description));
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
    var contestHolder = $("<div>").addClass("contest section").attr("id", contestData.id).append(createContestDetails(contestData)).append($("<div>").addClass("col s12 m3").append($("<div>").addClass("center").append($("<img>").attr("src", contestData.thumbnail).addClass("img-responsive contest-thumbnail")).append(createContestControl({
        text: "View Entries",
        link: "contest.html?contest=" + contestData.id + "&count=32"
    }))));

    CJS.getPermLevel(function (permLevel) {
        if (permLevel >= 5) {
            $("#" + contestData.id + " .center").append(createContestControl({
                text: "View Leaderboard",
                link: "leaderboard.html?contest=" + contestData.id
            }));
        }
    });

    return contestHolder;
};

var setupPage = function setupPage(contestData) {
    for (var cid in contestData) {
        var contest = contestData[cid];

        $("#contests").append($("<div>").addClass("row").append(createContestHolder({
            id: contest.id,
            title: contest.name,
            description: contest.desc === "" ? "No description provided." : contest.desc,
            thumbnail: "https://www.khanacademy.org/" + contest.img
        }))).append($("<div>").addClass("divider"));
    }
};

helpers.authentication.setupPageAuth("#authBtn", CJS);
CJS.fetchContests(setupPage);

// $("#authBtn").on("click", function(evt) {
//     evt.preventDefault();

//     if (fbAuth === null) {
//         CJS.authenticate();
//     } else {
//         CJS.authenticate(true);
//     }
// });

},{"../backend/contest_judging_sys.js":1,"../helpers/helpers.js":5}],3:[function(require,module,exports){
"use strict";

module.exports = {
    addAdminLink: function addAdminLink(selector, cjsWrapper) {
        cjsWrapper.getPermLevel(function (permLevel) {
            if (permLevel >= 5) {
                $("<li>").addClass("active").append($("<a>").attr("href", "./admin/").text("Admin dashboard")).insertBefore($(selector).parent());
            }
        });
    },
    setupOnClick: function setupOnClick(selector, cjsWrapper) {
        $(selector).on("click", function (evt) {
            evt.preventDefault();

            if (cjsWrapper.fetchFirebaseAuth() === null) {
                cjsWrapper.authenticate();
            } else {
                cjsWrapper.authenticate(true);
            }
        });
    },
    showWelcome: function showWelcome(selector, cjsWrapper) {
        if (cjsWrapper.fetchFirebaseAuth() === null) {
            $(selector).text("Hello guest! Click me to log in.");
        } else {
            $(selector).text("Hello " + cjsWrapper.fetchFirebaseAuth().google.displayName + "! (Not you? Click here!)");
        }
    },
    setupPageAuth: function setupPageAuth(authBtnSelector, cjsWrapper) {
        this.setupOnClick(authBtnSelector, cjsWrapper);
        this.showWelcome(authBtnSelector, cjsWrapper);
        // this.addAdminLink(authBtnSelector, cjsWrapper);
    }
};

},{}],4:[function(require,module,exports){
"use strict";

module.exports = {
    /**
     * getCookie(cookieName)
     * Fetches the specified cookie from the browser, and returns it's value.
     * @author w3schools
     * @param {String} cookieName: The name of the cookie that we want to fetch.
     * @returns {String} cookieValue: The value of the specified cookie, or an empty string, if there is no "non-falsy" value.
     */
    getCookie: function getCookie(cookieName) {
        // Get the cookie with name cookie (return "" if non-existent)
        cookieName = cookieName + "=";
        // Check all of the cookies and try to find the one containing name.
        var cookieList = document.cookie.split(";");
        for (var cInd = 0; cInd < cookieList.length; cInd++) {
            var curCookie = cookieList[cInd];
            while (curCookie[0] === " ") {
                curCookie = curCookie.substring(1);
            }
            // If we've found the right cookie, return its value.
            if (curCookie.indexOf(cookieName) === 0) {
                return curCookie.substring(cookieName.length, curCookie.length);
            }
        }
        // Otherwise, if the cookie doesn't exist, return ""
        return "";
    },
    /**
     * setCookie(cookieName, value)
     * Creates/updates a cookie with the desired name, setting it's value to "value".
     * @author w3schools
     * @param {String} cookieName: The name of the cookie that we want to create/update.
     * @param {String} value: The value to assign to the cookie.
     */
    setCookie: function setCookie(cookieName, value) {
        // Set a cookie with name cookie and value cookie that will expire 30 days from now.
        var d = new Date();
        d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000);
        var expires = "expires=" + d.toUTCString();
        document.cookie = cookieName + "=" + value + "; " + expires;
    },
    /**
     * getUrlParams()
     * @author Gigabyte Giant (2015)
     * @param {String} url: The URL to fetch URL parameters from
     */
    getUrlParams: function getUrlParams(url) {
        var urlParams = {};

        var splitUrl = url.split("?")[1];

        if (splitUrl !== undefined) {
            var tmpUrlParams = splitUrl.split("&");

            for (var upInd = 0; upInd < tmpUrlParams.length; upInd++) {
                var currParamStr = tmpUrlParams[upInd];

                urlParams[currParamStr.split("=")[0]] = currParamStr.split("=")[1].replace(/\#\!/g, "");
            }
        }

        return urlParams;
    }
};

},{}],5:[function(require,module,exports){
"use strict";

module.exports = {
    authentication: require("./authentication.js"),
    general: require("./general.js")
};

},{"./authentication.js":3,"./general.js":4}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2NsaWVudC9pbmRleC5qcyIsIi9Vc2Vycy9CcnluZGVuL3NwYXJrL0NvbnRlc3QtSnVkZ2luZy1TeXN0ZW0tZm9yLUtBL3NyYy9oZWxwZXJzL2F1dGhlbnRpY2F0aW9uLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2hlbHBlcnMvZ2VuZXJhbC5qcyIsIi9Vc2Vycy9CcnluZGVuL3NwYXJrL0NvbnRlc3QtSnVkZ2luZy1TeXN0ZW0tZm9yLUtBL3NyYy9oZWxwZXJzL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxZQUFXO0FBQ3pCLFFBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtBQUNwQyxlQUFPO0tBQ1Y7OztBQUdELFFBQUksWUFBWSxHQUFHLDRDQUE0QyxDQUFDOzs7QUFHaEUsUUFBSSx1QkFBdUIsR0FBRyxFQUFFLENBQUM7OztBQUdqQyxRQUFJLGNBQWMsR0FBRztBQUNqQixxQkFBYSxFQUFFLDZEQUE2RDtBQUM1RSx5QkFBaUIsRUFBRSwwQ0FBMEM7S0FDaEUsQ0FBQzs7QUFFRixXQUFPO0FBQ0gsbUJBQVcsRUFBRSxxQkFBUyxLQUFLLEVBQUU7QUFDekIsbUJBQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEI7QUFDRCx5QkFBaUIsRUFBRSw2QkFBVztBQUMxQixt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S0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUV2QyxpQkFBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDdEQsb0JBQUksWUFBWSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFdkMseUJBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDN0QsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQzthQUM3QjtTQUNKOztBQUVELGVBQU8sU0FBUyxDQUFDO0tBQ3BCO0NBQ0osQ0FBQzs7Ozs7QUMvREYsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNiLGtCQUFjLEVBQUUsT0FBTyxDQUFDLHFCQUFxQixDQUFDO0FBQzlDLFdBQU8sRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDO0NBQ25DLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF3aW5kb3cualF1ZXJ5IHx8ICF3aW5kb3cuRmlyZWJhc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgdmFyaWFibGUgaXMgdXNlZCB0byBzdG9yZSBvdXIgXCJGaXJlYmFzZSBLZXlcIlxuICAgIGxldCBGSVJFQkFTRV9LRVkgPSBcImh0dHBzOi8vY29udGVzdC1qdWRnaW5nLXN5cy5maXJlYmFzZWlvLmNvbVwiO1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyB2YXJpYWJsZSBpcyB1c2VkIHRvIHNwZWNpZnkgdGhlIGRlZmF1bHQgbnVtYmVyIG9mIGVudHJpZXMgdG8gZmV0Y2hcbiAgICBsZXQgREVGX05VTV9FTlRSSUVTX1RPX0xPQUQgPSAxMDtcblxuICAgIC8vIEVycm9yIG1lc3NhZ2VzLlxuICAgIGxldCBFUlJPUl9NRVNTQUdFUyA9IHtcbiAgICAgICAgRVJSX05PVF9KVURHRTogXCJFcnJvcjogWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8ganVkZ2UgY29udGVzdCBlbnRyaWVzLlwiLFxuICAgICAgICBFUlJfQUxSRUFEWV9WT1RFRDogXCJFcnJvcjogWW91J3ZlIGFscmVhZHkganVkZ2VkIHRoaXMgZW50cnkuXCJcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVwb3J0RXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgZmV0Y2hGaXJlYmFzZUF1dGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpLmdldEF1dGgoKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25jZUF1dGhlZDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpLm9uQXV0aChjYWxsYmFjaywgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhdXRoZW50aWNhdGUobG9nb3V0KVxuICAgICAgICAgKiBJZiBsb2dvdXQgaXMgZmFsc2UgKG9yIHVuZGVmaW5lZCksIHdlIHJlZGlyZWN0IHRvIGEgZ29vZ2xlIGxvZ2luIHBhZ2UuXG4gICAgICAgICAqIElmIGxvZ291dCBpcyB0cnVlLCB3ZSBpbnZva2UgRmlyZWJhc2UncyB1bmF1dGggbWV0aG9kICh0byBsb2cgdGhlIHVzZXIgb3V0KSwgYW5kIHJlbG9hZCB0aGUgcGFnZS5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtCb29sZWFufSBsb2dvdXQqOiBTaG91bGQgd2UgbG9nIHRoZSB1c2VyIG91dD8gKERlZmF1bHRzIHRvIGZhbHNlKVxuICAgICAgICAgKi9cbiAgICAgICAgYXV0aGVudGljYXRlOiBmdW5jdGlvbihsb2dvdXQgPSBmYWxzZSkge1xuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIGlmICghbG9nb3V0KSB7XG4gICAgICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgZmlyZWJhc2VSZWYuYXV0aFdpdGhPQXV0aFBvcHVwKFwiZ29vZ2xlXCIsIGZ1bmN0aW9uKGVyciwgYXV0aERhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmJVc2Vyc1JlZiA9IGZpcmViYXNlUmVmLmNoaWxkKFwidXNlcnNcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZiVXNlcnNSZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHVzZXJzU25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXVzZXJzU25hcHNob3QuaGFzQ2hpbGQoYXV0aERhdGEudWlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYlVzZXJzUmVmLmNoaWxkKGF1dGhEYXRhLnVpZCkuc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGF1dGhEYXRhLmdvb2dsZS5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1MZXZlbDogMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBzZWxmLnJlcG9ydEVycm9yKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFkZGVkIG5ldyB1c2VyIHRvIEZpcmViYXNlISBXZWxjb21lIHRvIENKU0tBIFxcXCJcIiArIGF1dGhEYXRhLmdvb2dsZS5kaXNwbGF5TmFtZSArIFwiXFxcIiFcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlyZWJhc2VSZWYudW5hdXRoKCk7XG5cbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXRQZXJtTGV2ZWwoKVxuICAgICAgICAgKiBHZXRzIHRoZSBwZXJtIGxldmVsIG9mIHRoZSB1c2VyIHRoYXQgaXMgY3VycmVudGx5IGxvZ2dlZCBpbi5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSByZWNpZXZlZCB0aGUgZGF0YS5cbiAgICAgICAgICovXG4gICAgICAgIGdldFBlcm1MZXZlbDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGxldCBhdXRoRGF0YSA9IHRoaXMuZmV0Y2hGaXJlYmFzZUF1dGgoKTtcblxuICAgICAgICAgICAgaWYgKGF1dGhEYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG4gICAgICAgICAgICAgICAgbGV0IHRoaXNVc2VyQ2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcInVzZXJzXCIpLmNoaWxkKGF1dGhEYXRhLnVpZCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzVXNlckNoaWxkLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc25hcHNob3QudmFsKCkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNuYXBzaG90LnZhbCgpLnBlcm1MZXZlbCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZldGNoQ29udGVzdEVudHJ5KGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2ssIHByb3BlcnRpZXMpXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHRoZSBlbnRyeSB3ZSB3YW50IHRvIGxvYWQgZGF0YSBmb3IgcmVzaWRlcyB1bmRlclxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZW50cnlJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IGVudHJ5IHRoYXQgd2Ugd2FudCB0byBsb2FkIGRhdGEgZm9yXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgbG9hZGVkIGFsbCBvZiB0aGUgcmVxdWlyZWQgZGF0YVxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBwcm9wZXJ0aWVzKjogQSBsaXN0IG9mIGFsbCB0aGUgcHJvcGVydGllcyB0aGF0IHlvdSB3YW50IHRvIGxvYWQgZnJvbSB0aGlzIGNvbnRlc3QgZW50cnlcbiAgICAgICAgICovXG4gICAgICAgIGZldGNoQ29udGVzdEVudHJ5OiBmdW5jdGlvbihjb250ZXN0SWQsIGVudHJ5SWQsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0Q2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZCk7XG4gICAgICAgICAgICBsZXQgZW50cnlDaGlsZCA9IGNvbnRlc3RDaGlsZC5jaGlsZChcImVudHJpZXNcIikuY2hpbGQoZW50cnlJZCk7XG5cbiAgICAgICAgICAgIGxldCByZXF1aXJlZFByb3BzID0gKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IFtcImlkXCIsIFwibmFtZVwiLCBcInRodW1iXCJdIDogcHJvcGVydGllcyk7XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7fTtcblxuICAgICAgICAgICAgZm9yIChsZXQgcHJvcEluZCA9IDA7IHByb3BJbmQgPCByZXF1aXJlZFByb3BzLmxlbmd0aDsgcHJvcEluZCsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJQcm9wID0gcmVxdWlyZWRQcm9wc1twcm9wSW5kXTtcblxuICAgICAgICAgICAgICAgIGVudHJ5Q2hpbGQuY2hpbGQoY3VyclByb3ApLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbY3VyclByb3BdID0gc25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0KGNvbnRlc3RJZCwgY2FsbGJhY2ssIHByb3BlcnRpZXMpXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHlvdSB3YW50IHRvIGxvYWQgZGF0YSBmb3JcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSByZWNlaXZlZCB0aGUgZGF0YS5cbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gcHJvcGVydGllcyo6IEEgbGlzdCBvZiBhbGwgdGhlIHByb3BlcnRpZXMgdGhhdCB5b3Ugd2FudCB0byBsb2FkIGZyb20gdGhpcyBjb250ZXN0LlxuICAgICAgICAgKi9cbiAgICAgICAgZmV0Y2hDb250ZXN0OiBmdW5jdGlvbihjb250ZXN0SWQsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0Q2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZCk7XG5cbiAgICAgICAgICAgIC8vIFByb3BlcnRpZXMgdGhhdCB3ZSBtdXN0IGhhdmUgYmVmb3JlIGNhbiBpbnZva2Ugb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICBsZXQgcmVxdWlyZWRQcm9wcyA9IChwcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyBbXCJpZFwiLCBcIm5hbWVcIiwgXCJkZXNjXCIsIFwiaW1nXCIsIFwiZW50cnlDb3VudFwiXSA6IHByb3BlcnRpZXMpO1xuXG4gICAgICAgICAgICAvLyBUaGUgb2JqZWN0IHRoYXQgd2UgcGFzcyBpbnRvIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHt9O1xuXG4gICAgICAgICAgICBmb3IgKGxldCBwcm9wSW5kID0gMDsgcHJvcEluZCA8IHJlcXVpcmVkUHJvcHMubGVuZ3RoOyBwcm9wSW5kKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgY3VyclByb3AgPSByZXF1aXJlZFByb3BzW3Byb3BJbmRdO1xuXG4gICAgICAgICAgICAgICAgY29udGVzdENoaWxkLmNoaWxkKGN1cnJQcm9wKS5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhW2N1cnJQcm9wXSA9IHNuYXBzaG90LnZhbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0gcmVxdWlyZWRQcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzLnJlcG9ydEVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZldGNoQ29udGVzdHMoY2FsbGJhY2spXG4gICAgICAgICAqIEZldGNoZXMgYWxsIGNvbnRlc3RzIHRoYXQncmUgYmVpbmcgc3RvcmVkIGluIEZpcmViYXNlLCBhbmQgcGFzc2VzIHRoZW0gaW50byBhIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGNhcHR1cmVkIGFsbCB0aGUgZGF0YSB0aGF0IHdlIG5lZWQuXG4gICAgICAgICAqIEB0b2RvIChHaWdhYnl0ZSBHaWFudCk6IEFkZCBiZXR0ZXIgY29tbWVudHMhXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3RzOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIEZpcmViYXNlIGNoaWxkcmVuXG4gICAgICAgICAgICBsZXQgY29udGVzdEtleXNDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdEtleXNcIik7XG4gICAgICAgICAgICBsZXQgY29udGVzdHNDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIik7XG5cbiAgICAgICAgICAgIC8vIFByb3BlcnRpZXMgdGhhdCB3ZSBtdXN0IGhhdmUgYmVmb3JlIHdlIGNhbiBpbnZva2Ugb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICBsZXQgcmVxdWlyZWRQcm9wcyA9IFtcbiAgICAgICAgICAgICAgICBcImlkXCIsXG4gICAgICAgICAgICAgICAgXCJuYW1lXCIsXG4gICAgICAgICAgICAgICAgXCJkZXNjXCIsXG4gICAgICAgICAgICAgICAgXCJpbWdcIixcbiAgICAgICAgICAgICAgICBcImVudHJ5Q291bnRcIlxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgLy8ga2V5c1dlRm91bmQgaG9sZHMgYSBsaXN0IG9mIGFsbCBvZiB0aGUgY29udGVzdCBrZXlzIHRoYXQgd2UndmUgZm91bmQgc28gZmFyXG4gICAgICAgICAgICB2YXIga2V5c1dlRm91bmQgPSBbIF07XG5cbiAgICAgICAgICAgIC8vIGNhbGxiYWNrRGF0YSBpcyB0aGUgb2JqZWN0IHRoYXQgZ2V0cyBwYXNzZWQgaW50byBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7IH07XG5cbiAgICAgICAgICAgIC8vIFwiUXVlcnlcIiBvdXIgY29udGVzdEtleXNDaGlsZFxuICAgICAgICAgICAgY29udGVzdEtleXNDaGlsZC5vcmRlckJ5S2V5KCkub24oXCJjaGlsZF9hZGRlZFwiLCBmdW5jdGlvbihmYkl0ZW0pIHtcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGN1cnJlbnQga2V5IHRvIG91ciBcImtleXNXZUZvdW5kXCIgYXJyYXlcbiAgICAgICAgICAgICAgICBrZXlzV2VGb3VuZC5wdXNoKGZiSXRlbS5rZXkoKSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdGhpc0NvbnRlc3QgPSBjb250ZXN0c0NoaWxkLmNoaWxkKGZiSXRlbS5rZXkoKSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGhpc0NvbnRlc3REYXRhID0geyB9O1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcHJvcEluZCA9IDA7IHByb3BJbmQgPCByZXF1aXJlZFByb3BzLmxlbmd0aDsgcHJvcEluZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyUHJvcGVydHkgPSByZXF1aXJlZFByb3BzW3Byb3BJbmRdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzQ29udGVzdC5jaGlsZChjdXJyUHJvcGVydHkpLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihmYlNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzQ29udGVzdERhdGFbY3VyclByb3BlcnR5XSA9IGZiU25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gKEdpZ2FieXRlIEdpYW50KTogR2V0IHJpZCBvZiBhbGwgdGhpcyBuZXN0ZWQgXCJjcmFwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzQ29udGVzdERhdGEpLmxlbmd0aCA9PT0gcmVxdWlyZWRQcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbZmJJdGVtLmtleSgpXSA9IHRoaXNDb250ZXN0RGF0YTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0ga2V5c1dlRm91bmQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzLnJlcG9ydEVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZldGNoQ29udGVzdEVudHJpZXMoY29udGVzdElkLCBjYWxsYmFjaylcbiAgICAgICAgICpcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIEtoYW4gQWNhZGVteSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgd2Ugd2FudCB0byBmZXRjaCBlbnRyaWVzIGZvci5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2UgYWZ0ZXIgd2UndmUgZmV0Y2hlZCBhbGwgdGhlIGRhdGEgdGhhdCB3ZSBuZWVkLlxuICAgICAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IGxvYWRIb3dNYW55KjogVGhlIG51bWJlciBvZiBlbnRyaWVzIHRvIGxvYWQuIElmIG5vIHZhbHVlIGlzIHBhc3NlZCB0byB0aGlzIHBhcmFtZXRlcixcbiAgICAgICAgICogIGZhbGxiYWNrIG9udG8gYSBkZWZhdWx0IHZhbHVlLlxuICAgICAgICAgKi9cbiAgICAgICAgZmV0Y2hDb250ZXN0RW50cmllczogZnVuY3Rpb24oY29udGVzdElkLCBjYWxsYmFjaywgbG9hZEhvd01hbnkgPSBERUZfTlVNX0VOVFJJRVNfVE9fTE9BRCwgaW5jbHVkZUp1ZGdlZCA9IHRydWUpIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSB2YWxpZCBjYWxsYmFjayBmdW5jdGlvbiwgZXhpdCB0aGUgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gUmVmZXJlbmNlcyB0byBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IHRoaXNDb250ZXN0UmVmID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKS5jaGlsZChjb250ZXN0SWQpO1xuICAgICAgICAgICAgbGV0IGNvbnRlc3RFbnRyaWVzUmVmID0gdGhpc0NvbnRlc3RSZWYuY2hpbGQoXCJlbnRyaWVzXCIpO1xuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgZW50cmllcyB3ZSd2ZSBsb2FkZWRcbiAgICAgICAgICAgIHZhciBudW1Mb2FkZWQgPSAwO1xuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHN0b3JlIGVhY2ggb2YgdGhlIGVudHJpZXMgdGhhdCB3ZSd2ZSBsb2FkZWRcbiAgICAgICAgICAgIHZhciBlbnRyeUtleXMgPSBbIF07XG5cbiAgICAgICAgICAgIHZhciBhbHJlYWR5Q2hlY2tlZCA9IFtdO1xuXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGNvbnRlc3RFbnRyaWVzUmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihmYlNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgbGV0IHRtcEVudHJ5S2V5cyA9IE9iamVjdC5rZXlzKGZiU25hcHNob3QudmFsKCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRtcEVudHJ5S2V5cy5sZW5ndGggPCBsb2FkSG93TWFueSkge1xuICAgICAgICAgICAgICAgICAgICBsb2FkSG93TWFueSA9IHRtcEVudHJ5S2V5cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKG51bUxvYWRlZCA8IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRtcEVudHJ5S2V5cy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRLZXkgPSB0bXBFbnRyeUtleXNbcmFuZG9tSW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeUtleXMuaW5kZXhPZihzZWxlY3RlZEtleSkgPT09IC0xICYmICghZmJTbmFwc2hvdC52YWwoKVtzZWxlY3RlZEtleV0uaGFzT3duUHJvcGVydHkoXCJhcmNoaXZlZFwiKSB8fCBmYlNuYXBzaG90LnZhbCgpW3NlbGVjdGVkS2V5XS5hcmNoaXZlZCA9PT0gZmFsc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmJTbmFwc2hvdC52YWwoKVtzZWxlY3RlZEtleV0uaGFzT3duUHJvcGVydHkoXCJzY29yZXNcIikgJiYgIWluY2x1ZGVKdWRnZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWZiU25hcHNob3QudmFsKClbc2VsZWN0ZWRLZXldLnNjb3Jlcy5ydWJyaWMuaGFzT3duUHJvcGVydHkoXCJqdWRnZXNXaG9Wb3RlZFwiKSB8fCBmYlNuYXBzaG90LnZhbCgpW3NlbGVjdGVkS2V5XS5zY29yZXMucnVicmljLmp1ZGdlc1dob1ZvdGVkLmluZGV4T2Yoc2VsZi5mZXRjaEZpcmViYXNlQXV0aCgpLnVpZCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5S2V5cy5wdXNoKHNlbGVjdGVkS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtTG9hZGVkKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFscmVhZHlDaGVja2VkLmluZGV4T2Yoc2VsZWN0ZWRLZXkpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJBbHJlYWR5IGp1ZGdlZCBcIiArIHNlbGVjdGVkS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFscmVhZHlDaGVja2VkLnB1c2goc2VsZWN0ZWRLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEhvd01hbnktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlLZXlzLnB1c2goc2VsZWN0ZWRLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bUxvYWRlZCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBjYWxsYmFja1dhaXQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVtTG9hZGVkID09PSBsb2FkSG93TWFueSkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhbGxiYWNrV2FpdCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVudHJ5S2V5cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsb2FkQ29udGVzdEVudHJ5KGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2spXG4gICAgICAgICAqIExvYWRzIGEgY29udGVzdCBlbnRyeSAod2hpY2ggaXMgc3BlY2lmaWVkIHZpYSBwcm92aWRpbmcgYSBjb250ZXN0IGlkIGFuZCBhbiBlbnRyeSBpZCkuXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgdGhpcyBlbnRyeSByZXNpZGVzIHVuZGVyLlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZW50cnlJZDogVGhlIHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGVudHJ5LlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgdGhlIHJlcXVpcmVkIGRhdGEuXG4gICAgICAgICAqIEB0b2RvIChHaWdhYnl0ZSBHaWFudCk6IEFkZCBhdXRoZW50aWNhdGlvbiB0byB0aGlzIGZ1bmN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBsb2FkQ29udGVzdEVudHJ5OiBmdW5jdGlvbihjb250ZXN0SWQsIGVudHJ5SWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdmFsaWQgY2FsbGJhY2sgZnVuY3Rpb24sIGV4aXQgdGhlIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZXMgdG8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0UmVmID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKS5jaGlsZChjb250ZXN0SWQpO1xuICAgICAgICAgICAgbGV0IGVudHJpZXNSZWYgPSBjb250ZXN0UmVmLmNoaWxkKFwiZW50cmllc1wiKS5jaGlsZChlbnRyeUlkKTtcblxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldFBlcm1MZXZlbChmdW5jdGlvbihwZXJtTGV2ZWwpIHtcbiAgICAgICAgICAgICAgICAvLyBBIHZhcmlhYmxlIGNvbnRhaW5pbmcgYSBsaXN0IG9mIGFsbCB0aGUgcHJvcGVydGllcyB0aGF0IHdlIG11c3QgbG9hZCBiZWZvcmUgd2UgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICB2YXIgcmVxdWlyZWRQcm9wcyA9IFtcImlkXCIsIFwibmFtZVwiLCBcInRodW1iXCJdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBlcm1MZXZlbCA+PSA1KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkUHJvcHMucHVzaChcInNjb3Jlc1wiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUaGUgSlNPTiBvYmplY3QgdGhhdCB3ZSdsbCBwYXNzIGludG8gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHsgfTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVxdWlyZWRQcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcFJlZiA9IGVudHJpZXNSZWYuY2hpbGQocmVxdWlyZWRQcm9wc1tpXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcHJvcFJlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtyZXF1aXJlZFByb3BzW2ldXSA9IHNuYXBzaG90LnZhbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IHJlcXVpcmVkUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgc2VsZi5yZXBvcnRFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsb2FkWENvbnRlc3RFbnRyaWVzKGNvbnRlc3RJZCwgY2FsbGJhY2ssIGxvYWRIb3dNYW55KVxuICAgICAgICAgKiBMb2FkcyBcInhcIiBjb250ZXN0IGVudHJpZXMsIGFuZCBwYXNzZXMgdGhlbSBpbnRvIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgd2Ugd2FudCB0byBsb2FkIGVudHJpZXMgZnJvbS5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIHRoZSByZXF1aXJlZCBkYXRhLlxuICAgICAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IGxvYWRIb3dNYW55OiBUaGUgbnVtYmVyIG9mIGVudHJpZXMgdGhhdCB3ZSdkIGxpa2UgdG8gbG9hZC5cbiAgICAgICAgICovXG4gICAgICAgIGxvYWRYQ29udGVzdEVudHJpZXM6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2ssIGxvYWRIb3dNYW55LCBpbmNsdWRlSnVkZ2VkID0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHt9O1xuXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZmV0Y2hDb250ZXN0RW50cmllcyhjb250ZXN0SWQsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZUluZCA9IDA7IGVJbmQgPCByZXNwb25zZS5sZW5ndGg7IGVJbmQrKykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmxvYWRDb250ZXN0RW50cnkoY29udGVzdElkLCByZXNwb25zZVtlSW5kXSwgZnVuY3Rpb24oZW50cnlEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbcmVzcG9uc2VbZUluZF1dID0gZW50cnlEYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IHJlc3BvbnNlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGxvYWRIb3dNYW55LCBpbmNsdWRlSnVkZ2VkKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldERlZmF1bHRSdWJyaWNzKGNhbGxiYWNrKVxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgdGhlIGRlZmF1bHQgcnVicmljc1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0RGVmYXVsdFJ1YnJpY3M6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcbiAgICAgICAgICAgIGxldCBydWJyaWNzQ2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcInJ1YnJpY3NcIik7XG5cbiAgICAgICAgICAgIHJ1YnJpY3NDaGlsZC5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhzbmFwc2hvdC52YWwoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldENvbnRlc3RSdWJyaWNzKGNvbnRlc3RJZCwgY2FsbGJhY2spXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHdlIHdhbnQgdG8gbG9hZCB0aGUgcnVicmljcyBmb3JcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIG9mIHRoZSBydWJyaWNzXG4gICAgICAgICAqL1xuICAgICAgICBnZXRDb250ZXN0UnVicmljczogZnVuY3Rpb24oY29udGVzdElkLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHt9O1xuXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0RGVmYXVsdFJ1YnJpY3MoZnVuY3Rpb24oZGVmYXVsdFJ1YnJpY3MpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGEgPSBkZWZhdWx0UnVicmljcztcbiAgICAgICAgICAgICAgICBzZWxmLmZldGNoQ29udGVzdChjb250ZXN0SWQsIGZ1bmN0aW9uKGNvbnRlc3RSdWJyaWNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXN0b21SdWJyaWNzID0gY29udGVzdFJ1YnJpY3MucnVicmljcztcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VzdG9tUnVicmljcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY3VzdG9tUnVicmljIGluIGN1c3RvbVJ1YnJpY3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNhbGxiYWNrRGF0YS5oYXNPd25Qcm9wZXJ0eShjdXN0b21SdWJyaWMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtjdXN0b21SdWJyaWNdID0gY3VzdG9tUnVicmljc1tjdXN0b21SdWJyaWNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1c3RvbVJ1YnJpY3MuaGFzT3duUHJvcGVydHkoXCJPcmRlclwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG9JbmQgPSAwOyBvSW5kIDwgY3VzdG9tUnVicmljcy5PcmRlci5sZW5ndGg7IG9JbmQrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGN1cnJlbnQgcnVicmljIGl0ZW0gaXMgYWN0dWFsbHkgYSB2YWxpZCBydWJyaWMgaXRlbSwgYW5kIG1ha2Ugc3VyZSBpdCdzIG5vdCB0aGUgXCJPcmRlclwiIGl0ZW0uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXN0b21SdWJyaWNzLmhhc093blByb3BlcnR5KGN1c3RvbVJ1YnJpY3MuT3JkZXJbb0luZF0pICYmIGN1c3RvbVJ1YnJpY3MuT3JkZXJbb0luZF0gIT09IFwiT3JkZXJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRoaXNSdWJyaWMgPSBjdXN0b21SdWJyaWNzLk9yZGVyW29JbmRdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2tEYXRhLk9yZGVyLmluZGV4T2YodGhpc1J1YnJpYykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhLk9yZGVyLnB1c2godGhpc1J1YnJpYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbVJ1YnJpY3MuT3JkZXIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgfSwgW1wicnVicmljc1wiXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGp1ZGdlRW50cnkoY29udGVzdElkLCBlbnRyeUlkLCBzY29yZURhdGEsIGNhbGxiYWNrKVxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSdyZSBqdWRnaW5nIGFuIGVudHJ5IGZvclxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZW50cnlJZDogVGhlIElEIG9mIHRoZSBlbnRyeSB0aGF0IHdlJ3JlIGp1ZGdpbmdcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHNjb3JlRGF0YTogVGhlIHNjb3JpbmcgZGF0YVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBhZnRlciB3ZSd2ZSB2YWxpZGF0ZWQgdGhlIHNjb3JlcywgYW5kIHN1Ym1pdHRlZCB0aGVtLlxuICAgICAgICAgKi9cbiAgICAgICAganVkZ2VFbnRyeTogZnVuY3Rpb24oY29udGVzdElkLCBlbnRyeUlkLCBzY29yZURhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyAwOiBDaGVjayB0aGUgdXNlcnMgcGVybSBsZXZlbCwgaWYgdGhlaXIgcGVybUxldmVsIGlzbid0ID49IDQsIGV4aXQuXG4gICAgICAgICAgICAvLyAxOiBGZXRjaCB0aGUgcnVicmljcyBmb3IgdGhlIGN1cnJlbnQgY29udGVzdCwgdG8gbWFrZSBzdXJlIHdlJ3JlIG5vdCBkb2luZyBhbnl0aGluZyBmdW5reVxuICAgICAgICAgICAgLy8gMjogVmFsaWRhdGUgdGhlIGRhdGEgdGhhdCB3YXMgc3VibWl0dGVkIHRvIHRoZSBmdW5jdGlvblxuICAgICAgICAgICAgLy8gMzogU3VibWl0IHRoZSBkYXRhIHRvIEZpcmViYXNlXG5cbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5nZXRQZXJtTGV2ZWwoZnVuY3Rpb24ocGVybUxldmVsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBlcm1MZXZlbCA+PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0aGlzSnVkZ2UgPSBzZWxmLmZldGNoRmlyZWJhc2VBdXRoKCkudWlkO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0Q29udGVzdFJ1YnJpY3MoY29udGVzdElkLCBmdW5jdGlvbihjb250ZXN0UnVicmljcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWQgPSAoY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWQgPT09IHVuZGVmaW5lZCA/IFtdIDogY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGVzdFJ1YnJpY3MuaGFzT3duUHJvcGVydHkoXCJqdWRnZXNXaG9Wb3RlZFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZC5pbmRleE9mKHRoaXNKdWRnZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKEVSUk9SX01FU1NBR0VTLkVSUl9BTFJFQURZX1ZPVEVEKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGlzSnVkZ2VzVm90ZSA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzY29yZSBpbiBzY29yZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGVzdFJ1YnJpY3MuaGFzT3duUHJvcGVydHkoc2NvcmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzY29yZVZhbCA9IC0xO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY29yZURhdGFbc2NvcmVdID4gY29udGVzdFJ1YnJpY3Nbc2NvcmVdLm1heCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmVWYWwgPSBjb250ZXN0UnVicmljc1tzY29yZV0ubWF4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNjb3JlRGF0YVtzY29yZV0gPCBjb250ZXN0UnVicmljc1tzY29yZV0ubWluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZVZhbCA9IGNvbnRlc3RSdWJyaWNzW3Njb3JlXS5taW47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZVZhbCA9IHNjb3JlRGF0YVtzY29yZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzSnVkZ2VzVm90ZVtzY29yZV0gPSBzY29yZVZhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXNKdWRnZXNWb3RlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5mZXRjaENvbnRlc3RFbnRyeShjb250ZXN0SWQsIGVudHJ5SWQsIGZ1bmN0aW9uKGV4aXN0aW5nU2NvcmVEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdTY29yZURhdGEgPSBleGlzdGluZ1Njb3JlRGF0YS5zY29yZXM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZC5wdXNoKHRoaXNKdWRnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YVRvV3JpdGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGp1ZGdlc1dob1ZvdGVkOiBjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmdTY29yZURhdGEuaGFzT3duUHJvcGVydHkoXCJydWJyaWNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4aXN0aW5nUnVicmljSXRlbVNjb3JlcyA9IGV4aXN0aW5nU2NvcmVEYXRhLnJ1YnJpYztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBydWJyaWNJdGVtcyA9IGNvbnRlc3RSdWJyaWNzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHJ1YnJpY0l0ZW0gaW4gcnVicmljSXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzSnVkZ2VzVm90ZS5oYXNPd25Qcm9wZXJ0eShydWJyaWNJdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlIGl0ZW06IFwiICsgcnVicmljSXRlbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG1wU2NvcmVPYmogPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2ZzogKGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXSA9PT0gdW5kZWZpbmVkID8gMSA6IGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXS5hdmcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3VnaDogKGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXSA9PT0gdW5kZWZpbmVkID8gMSA6IGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXS5yb3VnaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFUb1dyaXRlLmp1ZGdlc1dob1ZvdGVkLmxlbmd0aCAtIDEgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wU2NvcmVPYmoucm91Z2ggPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXBTY29yZU9iai5hdmcgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcFNjb3JlT2JqLnJvdWdoID0gdG1wU2NvcmVPYmoucm91Z2ggKyB0aGlzSnVkZ2VzVm90ZVtydWJyaWNJdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXBTY29yZU9iai5hdmcgPSB0bXBTY29yZU9iai5yb3VnaCAvIChjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZC5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVRvV3JpdGVbcnVicmljSXRlbV0gPSB0bXBTY29yZU9iajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGFUb1dyaXRlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmYlJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNoaWxkKFwiZW50cmllc1wiKS5jaGlsZChlbnRyeUlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2hpbGQoXCJzY29yZXNcIikuY2hpbGQoXCJydWJyaWNcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYlJlZi5zZXQoZGF0YVRvV3JpdGUsIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yZXBvcnRFcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1wic2NvcmVzXCJdKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soRVJST1JfTUVTU0FHRVMuRVJSX05PVF9KVURHRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcbiIsInZhciBDSlMgPSByZXF1aXJlKFwiLi4vYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzXCIpO1xudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVycy9oZWxwZXJzLmpzXCIpO1xuXG4vKipcbiAqIGNyZWF0ZUNvbnRlc3RDb250cm9sKGNvbnRyb2xEYXRhKVxuICogQ3JlYXRlcyBhIGJ1dHRvbiB1c2luZyB0aGUgZGF0YSBzcGVjaWZpZWQsIGFuZCByZXR1cm5zIGl0IHRvIHRoZSBjYWxsZXIuXG4gKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICogQGNvbnRyaWJ1dG9ycyBEYXJyeWwgWWVvICgyMDE1KVxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRyb2xEYXRhOiBUaGUgSlNPTiBvYmplY3QgY29udGFpbmluZyB0aGUgZGF0YSBmb3IgdGhlIGNvbnRyb2wgKHN1Y2ggYXMgZGlzcGxheSB0ZXh0IGFuZCB3aGVyZSB0aGUgY29udHJvbCBzaG91bGQgbGluayB0bylcbiAqIEByZXR1cm5zIHtqUXVlcnl9IGNvbnRlc3RDb250cm9sOiBUaGUgalF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBuZXdseSBjcmVhdGVkIGNvbnRlc3QgY29udHJvbFxuICovXG52YXIgY3JlYXRlQ29udGVzdENvbnRyb2wgPSBmdW5jdGlvbihjb250cm9sRGF0YSkge1xuICAgIHJldHVybiAkKFwiPGE+XCIpXG4gICAgICAgIC5hZGRDbGFzcyhcIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBhbWJlciBkYXJrZW4tMiBidG4gY29udGVzdC1jb250cm9sXCIpXG4gICAgICAgIC50ZXh0KGNvbnRyb2xEYXRhLnRleHQpXG4gICAgICAgIC5hdHRyKFwiaHJlZlwiLCAoY29udHJvbERhdGEubGluayA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGNvbnRyb2xEYXRhLmxpbmspKTtcbn07XG5cbi8qKlxuICogY3JlYXRlQ29udGVzdERldGFpbHMoY29udGVzdERhdGEpXG4gKiBDcmVhdGVzIGEgXCJjb250ZXN0IGRldGFpbHNcIiBkaXYsIGFuZCByZXR1cm5zIGl0IHRvIHRoZSBjYWxsZXIuXG4gKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICogQGNvbnRyaWJ1dG9ycyBEYXJyeWwgWWVvICgyMDE1KVxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRlc3REYXRhOiBBIEpTT04gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRhdGEgZm9yIGEgY29udGVzdC5cbiAqIEByZXR1cm5zIHtqUXVlcnl9IGNvbnRlc3REZXRhaWxzOiBUaGUgalF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBcImNvbnRlc3QgZGV0YWlsc1wiIGRpdi5cbiAqL1xudmFyIGNyZWF0ZUNvbnRlc3REZXRhaWxzID0gZnVuY3Rpb24oY29udGVzdERhdGEpIHtcbiAgICByZXR1cm4gJChcIjxkaXY+XCIpXG4gICAgICAgIC5hZGRDbGFzcyhcImNvbCBzMTIgbTlcIilcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8aDU+XCIpLmFkZENsYXNzKFwidGl0bGVcIikudGV4dChjb250ZXN0RGF0YS50aXRsZSlcbiAgICAgICAgKVxuICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgJChcIjxkaXY+XCIpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKFwiZGVzY3JpcHRpb25cIilcbiAgICAgICAgICAgICAgICAuaHRtbChjb250ZXN0RGF0YS5kZXNjcmlwdGlvbilcbiAgICAgICAgKTtcbn07XG5cbi8qKlxuICogY3JlYXRlQ29udGVzdEhvbGRlcihjb250ZXN0RGF0YSlcbiAqIENyZWF0ZXMgYSBcImNvbnRlc3QgaG9sZGVyXCIgZGl2LCBhbmQgcmV0dXJucyBpdCB0byB0aGUgY2FsbGVyLlxuICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAqIEBjb250cmlidXRvcnMgRGFycnlsIFllbyAoMjAxNSlcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXN0RGF0YTogQSBKU09OIG9iamVjdCBjb250YWluaW5nIHRoZSBkYXRhIGZvciBhIGNvbnRlc3QuXG4gKiBAcmV0dXJucyB7alF1ZXJ5fSBjb250ZXN0SG9sZGVyOiBUaGUgalF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBcImNvbnRlc3QgaG9sZGVyXCIgZGl2LlxuICovXG52YXIgY3JlYXRlQ29udGVzdEhvbGRlciA9IGZ1bmN0aW9uKGNvbnRlc3REYXRhKSB7XG4gICAgdmFyIGNvbnRlc3RIb2xkZXIgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJjb250ZXN0IHNlY3Rpb25cIikuYXR0cihcImlkXCIsIGNvbnRlc3REYXRhLmlkKVxuICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgY3JlYXRlQ29udGVzdERldGFpbHMoY29udGVzdERhdGEpXG4gICAgICAgIClcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcImNvbCBzMTIgbTNcIilcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgICAgICAgICAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJjZW50ZXJcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcIjxpbWc+XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3JjXCIsIGNvbnRlc3REYXRhLnRodW1ibmFpbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKFwiaW1nLXJlc3BvbnNpdmUgY29udGVzdC10aHVtYm5haWxcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29udGVzdENvbnRyb2woe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIlZpZXcgRW50cmllc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rOiBcImNvbnRlc3QuaHRtbD9jb250ZXN0PVwiICsgY29udGVzdERhdGEuaWQgKyBcIiZjb3VudD0zMlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICk7XG5cbiAgICBDSlMuZ2V0UGVybUxldmVsKGZ1bmN0aW9uKHBlcm1MZXZlbCkge1xuICAgICAgICBpZiAocGVybUxldmVsID49IDUpIHtcbiAgICAgICAgICAgICQoXCIjXCIgKyBjb250ZXN0RGF0YS5pZCArIFwiIC5jZW50ZXJcIikuYXBwZW5kKFxuICAgICAgICAgICAgICAgIGNyZWF0ZUNvbnRlc3RDb250cm9sKHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJWaWV3IExlYWRlcmJvYXJkXCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwibGVhZGVyYm9hcmQuaHRtbD9jb250ZXN0PVwiICsgY29udGVzdERhdGEuaWRcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbnRlc3RIb2xkZXI7XG59O1xuXG52YXIgc2V0dXBQYWdlID0gZnVuY3Rpb24oY29udGVzdERhdGEpIHtcbiAgICBmb3IgKGxldCBjaWQgaW4gY29udGVzdERhdGEpIHtcbiAgICAgICAgbGV0IGNvbnRlc3QgPSBjb250ZXN0RGF0YVtjaWRdO1xuXG4gICAgICAgICQoXCIjY29udGVzdHNcIikuYXBwZW5kKFxuICAgICAgICAgICAgJChcIjxkaXY+XCIpLmFkZENsYXNzKFwicm93XCIpXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29udGVzdEhvbGRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogY29udGVzdC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBjb250ZXN0Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKGNvbnRlc3QuZGVzYyA9PT0gXCJcIiA/IFwiTm8gZGVzY3JpcHRpb24gcHJvdmlkZWQuXCIgOiBjb250ZXN0LmRlc2MpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGh1bWJuYWlsOiBcImh0dHBzOi8vd3d3LmtoYW5hY2FkZW15Lm9yZy9cIiArIGNvbnRlc3QuaW1nXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJkaXZpZGVyXCIpXG4gICAgICAgICk7XG4gICAgfVxufTtcblxuaGVscGVycy5hdXRoZW50aWNhdGlvbi5zZXR1cFBhZ2VBdXRoKFwiI2F1dGhCdG5cIiwgQ0pTKTtcbkNKUy5mZXRjaENvbnRlc3RzKHNldHVwUGFnZSk7XG5cbi8vICQoXCIjYXV0aEJ0blwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2dCkge1xuLy8gICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4vLyAgICAgaWYgKGZiQXV0aCA9PT0gbnVsbCkge1xuLy8gICAgICAgICBDSlMuYXV0aGVudGljYXRlKCk7XG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgQ0pTLmF1dGhlbnRpY2F0ZSh0cnVlKTtcbi8vICAgICB9XG4vLyB9KTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGFkZEFkbWluTGluazogZnVuY3Rpb24oc2VsZWN0b3IsIGNqc1dyYXBwZXIpIHtcbiAgICAgICAgY2pzV3JhcHBlci5nZXRQZXJtTGV2ZWwoZnVuY3Rpb24ocGVybUxldmVsKSB7XG4gICAgICAgICAgICBpZiAocGVybUxldmVsID49IDUpIHtcbiAgICAgICAgICAgICAgICAkKFwiPGxpPlwiKS5hZGRDbGFzcyhcImFjdGl2ZVwiKS5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICQoXCI8YT5cIikuYXR0cihcImhyZWZcIiwgXCIuL2FkbWluL1wiKS50ZXh0KFwiQWRtaW4gZGFzaGJvYXJkXCIpXG4gICAgICAgICAgICAgICAgKS5pbnNlcnRCZWZvcmUoJChzZWxlY3RvcikucGFyZW50KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHNldHVwT25DbGljazogZnVuY3Rpb24oc2VsZWN0b3IsIGNqc1dyYXBwZXIpIHtcbiAgICAgICAgJChzZWxlY3Rvcikub24oXCJjbGlja1wiLCAoZXZ0KSA9PiB7XG4gICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaWYgKGNqc1dyYXBwZXIuZmV0Y2hGaXJlYmFzZUF1dGgoKSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNqc1dyYXBwZXIuYXV0aGVudGljYXRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNqc1dyYXBwZXIuYXV0aGVudGljYXRlKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHNob3dXZWxjb21lOiBmdW5jdGlvbihzZWxlY3RvciwgY2pzV3JhcHBlcikge1xuICAgICAgICBpZiAoY2pzV3JhcHBlci5mZXRjaEZpcmViYXNlQXV0aCgpID09PSBudWxsKSB7XG4gICAgICAgICAgICAkKHNlbGVjdG9yKS50ZXh0KFwiSGVsbG8gZ3Vlc3QhIENsaWNrIG1lIHRvIGxvZyBpbi5cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKHNlbGVjdG9yKS50ZXh0KGBIZWxsbyAke2Nqc1dyYXBwZXIuZmV0Y2hGaXJlYmFzZUF1dGgoKS5nb29nbGUuZGlzcGxheU5hbWV9ISAoTm90IHlvdT8gQ2xpY2sgaGVyZSEpYCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNldHVwUGFnZUF1dGg6IGZ1bmN0aW9uKGF1dGhCdG5TZWxlY3RvciwgY2pzV3JhcHBlcikge1xuICAgICAgICB0aGlzLnNldHVwT25DbGljayhhdXRoQnRuU2VsZWN0b3IsIGNqc1dyYXBwZXIpO1xuICAgICAgICB0aGlzLnNob3dXZWxjb21lKGF1dGhCdG5TZWxlY3RvciwgY2pzV3JhcHBlcik7XG4gICAgICAgIC8vIHRoaXMuYWRkQWRtaW5MaW5rKGF1dGhCdG5TZWxlY3RvciwgY2pzV3JhcHBlcik7XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBnZXRDb29raWUoY29va2llTmFtZSlcbiAgICAgKiBGZXRjaGVzIHRoZSBzcGVjaWZpZWQgY29va2llIGZyb20gdGhlIGJyb3dzZXIsIGFuZCByZXR1cm5zIGl0J3MgdmFsdWUuXG4gICAgICogQGF1dGhvciB3M3NjaG9vbHNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29va2llTmFtZTogVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0aGF0IHdlIHdhbnQgdG8gZmV0Y2guXG4gICAgICogQHJldHVybnMge1N0cmluZ30gY29va2llVmFsdWU6IFRoZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIGNvb2tpZSwgb3IgYW4gZW1wdHkgc3RyaW5nLCBpZiB0aGVyZSBpcyBubyBcIm5vbi1mYWxzeVwiIHZhbHVlLlxuICAgICAqL1xuICAgIGdldENvb2tpZTogZnVuY3Rpb24oY29va2llTmFtZSkge1xuICAgICAgICAvLyBHZXQgdGhlIGNvb2tpZSB3aXRoIG5hbWUgY29va2llIChyZXR1cm4gXCJcIiBpZiBub24tZXhpc3RlbnQpXG4gICAgICAgIGNvb2tpZU5hbWUgPSBjb29raWVOYW1lICsgXCI9XCI7XG4gICAgICAgIC8vIENoZWNrIGFsbCBvZiB0aGUgY29va2llcyBhbmQgdHJ5IHRvIGZpbmQgdGhlIG9uZSBjb250YWluaW5nIG5hbWUuXG4gICAgICAgIHZhciBjb29raWVMaXN0ID0gZG9jdW1lbnQuY29va2llLnNwbGl0KFwiO1wiKTtcbiAgICAgICAgZm9yICh2YXIgY0luZCA9IDA7IGNJbmQgPCBjb29raWVMaXN0Lmxlbmd0aDsgY0luZCArKykge1xuICAgICAgICAgICAgdmFyIGN1ckNvb2tpZSA9IGNvb2tpZUxpc3RbY0luZF07XG4gICAgICAgICAgICB3aGlsZSAoY3VyQ29va2llWzBdID09PSBcIiBcIikge1xuICAgICAgICAgICAgICAgIGN1ckNvb2tpZSA9IGN1ckNvb2tpZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiB3ZSd2ZSBmb3VuZCB0aGUgcmlnaHQgY29va2llLCByZXR1cm4gaXRzIHZhbHVlLlxuICAgICAgICAgICAgaWYgKGN1ckNvb2tpZS5pbmRleE9mKGNvb2tpZU5hbWUpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1ckNvb2tpZS5zdWJzdHJpbmcoY29va2llTmFtZS5sZW5ndGgsIGN1ckNvb2tpZS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgaWYgdGhlIGNvb2tpZSBkb2Vzbid0IGV4aXN0LCByZXR1cm4gXCJcIlxuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIHNldENvb2tpZShjb29raWVOYW1lLCB2YWx1ZSlcbiAgICAgKiBDcmVhdGVzL3VwZGF0ZXMgYSBjb29raWUgd2l0aCB0aGUgZGVzaXJlZCBuYW1lLCBzZXR0aW5nIGl0J3MgdmFsdWUgdG8gXCJ2YWx1ZVwiLlxuICAgICAqIEBhdXRob3IgdzNzY2hvb2xzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvb2tpZU5hbWU6IFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdGhhdCB3ZSB3YW50IHRvIGNyZWF0ZS91cGRhdGUuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlOiBUaGUgdmFsdWUgdG8gYXNzaWduIHRvIHRoZSBjb29raWUuXG4gICAgICovXG4gICAgc2V0Q29va2llOiBmdW5jdGlvbihjb29raWVOYW1lLCB2YWx1ZSkge1xuICAgICAgICAvLyBTZXQgYSBjb29raWUgd2l0aCBuYW1lIGNvb2tpZSBhbmQgdmFsdWUgY29va2llIHRoYXQgd2lsbCBleHBpcmUgMzAgZGF5cyBmcm9tIG5vdy5cbiAgICAgICAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBkLnNldFRpbWUoZC5nZXRUaW1lKCkgKyAoMzAgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG4gICAgICAgIHZhciBleHBpcmVzID0gXCJleHBpcmVzPVwiICsgZC50b1VUQ1N0cmluZygpO1xuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWVOYW1lICsgXCI9XCIgKyB2YWx1ZSArIFwiOyBcIiArIGV4cGlyZXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBnZXRVcmxQYXJhbXMoKVxuICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybDogVGhlIFVSTCB0byBmZXRjaCBVUkwgcGFyYW1ldGVycyBmcm9tXG4gICAgICovXG4gICAgZ2V0VXJsUGFyYW1zOiBmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgdmFyIHVybFBhcmFtcyA9IHt9O1xuXG4gICAgICAgIHZhciBzcGxpdFVybCA9IHVybC5zcGxpdChcIj9cIilbMV07XG5cbiAgICAgICAgaWYgKHNwbGl0VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciB0bXBVcmxQYXJhbXMgPSBzcGxpdFVybC5zcGxpdChcIiZcIik7XG5cbiAgICAgICAgICAgIGZvciAobGV0IHVwSW5kID0gMDsgdXBJbmQgPCB0bXBVcmxQYXJhbXMubGVuZ3RoOyB1cEluZCsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJQYXJhbVN0ciA9IHRtcFVybFBhcmFtc1t1cEluZF07XG5cbiAgICAgICAgICAgICAgICB1cmxQYXJhbXNbY3VyclBhcmFtU3RyLnNwbGl0KFwiPVwiKVswXV0gPSBjdXJyUGFyYW1TdHIuc3BsaXQoXCI9XCIpWzFdXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCNcXCEvZywgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXJsUGFyYW1zO1xuICAgIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgYXV0aGVudGljYXRpb246IHJlcXVpcmUoXCIuL2F1dGhlbnRpY2F0aW9uLmpzXCIpLFxuICAgIGdlbmVyYWw6IHJlcXVpcmUoXCIuL2dlbmVyYWwuanNcIilcbn07Il19
