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
var helpers = require("../generalPurpose.js");

var setupLeaderboard = function setupLeaderboard(data) {
    console.log(data);

    var leaderboardColumns = [{
        data: "Entry ID"
    }, {
        data: "Entry Name"
    }];

    if (data.rubrics.hasOwnProperty("Order")) {
        for (var rInd = 0; rInd < data.rubrics.Order.length; rInd++) {
            leaderboardColumns.push({
                data: data.rubrics.Order[rInd].replace(/\_/g, " ")
            });
        }
    }

    leaderboardColumns.push({
        data: "Total Score"
    });

    var tableHeader = $("#leaderboard thead tr");

    for (var colInd = 0; colInd < leaderboardColumns.length; colInd++) {
        tableHeader.append($("<td>").text(leaderboardColumns[colInd].data));
    }

    console.log(leaderboardColumns);

    var leaderboardRows = [];

    for (var entry in data.entries) {
        console.log(data.entries[entry]);

        var rowObj = {
            "Entry ID": data.entries[entry].id,
            "Entry Name": "<a href=\"https://www.khanacademy.org/computer-programming/contest-entry/" + data.entries[entry].id + "\">" + data.entries[entry].name + "</a>"
        };

        var totalScore = 0;

        for (var oInd = 0; oInd < data.rubrics.Order.length; oInd++) {
            var currRubric = data.rubrics.Order[oInd];
            var score = data.entries[entry].scores.rubric.hasOwnProperty(currRubric) ? data.entries[entry].scores.rubric[currRubric].avg : data.rubrics[currRubric].min;

            totalScore += score;

            if (data.rubrics[currRubric].hasOwnProperty("keys")) {
                rowObj[currRubric.replace(/\_/g, " ")] = "(" + score + ") " + data.rubrics[currRubric].keys[score];
            } else {
                rowObj[currRubric.replace(/\_/g, " ")] = score;
            }
        }

        rowObj["Total Score"] = totalScore;
        leaderboardRows.push(rowObj);
    }

    var leaderboardObj = $("#leaderboard").DataTable({
        columns: leaderboardColumns,
        data: leaderboardRows
    });

    $("[name=leaderboard_length]").addClass("browser-default").append($("<option>").attr("value", "500000").text("An uber-epic amount"));
};

var showPage = function showPage() {
    var urlParams = helpers.getUrlParams(window.location.href);

    if (CJS.fetchFirebaseAuth() === null) {
        $("#authBtn").text("Hello, guest! Click me to login.");
    } else {
        $("#authBtn").text("Welcome, " + CJS.fetchFirebaseAuth().google.displayName + "! (Not you? Click here)");
    }

    var contestId = null;

    if (urlParams.hasOwnProperty("contest")) {
        contestId = urlParams.contest.replace(/\#/g, "");
    } else {
        alert("Contest ID not specified. Returning to homepage.");
        window.location.href = "index.html";
    }

    CJS.getContestRubrics(contestId, function (rubrics) {
        CJS.fetchContest(contestId, function (contestData) {
            contestData.rubrics = rubrics;

            setupLeaderboard(contestData);
        }, ["id", "name", "desc", "img", "entries"]);
    });
};

CJS.getPermLevel(function (permLevel) {
    if (permLevel >= 5) {
        showPage();
    } else {
        alert("You do not have the required permissions to view this page. Returning to homepage.");
        window.location.href = "index.html";
    }
});

$("#authBtn").on("click", function (evt) {
    evt.preventDefault();

    if (CJS.fetchFirebaseAuth() === null) {
        CJS.authenticate();
    } else {
        CJS.authenticate(true);
    }
});

},{"../backend/contest_judging_sys.js":1,"../generalPurpose.js":3}],3:[function(require,module,exports){
"use strict";

module.exports = (function () {
    return {
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
})();

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2NsaWVudC9sZWFkZXJib2FyZC5qcyIsIi9Vc2Vycy9CcnluZGVuL3NwYXJrL0NvbnRlc3QtSnVkZ2luZy1TeXN0ZW0tZm9yLUtBL3NyYy9nZW5lcmFsUHVycG9zZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLFlBQVc7QUFDekIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO0FBQ3BDLGVBQU87S0FDVjs7O0FBR0QsUUFBSSxZQUFZLEdBQUcsNENBQTRDLENBQUM7OztBQUdoRSxRQUFJLHVCQUF1QixHQUFHLEVBQUUsQ0FBQzs7O0FBR2pDLFFBQUksY0FBYyxHQUFHO0FBQ2pCLHFCQUFhLEVBQUUsNkRBQTZEO0FBQzVFLHlCQUFpQixFQUFFLDBDQUEwQztLQUNoRSxDQUFDOztBQUVGLFdBQU87QUFDSCxtQkFBVyxFQUFFLHFCQUFTLEtBQUssRUFBRTtBQUN6QixtQkFBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN4QjtBQUNELHlCQUFpQixFQUFFLDZCQUFXO0FBQzFCLG1CQUFPLEFBQUMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFFLE9BQU8sRUFBRSxDQUFDO1NBQ3hEO0FBQ0Qsa0JBQVUsRUFBRSxvQkFBUyxRQUFRLEVBQUU7QUFDM0IsQUFBQyxnQkFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFF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R0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNDLG9CQUFRLENBQUMsTUFBTSxHQUFHLFVBQVUsR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxPQUFPLENBQUM7U0FDL0Q7Ozs7OztBQU1ELG9CQUFZLEVBQUUsc0JBQVMsR0FBRyxFQUFFO0FBQ3hCLGdCQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7O0FBRW5CLGdCQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVqQyxnQkFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQ3hCLG9CQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUV2QyxxQkFBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDdEQsd0JBQUksWUFBWSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFdkMsNkJBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDN0QsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztpQkFDN0I7YUFDSjs7QUFFRCxtQkFBTyxTQUFTLENBQUM7U0FDcEI7S0FDSixDQUFDO0NBQ0wsQ0FBQSxFQUFHLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF3aW5kb3cualF1ZXJ5IHx8ICF3aW5kb3cuRmlyZWJhc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgdmFyaWFibGUgaXMgdXNlZCB0byBzdG9yZSBvdXIgXCJGaXJlYmFzZSBLZXlcIlxuICAgIGxldCBGSVJFQkFTRV9LRVkgPSBcImh0dHBzOi8vY29udGVzdC1qdWRnaW5nLXN5cy5maXJlYmFzZWlvLmNvbVwiO1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyB2YXJpYWJsZSBpcyB1c2VkIHRvIHNwZWNpZnkgdGhlIGRlZmF1bHQgbnVtYmVyIG9mIGVudHJpZXMgdG8gZmV0Y2hcbiAgICBsZXQgREVGX05VTV9FTlRSSUVTX1RPX0xPQUQgPSAxMDtcblxuICAgIC8vIEVycm9yIG1lc3NhZ2VzLlxuICAgIGxldCBFUlJPUl9NRVNTQUdFUyA9IHtcbiAgICAgICAgRVJSX05PVF9KVURHRTogXCJFcnJvcjogWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8ganVkZ2UgY29udGVzdCBlbnRyaWVzLlwiLFxuICAgICAgICBFUlJfQUxSRUFEWV9WT1RFRDogXCJFcnJvcjogWW91J3ZlIGFscmVhZHkganVkZ2VkIHRoaXMgZW50cnkuXCJcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVwb3J0RXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgZmV0Y2hGaXJlYmFzZUF1dGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpLmdldEF1dGgoKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25jZUF1dGhlZDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpLm9uQXV0aChjYWxsYmFjaywgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhdXRoZW50aWNhdGUobG9nb3V0KVxuICAgICAgICAgKiBJZiBsb2dvdXQgaXMgZmFsc2UgKG9yIHVuZGVmaW5lZCksIHdlIHJlZGlyZWN0IHRvIGEgZ29vZ2xlIGxvZ2luIHBhZ2UuXG4gICAgICAgICAqIElmIGxvZ291dCBpcyB0cnVlLCB3ZSBpbnZva2UgRmlyZWJhc2UncyB1bmF1dGggbWV0aG9kICh0byBsb2cgdGhlIHVzZXIgb3V0KSwgYW5kIHJlbG9hZCB0aGUgcGFnZS5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtCb29sZWFufSBsb2dvdXQqOiBTaG91bGQgd2UgbG9nIHRoZSB1c2VyIG91dD8gKERlZmF1bHRzIHRvIGZhbHNlKVxuICAgICAgICAgKi9cbiAgICAgICAgYXV0aGVudGljYXRlOiBmdW5jdGlvbihsb2dvdXQgPSBmYWxzZSkge1xuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIGlmICghbG9nb3V0KSB7XG4gICAgICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgZmlyZWJhc2VSZWYuYXV0aFdpdGhPQXV0aFBvcHVwKFwiZ29vZ2xlXCIsIGZ1bmN0aW9uKGVyciwgYXV0aERhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmJVc2Vyc1JlZiA9IGZpcmViYXNlUmVmLmNoaWxkKFwidXNlcnNcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZiVXNlcnNSZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHVzZXJzU25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXVzZXJzU25hcHNob3QuaGFzQ2hpbGQoYXV0aERhdGEudWlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYlVzZXJzUmVmLmNoaWxkKGF1dGhEYXRhLnVpZCkuc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGF1dGhEYXRhLmdvb2dsZS5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1MZXZlbDogMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBzZWxmLnJlcG9ydEVycm9yKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFkZGVkIG5ldyB1c2VyIHRvIEZpcmViYXNlISBXZWxjb21lIHRvIENKU0tBIFxcXCJcIiArIGF1dGhEYXRhLmdvb2dsZS5kaXNwbGF5TmFtZSArIFwiXFxcIiFcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlyZWJhc2VSZWYudW5hdXRoKCk7XG5cbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXRQZXJtTGV2ZWwoKVxuICAgICAgICAgKiBHZXRzIHRoZSBwZXJtIGxldmVsIG9mIHRoZSB1c2VyIHRoYXQgaXMgY3VycmVudGx5IGxvZ2dlZCBpbi5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSByZWNpZXZlZCB0aGUgZGF0YS5cbiAgICAgICAgICovXG4gICAgICAgIGdldFBlcm1MZXZlbDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGxldCBhdXRoRGF0YSA9IHRoaXMuZmV0Y2hGaXJlYmFzZUF1dGgoKTtcblxuICAgICAgICAgICAgaWYgKGF1dGhEYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG4gICAgICAgICAgICAgICAgbGV0IHRoaXNVc2VyQ2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcInVzZXJzXCIpLmNoaWxkKGF1dGhEYXRhLnVpZCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzVXNlckNoaWxkLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc25hcHNob3QudmFsKCkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNuYXBzaG90LnZhbCgpLnBlcm1MZXZlbCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZldGNoQ29udGVzdEVudHJ5KGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2ssIHByb3BlcnRpZXMpXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHRoZSBlbnRyeSB3ZSB3YW50IHRvIGxvYWQgZGF0YSBmb3IgcmVzaWRlcyB1bmRlclxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZW50cnlJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IGVudHJ5IHRoYXQgd2Ugd2FudCB0byBsb2FkIGRhdGEgZm9yXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgbG9hZGVkIGFsbCBvZiB0aGUgcmVxdWlyZWQgZGF0YVxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBwcm9wZXJ0aWVzKjogQSBsaXN0IG9mIGFsbCB0aGUgcHJvcGVydGllcyB0aGF0IHlvdSB3YW50IHRvIGxvYWQgZnJvbSB0aGlzIGNvbnRlc3QgZW50cnlcbiAgICAgICAgICovXG4gICAgICAgIGZldGNoQ29udGVzdEVudHJ5OiBmdW5jdGlvbihjb250ZXN0SWQsIGVudHJ5SWQsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0Q2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZCk7XG4gICAgICAgICAgICBsZXQgZW50cnlDaGlsZCA9IGNvbnRlc3RDaGlsZC5jaGlsZChcImVudHJpZXNcIikuY2hpbGQoZW50cnlJZCk7XG5cbiAgICAgICAgICAgIGxldCByZXF1aXJlZFByb3BzID0gKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IFtcImlkXCIsIFwibmFtZVwiLCBcInRodW1iXCJdIDogcHJvcGVydGllcyk7XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7fTtcblxuICAgICAgICAgICAgZm9yIChsZXQgcHJvcEluZCA9IDA7IHByb3BJbmQgPCByZXF1aXJlZFByb3BzLmxlbmd0aDsgcHJvcEluZCsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJQcm9wID0gcmVxdWlyZWRQcm9wc1twcm9wSW5kXTtcblxuICAgICAgICAgICAgICAgIGVudHJ5Q2hpbGQuY2hpbGQoY3VyclByb3ApLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbY3VyclByb3BdID0gc25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0KGNvbnRlc3RJZCwgY2FsbGJhY2ssIHByb3BlcnRpZXMpXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHlvdSB3YW50IHRvIGxvYWQgZGF0YSBmb3JcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSByZWNlaXZlZCB0aGUgZGF0YS5cbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gcHJvcGVydGllcyo6IEEgbGlzdCBvZiBhbGwgdGhlIHByb3BlcnRpZXMgdGhhdCB5b3Ugd2FudCB0byBsb2FkIGZyb20gdGhpcyBjb250ZXN0LlxuICAgICAgICAgKi9cbiAgICAgICAgZmV0Y2hDb250ZXN0OiBmdW5jdGlvbihjb250ZXN0SWQsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0Q2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZCk7XG5cbiAgICAgICAgICAgIC8vIFByb3BlcnRpZXMgdGhhdCB3ZSBtdXN0IGhhdmUgYmVmb3JlIGNhbiBpbnZva2Ugb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICBsZXQgcmVxdWlyZWRQcm9wcyA9IChwcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyBbXCJpZFwiLCBcIm5hbWVcIiwgXCJkZXNjXCIsIFwiaW1nXCIsIFwiZW50cnlDb3VudFwiXSA6IHByb3BlcnRpZXMpO1xuXG4gICAgICAgICAgICAvLyBUaGUgb2JqZWN0IHRoYXQgd2UgcGFzcyBpbnRvIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHt9O1xuXG4gICAgICAgICAgICBmb3IgKGxldCBwcm9wSW5kID0gMDsgcHJvcEluZCA8IHJlcXVpcmVkUHJvcHMubGVuZ3RoOyBwcm9wSW5kKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgY3VyclByb3AgPSByZXF1aXJlZFByb3BzW3Byb3BJbmRdO1xuXG4gICAgICAgICAgICAgICAgY29udGVzdENoaWxkLmNoaWxkKGN1cnJQcm9wKS5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhW2N1cnJQcm9wXSA9IHNuYXBzaG90LnZhbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0gcmVxdWlyZWRQcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzLnJlcG9ydEVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZldGNoQ29udGVzdHMoY2FsbGJhY2spXG4gICAgICAgICAqIEZldGNoZXMgYWxsIGNvbnRlc3RzIHRoYXQncmUgYmVpbmcgc3RvcmVkIGluIEZpcmViYXNlLCBhbmQgcGFzc2VzIHRoZW0gaW50byBhIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGNhcHR1cmVkIGFsbCB0aGUgZGF0YSB0aGF0IHdlIG5lZWQuXG4gICAgICAgICAqIEB0b2RvIChHaWdhYnl0ZSBHaWFudCk6IEFkZCBiZXR0ZXIgY29tbWVudHMhXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3RzOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIEZpcmViYXNlIGNoaWxkcmVuXG4gICAgICAgICAgICBsZXQgY29udGVzdEtleXNDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdEtleXNcIik7XG4gICAgICAgICAgICBsZXQgY29udGVzdHNDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIik7XG5cbiAgICAgICAgICAgIC8vIFByb3BlcnRpZXMgdGhhdCB3ZSBtdXN0IGhhdmUgYmVmb3JlIHdlIGNhbiBpbnZva2Ugb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICBsZXQgcmVxdWlyZWRQcm9wcyA9IFtcbiAgICAgICAgICAgICAgICBcImlkXCIsXG4gICAgICAgICAgICAgICAgXCJuYW1lXCIsXG4gICAgICAgICAgICAgICAgXCJkZXNjXCIsXG4gICAgICAgICAgICAgICAgXCJpbWdcIixcbiAgICAgICAgICAgICAgICBcImVudHJ5Q291bnRcIlxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgLy8ga2V5c1dlRm91bmQgaG9sZHMgYSBsaXN0IG9mIGFsbCBvZiB0aGUgY29udGVzdCBrZXlzIHRoYXQgd2UndmUgZm91bmQgc28gZmFyXG4gICAgICAgICAgICB2YXIga2V5c1dlRm91bmQgPSBbIF07XG5cbiAgICAgICAgICAgIC8vIGNhbGxiYWNrRGF0YSBpcyB0aGUgb2JqZWN0IHRoYXQgZ2V0cyBwYXNzZWQgaW50byBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7IH07XG5cbiAgICAgICAgICAgIC8vIFwiUXVlcnlcIiBvdXIgY29udGVzdEtleXNDaGlsZFxuICAgICAgICAgICAgY29udGVzdEtleXNDaGlsZC5vcmRlckJ5S2V5KCkub24oXCJjaGlsZF9hZGRlZFwiLCBmdW5jdGlvbihmYkl0ZW0pIHtcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGN1cnJlbnQga2V5IHRvIG91ciBcImtleXNXZUZvdW5kXCIgYXJyYXlcbiAgICAgICAgICAgICAgICBrZXlzV2VGb3VuZC5wdXNoKGZiSXRlbS5rZXkoKSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdGhpc0NvbnRlc3QgPSBjb250ZXN0c0NoaWxkLmNoaWxkKGZiSXRlbS5rZXkoKSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGhpc0NvbnRlc3REYXRhID0geyB9O1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcHJvcEluZCA9IDA7IHByb3BJbmQgPCByZXF1aXJlZFByb3BzLmxlbmd0aDsgcHJvcEluZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyUHJvcGVydHkgPSByZXF1aXJlZFByb3BzW3Byb3BJbmRdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzQ29udGVzdC5jaGlsZChjdXJyUHJvcGVydHkpLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihmYlNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzQ29udGVzdERhdGFbY3VyclByb3BlcnR5XSA9IGZiU25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gKEdpZ2FieXRlIEdpYW50KTogR2V0IHJpZCBvZiBhbGwgdGhpcyBuZXN0ZWQgXCJjcmFwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzQ29udGVzdERhdGEpLmxlbmd0aCA9PT0gcmVxdWlyZWRQcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbZmJJdGVtLmtleSgpXSA9IHRoaXNDb250ZXN0RGF0YTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0ga2V5c1dlRm91bmQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzLnJlcG9ydEVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZldGNoQ29udGVzdEVudHJpZXMoY29udGVzdElkLCBjYWxsYmFjaylcbiAgICAgICAgICpcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIEtoYW4gQWNhZGVteSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgd2Ugd2FudCB0byBmZXRjaCBlbnRyaWVzIGZvci5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2UgYWZ0ZXIgd2UndmUgZmV0Y2hlZCBhbGwgdGhlIGRhdGEgdGhhdCB3ZSBuZWVkLlxuICAgICAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IGxvYWRIb3dNYW55KjogVGhlIG51bWJlciBvZiBlbnRyaWVzIHRvIGxvYWQuIElmIG5vIHZhbHVlIGlzIHBhc3NlZCB0byB0aGlzIHBhcmFtZXRlcixcbiAgICAgICAgICogIGZhbGxiYWNrIG9udG8gYSBkZWZhdWx0IHZhbHVlLlxuICAgICAgICAgKi9cbiAgICAgICAgZmV0Y2hDb250ZXN0RW50cmllczogZnVuY3Rpb24oY29udGVzdElkLCBjYWxsYmFjaywgbG9hZEhvd01hbnkgPSBERUZfTlVNX0VOVFJJRVNfVE9fTE9BRCwgaW5jbHVkZUp1ZGdlZCA9IHRydWUpIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSB2YWxpZCBjYWxsYmFjayBmdW5jdGlvbiwgZXhpdCB0aGUgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gUmVmZXJlbmNlcyB0byBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IHRoaXNDb250ZXN0UmVmID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKS5jaGlsZChjb250ZXN0SWQpO1xuICAgICAgICAgICAgbGV0IGNvbnRlc3RFbnRyaWVzUmVmID0gdGhpc0NvbnRlc3RSZWYuY2hpbGQoXCJlbnRyaWVzXCIpO1xuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgZW50cmllcyB3ZSd2ZSBsb2FkZWRcbiAgICAgICAgICAgIHZhciBudW1Mb2FkZWQgPSAwO1xuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHN0b3JlIGVhY2ggb2YgdGhlIGVudHJpZXMgdGhhdCB3ZSd2ZSBsb2FkZWRcbiAgICAgICAgICAgIHZhciBlbnRyeUtleXMgPSBbIF07XG5cbiAgICAgICAgICAgIHZhciBhbHJlYWR5Q2hlY2tlZCA9IFtdO1xuXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGNvbnRlc3RFbnRyaWVzUmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihmYlNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgbGV0IHRtcEVudHJ5S2V5cyA9IE9iamVjdC5rZXlzKGZiU25hcHNob3QudmFsKCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRtcEVudHJ5S2V5cy5sZW5ndGggPCBsb2FkSG93TWFueSkge1xuICAgICAgICAgICAgICAgICAgICBsb2FkSG93TWFueSA9IHRtcEVudHJ5S2V5cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKG51bUxvYWRlZCA8IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRtcEVudHJ5S2V5cy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRLZXkgPSB0bXBFbnRyeUtleXNbcmFuZG9tSW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeUtleXMuaW5kZXhPZihzZWxlY3RlZEtleSkgPT09IC0xICYmICghZmJTbmFwc2hvdC52YWwoKVtzZWxlY3RlZEtleV0uaGFzT3duUHJvcGVydHkoXCJhcmNoaXZlZFwiKSB8fCBmYlNuYXBzaG90LnZhbCgpW3NlbGVjdGVkS2V5XS5hcmNoaXZlZCA9PT0gZmFsc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmJTbmFwc2hvdC52YWwoKVtzZWxlY3RlZEtleV0uaGFzT3duUHJvcGVydHkoXCJzY29yZXNcIikgJiYgIWluY2x1ZGVKdWRnZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWZiU25hcHNob3QudmFsKClbc2VsZWN0ZWRLZXldLnNjb3Jlcy5ydWJyaWMuaGFzT3duUHJvcGVydHkoXCJqdWRnZXNXaG9Wb3RlZFwiKSB8fCBmYlNuYXBzaG90LnZhbCgpW3NlbGVjdGVkS2V5XS5zY29yZXMucnVicmljLmp1ZGdlc1dob1ZvdGVkLmluZGV4T2Yoc2VsZi5mZXRjaEZpcmViYXNlQXV0aCgpLnVpZCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5S2V5cy5wdXNoKHNlbGVjdGVkS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtTG9hZGVkKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFscmVhZHlDaGVja2VkLmluZGV4T2Yoc2VsZWN0ZWRLZXkpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJBbHJlYWR5IGp1ZGdlZCBcIiArIHNlbGVjdGVkS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFscmVhZHlDaGVja2VkLnB1c2goc2VsZWN0ZWRLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEhvd01hbnktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlLZXlzLnB1c2goc2VsZWN0ZWRLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bUxvYWRlZCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBjYWxsYmFja1dhaXQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVtTG9hZGVkID09PSBsb2FkSG93TWFueSkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhbGxiYWNrV2FpdCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVudHJ5S2V5cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsb2FkQ29udGVzdEVudHJ5KGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2spXG4gICAgICAgICAqIExvYWRzIGEgY29udGVzdCBlbnRyeSAod2hpY2ggaXMgc3BlY2lmaWVkIHZpYSBwcm92aWRpbmcgYSBjb250ZXN0IGlkIGFuZCBhbiBlbnRyeSBpZCkuXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgdGhpcyBlbnRyeSByZXNpZGVzIHVuZGVyLlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZW50cnlJZDogVGhlIHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGVudHJ5LlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgdGhlIHJlcXVpcmVkIGRhdGEuXG4gICAgICAgICAqIEB0b2RvIChHaWdhYnl0ZSBHaWFudCk6IEFkZCBhdXRoZW50aWNhdGlvbiB0byB0aGlzIGZ1bmN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBsb2FkQ29udGVzdEVudHJ5OiBmdW5jdGlvbihjb250ZXN0SWQsIGVudHJ5SWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdmFsaWQgY2FsbGJhY2sgZnVuY3Rpb24sIGV4aXQgdGhlIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZXMgdG8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0UmVmID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKS5jaGlsZChjb250ZXN0SWQpO1xuICAgICAgICAgICAgbGV0IGVudHJpZXNSZWYgPSBjb250ZXN0UmVmLmNoaWxkKFwiZW50cmllc1wiKS5jaGlsZChlbnRyeUlkKTtcblxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldFBlcm1MZXZlbChmdW5jdGlvbihwZXJtTGV2ZWwpIHtcbiAgICAgICAgICAgICAgICAvLyBBIHZhcmlhYmxlIGNvbnRhaW5pbmcgYSBsaXN0IG9mIGFsbCB0aGUgcHJvcGVydGllcyB0aGF0IHdlIG11c3QgbG9hZCBiZWZvcmUgd2UgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICB2YXIgcmVxdWlyZWRQcm9wcyA9IFtcImlkXCIsIFwibmFtZVwiLCBcInRodW1iXCJdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBlcm1MZXZlbCA+PSA1KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkUHJvcHMucHVzaChcInNjb3Jlc1wiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUaGUgSlNPTiBvYmplY3QgdGhhdCB3ZSdsbCBwYXNzIGludG8gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHsgfTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVxdWlyZWRQcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcFJlZiA9IGVudHJpZXNSZWYuY2hpbGQocmVxdWlyZWRQcm9wc1tpXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcHJvcFJlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtyZXF1aXJlZFByb3BzW2ldXSA9IHNuYXBzaG90LnZhbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IHJlcXVpcmVkUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgc2VsZi5yZXBvcnRFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsb2FkWENvbnRlc3RFbnRyaWVzKGNvbnRlc3RJZCwgY2FsbGJhY2ssIGxvYWRIb3dNYW55KVxuICAgICAgICAgKiBMb2FkcyBcInhcIiBjb250ZXN0IGVudHJpZXMsIGFuZCBwYXNzZXMgdGhlbSBpbnRvIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgd2Ugd2FudCB0byBsb2FkIGVudHJpZXMgZnJvbS5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIHRoZSByZXF1aXJlZCBkYXRhLlxuICAgICAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IGxvYWRIb3dNYW55OiBUaGUgbnVtYmVyIG9mIGVudHJpZXMgdGhhdCB3ZSdkIGxpa2UgdG8gbG9hZC5cbiAgICAgICAgICovXG4gICAgICAgIGxvYWRYQ29udGVzdEVudHJpZXM6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2ssIGxvYWRIb3dNYW55LCBpbmNsdWRlSnVkZ2VkID0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHt9O1xuXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZmV0Y2hDb250ZXN0RW50cmllcyhjb250ZXN0SWQsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZUluZCA9IDA7IGVJbmQgPCByZXNwb25zZS5sZW5ndGg7IGVJbmQrKykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmxvYWRDb250ZXN0RW50cnkoY29udGVzdElkLCByZXNwb25zZVtlSW5kXSwgZnVuY3Rpb24oZW50cnlEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbcmVzcG9uc2VbZUluZF1dID0gZW50cnlEYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IHJlc3BvbnNlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGxvYWRIb3dNYW55LCBpbmNsdWRlSnVkZ2VkKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldERlZmF1bHRSdWJyaWNzKGNhbGxiYWNrKVxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgdGhlIGRlZmF1bHQgcnVicmljc1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0RGVmYXVsdFJ1YnJpY3M6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcbiAgICAgICAgICAgIGxldCBydWJyaWNzQ2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcInJ1YnJpY3NcIik7XG5cbiAgICAgICAgICAgIHJ1YnJpY3NDaGlsZC5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhzbmFwc2hvdC52YWwoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldENvbnRlc3RSdWJyaWNzKGNvbnRlc3RJZCwgY2FsbGJhY2spXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHdlIHdhbnQgdG8gbG9hZCB0aGUgcnVicmljcyBmb3JcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIG9mIHRoZSBydWJyaWNzXG4gICAgICAgICAqL1xuICAgICAgICBnZXRDb250ZXN0UnVicmljczogZnVuY3Rpb24oY29udGVzdElkLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHt9O1xuXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0RGVmYXVsdFJ1YnJpY3MoZnVuY3Rpb24oZGVmYXVsdFJ1YnJpY3MpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGEgPSBkZWZhdWx0UnVicmljcztcbiAgICAgICAgICAgICAgICBzZWxmLmZldGNoQ29udGVzdChjb250ZXN0SWQsIGZ1bmN0aW9uKGNvbnRlc3RSdWJyaWNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXN0b21SdWJyaWNzID0gY29udGVzdFJ1YnJpY3MucnVicmljcztcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VzdG9tUnVicmljcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY3VzdG9tUnVicmljIGluIGN1c3RvbVJ1YnJpY3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNhbGxiYWNrRGF0YS5oYXNPd25Qcm9wZXJ0eShjdXN0b21SdWJyaWMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtjdXN0b21SdWJyaWNdID0gY3VzdG9tUnVicmljc1tjdXN0b21SdWJyaWNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1c3RvbVJ1YnJpY3MuaGFzT3duUHJvcGVydHkoXCJPcmRlclwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG9JbmQgPSAwOyBvSW5kIDwgY3VzdG9tUnVicmljcy5PcmRlci5sZW5ndGg7IG9JbmQrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGN1cnJlbnQgcnVicmljIGl0ZW0gaXMgYWN0dWFsbHkgYSB2YWxpZCBydWJyaWMgaXRlbSwgYW5kIG1ha2Ugc3VyZSBpdCdzIG5vdCB0aGUgXCJPcmRlclwiIGl0ZW0uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXN0b21SdWJyaWNzLmhhc093blByb3BlcnR5KGN1c3RvbVJ1YnJpY3MuT3JkZXJbb0luZF0pICYmIGN1c3RvbVJ1YnJpY3MuT3JkZXJbb0luZF0gIT09IFwiT3JkZXJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRoaXNSdWJyaWMgPSBjdXN0b21SdWJyaWNzLk9yZGVyW29JbmRdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2tEYXRhLk9yZGVyLmluZGV4T2YodGhpc1J1YnJpYykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhLk9yZGVyLnB1c2godGhpc1J1YnJpYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbVJ1YnJpY3MuT3JkZXIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgfSwgW1wicnVicmljc1wiXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGp1ZGdlRW50cnkoY29udGVzdElkLCBlbnRyeUlkLCBzY29yZURhdGEsIGNhbGxiYWNrKVxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSdyZSBqdWRnaW5nIGFuIGVudHJ5IGZvclxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZW50cnlJZDogVGhlIElEIG9mIHRoZSBlbnRyeSB0aGF0IHdlJ3JlIGp1ZGdpbmdcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHNjb3JlRGF0YTogVGhlIHNjb3JpbmcgZGF0YVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBhZnRlciB3ZSd2ZSB2YWxpZGF0ZWQgdGhlIHNjb3JlcywgYW5kIHN1Ym1pdHRlZCB0aGVtLlxuICAgICAgICAgKi9cbiAgICAgICAganVkZ2VFbnRyeTogZnVuY3Rpb24oY29udGVzdElkLCBlbnRyeUlkLCBzY29yZURhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyAwOiBDaGVjayB0aGUgdXNlcnMgcGVybSBsZXZlbCwgaWYgdGhlaXIgcGVybUxldmVsIGlzbid0ID49IDQsIGV4aXQuXG4gICAgICAgICAgICAvLyAxOiBGZXRjaCB0aGUgcnVicmljcyBmb3IgdGhlIGN1cnJlbnQgY29udGVzdCwgdG8gbWFrZSBzdXJlIHdlJ3JlIG5vdCBkb2luZyBhbnl0aGluZyBmdW5reVxuICAgICAgICAgICAgLy8gMjogVmFsaWRhdGUgdGhlIGRhdGEgdGhhdCB3YXMgc3VibWl0dGVkIHRvIHRoZSBmdW5jdGlvblxuICAgICAgICAgICAgLy8gMzogU3VibWl0IHRoZSBkYXRhIHRvIEZpcmViYXNlXG5cbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5nZXRQZXJtTGV2ZWwoZnVuY3Rpb24ocGVybUxldmVsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBlcm1MZXZlbCA+PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0aGlzSnVkZ2UgPSBzZWxmLmZldGNoRmlyZWJhc2VBdXRoKCkudWlkO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0Q29udGVzdFJ1YnJpY3MoY29udGVzdElkLCBmdW5jdGlvbihjb250ZXN0UnVicmljcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWQgPSAoY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWQgPT09IHVuZGVmaW5lZCA/IFtdIDogY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGVzdFJ1YnJpY3MuaGFzT3duUHJvcGVydHkoXCJqdWRnZXNXaG9Wb3RlZFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZC5pbmRleE9mKHRoaXNKdWRnZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKEVSUk9SX01FU1NBR0VTLkVSUl9BTFJFQURZX1ZPVEVEKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGlzSnVkZ2VzVm90ZSA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzY29yZSBpbiBzY29yZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGVzdFJ1YnJpY3MuaGFzT3duUHJvcGVydHkoc2NvcmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzY29yZVZhbCA9IC0xO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY29yZURhdGFbc2NvcmVdID4gY29udGVzdFJ1YnJpY3Nbc2NvcmVdLm1heCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmVWYWwgPSBjb250ZXN0UnVicmljc1tzY29yZV0ubWF4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNjb3JlRGF0YVtzY29yZV0gPCBjb250ZXN0UnVicmljc1tzY29yZV0ubWluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZVZhbCA9IGNvbnRlc3RSdWJyaWNzW3Njb3JlXS5taW47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZVZhbCA9IHNjb3JlRGF0YVtzY29yZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzSnVkZ2VzVm90ZVtzY29yZV0gPSBzY29yZVZhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXNKdWRnZXNWb3RlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5mZXRjaENvbnRlc3RFbnRyeShjb250ZXN0SWQsIGVudHJ5SWQsIGZ1bmN0aW9uKGV4aXN0aW5nU2NvcmVEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdTY29yZURhdGEgPSBleGlzdGluZ1Njb3JlRGF0YS5zY29yZXM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZC5wdXNoKHRoaXNKdWRnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YVRvV3JpdGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGp1ZGdlc1dob1ZvdGVkOiBjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmdTY29yZURhdGEuaGFzT3duUHJvcGVydHkoXCJydWJyaWNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4aXN0aW5nUnVicmljSXRlbVNjb3JlcyA9IGV4aXN0aW5nU2NvcmVEYXRhLnJ1YnJpYztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBydWJyaWNJdGVtcyA9IGNvbnRlc3RSdWJyaWNzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHJ1YnJpY0l0ZW0gaW4gcnVicmljSXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzSnVkZ2VzVm90ZS5oYXNPd25Qcm9wZXJ0eShydWJyaWNJdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlIGl0ZW06IFwiICsgcnVicmljSXRlbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG1wU2NvcmVPYmogPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2ZzogKGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXSA9PT0gdW5kZWZpbmVkID8gMSA6IGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXS5hdmcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3VnaDogKGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXSA9PT0gdW5kZWZpbmVkID8gMSA6IGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXS5yb3VnaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFUb1dyaXRlLmp1ZGdlc1dob1ZvdGVkLmxlbmd0aCAtIDEgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wU2NvcmVPYmoucm91Z2ggPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXBTY29yZU9iai5hdmcgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcFNjb3JlT2JqLnJvdWdoID0gdG1wU2NvcmVPYmoucm91Z2ggKyB0aGlzSnVkZ2VzVm90ZVtydWJyaWNJdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXBTY29yZU9iai5hdmcgPSB0bXBTY29yZU9iai5yb3VnaCAvIChjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZC5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVRvV3JpdGVbcnVicmljSXRlbV0gPSB0bXBTY29yZU9iajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGFUb1dyaXRlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmYlJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNoaWxkKFwiZW50cmllc1wiKS5jaGlsZChlbnRyeUlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2hpbGQoXCJzY29yZXNcIikuY2hpbGQoXCJydWJyaWNcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYlJlZi5zZXQoZGF0YVRvV3JpdGUsIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yZXBvcnRFcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1wic2NvcmVzXCJdKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soRVJST1JfTUVTU0FHRVMuRVJSX05PVF9KVURHRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcbiIsInZhciBDSlMgPSByZXF1aXJlKFwiLi4vYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzXCIpO1xudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vZ2VuZXJhbFB1cnBvc2UuanNcIik7XG5cbnZhciBzZXR1cExlYWRlcmJvYXJkID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuXG4gICAgdmFyIGxlYWRlcmJvYXJkQ29sdW1ucyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZGF0YTogXCJFbnRyeSBJRFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGRhdGE6IFwiRW50cnkgTmFtZVwiXG4gICAgICAgIH1cbiAgICBdO1xuXG4gICAgaWYgKGRhdGEucnVicmljcy5oYXNPd25Qcm9wZXJ0eShcIk9yZGVyXCIpKSB7XG4gICAgICAgIGZvciAobGV0IHJJbmQgPSAwOyBySW5kIDwgZGF0YS5ydWJyaWNzLk9yZGVyLmxlbmd0aDsgckluZCsrKSB7XG4gICAgICAgICAgICBsZWFkZXJib2FyZENvbHVtbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YS5ydWJyaWNzLk9yZGVyW3JJbmRdLnJlcGxhY2UoL1xcXy9nLCBcIiBcIilcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGVhZGVyYm9hcmRDb2x1bW5zLnB1c2goe1xuICAgICAgICBkYXRhOiBcIlRvdGFsIFNjb3JlXCJcbiAgICB9KTtcblxuICAgIGxldCB0YWJsZUhlYWRlciA9ICQoXCIjbGVhZGVyYm9hcmQgdGhlYWQgdHJcIik7XG5cbiAgICBmb3IgKGxldCBjb2xJbmQgPSAwOyBjb2xJbmQgPCBsZWFkZXJib2FyZENvbHVtbnMubGVuZ3RoOyBjb2xJbmQrKykge1xuICAgICAgICB0YWJsZUhlYWRlci5hcHBlbmQoXG4gICAgICAgICAgICAkKFwiPHRkPlwiKS50ZXh0KGxlYWRlcmJvYXJkQ29sdW1uc1tjb2xJbmRdLmRhdGEpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2cobGVhZGVyYm9hcmRDb2x1bW5zKTtcblxuICAgIHZhciBsZWFkZXJib2FyZFJvd3MgPSBbXTtcblxuICAgIGZvciAobGV0IGVudHJ5IGluIGRhdGEuZW50cmllcykge1xuICAgICAgICBjb25zb2xlLmxvZyhkYXRhLmVudHJpZXNbZW50cnldKTtcblxuICAgICAgICB2YXIgcm93T2JqID0ge1xuICAgICAgICAgICAgXCJFbnRyeSBJRFwiOiBkYXRhLmVudHJpZXNbZW50cnldLmlkLFxuICAgICAgICAgICAgXCJFbnRyeSBOYW1lXCI6IFwiPGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cua2hhbmFjYWRlbXkub3JnL2NvbXB1dGVyLXByb2dyYW1taW5nL2NvbnRlc3QtZW50cnkvXCIgKyBkYXRhLmVudHJpZXNbZW50cnldLmlkICsgXCJcXFwiPlwiICsgZGF0YS5lbnRyaWVzW2VudHJ5XS5uYW1lICsgXCI8L2E+XCJcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgdG90YWxTY29yZSA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgb0luZCA9IDA7IG9JbmQgPCBkYXRhLnJ1YnJpY3MuT3JkZXIubGVuZ3RoOyBvSW5kKyspIHtcbiAgICAgICAgICAgIGxldCBjdXJyUnVicmljID0gZGF0YS5ydWJyaWNzLk9yZGVyW29JbmRdO1xuICAgICAgICAgICAgbGV0IHNjb3JlID0gZGF0YS5lbnRyaWVzW2VudHJ5XS5zY29yZXMucnVicmljLmhhc093blByb3BlcnR5KGN1cnJSdWJyaWMpID8gZGF0YS5lbnRyaWVzW2VudHJ5XS5zY29yZXMucnVicmljW2N1cnJSdWJyaWNdLmF2ZyA6IGRhdGEucnVicmljc1tjdXJyUnVicmljXS5taW47XG5cbiAgICAgICAgICAgIHRvdGFsU2NvcmUgKz0gc2NvcmU7XG5cbiAgICAgICAgICAgIGlmIChkYXRhLnJ1YnJpY3NbY3VyclJ1YnJpY10uaGFzT3duUHJvcGVydHkoXCJrZXlzXCIpKSB7XG4gICAgICAgICAgICAgICAgcm93T2JqW2N1cnJSdWJyaWMucmVwbGFjZSgvXFxfL2csIFwiIFwiKV0gPSBcIihcIiArIHNjb3JlICsgXCIpIFwiICsgZGF0YS5ydWJyaWNzW2N1cnJSdWJyaWNdLmtleXNbc2NvcmVdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByb3dPYmpbY3VyclJ1YnJpYy5yZXBsYWNlKC9cXF8vZywgXCIgXCIpXSA9IHNjb3JlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcm93T2JqW1wiVG90YWwgU2NvcmVcIl0gPSB0b3RhbFNjb3JlO1xuICAgICAgICBsZWFkZXJib2FyZFJvd3MucHVzaChyb3dPYmopO1xuICAgIH1cblxuICAgIHZhciBsZWFkZXJib2FyZE9iaiA9ICQoXCIjbGVhZGVyYm9hcmRcIikuRGF0YVRhYmxlKHtcbiAgICAgICAgY29sdW1uczogbGVhZGVyYm9hcmRDb2x1bW5zLFxuICAgICAgICBkYXRhOiBsZWFkZXJib2FyZFJvd3NcbiAgICB9KTtcblxuICAgICQoXCJbbmFtZT1sZWFkZXJib2FyZF9sZW5ndGhdXCIpLmFkZENsYXNzKFwiYnJvd3Nlci1kZWZhdWx0XCIpLmFwcGVuZChcbiAgICAgICAgJChcIjxvcHRpb24+XCIpLmF0dHIoXCJ2YWx1ZVwiLCBcIjUwMDAwMFwiKS50ZXh0KFwiQW4gdWJlci1lcGljIGFtb3VudFwiKVxuICAgICk7XG59O1xuXG52YXIgc2hvd1BhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdXJsUGFyYW1zID0gaGVscGVycy5nZXRVcmxQYXJhbXMod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgaWYgKENKUy5mZXRjaEZpcmViYXNlQXV0aCgpID09PSBudWxsKSB7XG4gICAgICAgICQoXCIjYXV0aEJ0blwiKS50ZXh0KFwiSGVsbG8sIGd1ZXN0ISBDbGljayBtZSB0byBsb2dpbi5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJChcIiNhdXRoQnRuXCIpLnRleHQoYFdlbGNvbWUsICR7Q0pTLmZldGNoRmlyZWJhc2VBdXRoKCkuZ29vZ2xlLmRpc3BsYXlOYW1lfSEgKE5vdCB5b3U/IENsaWNrIGhlcmUpYCk7XG4gICAgfVxuXG4gICAgdmFyIGNvbnRlc3RJZCA9IG51bGw7XG5cbiAgICBpZiAodXJsUGFyYW1zLmhhc093blByb3BlcnR5KFwiY29udGVzdFwiKSkge1xuICAgICAgICBjb250ZXN0SWQgPSB1cmxQYXJhbXMuY29udGVzdC5yZXBsYWNlKC9cXCMvZywgXCJcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnQoXCJDb250ZXN0IElEIG5vdCBzcGVjaWZpZWQuIFJldHVybmluZyB0byBob21lcGFnZS5cIik7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCJpbmRleC5odG1sXCI7XG4gICAgfVxuXG4gICAgQ0pTLmdldENvbnRlc3RSdWJyaWNzKGNvbnRlc3RJZCwgZnVuY3Rpb24ocnVicmljcykge1xuICAgICAgICBDSlMuZmV0Y2hDb250ZXN0KGNvbnRlc3RJZCwgZnVuY3Rpb24oY29udGVzdERhdGEpIHtcbiAgICAgICAgICAgIGNvbnRlc3REYXRhLnJ1YnJpY3MgPSBydWJyaWNzO1xuXG4gICAgICAgICAgICBzZXR1cExlYWRlcmJvYXJkKGNvbnRlc3REYXRhKTtcbiAgICAgICAgfSwgW1wiaWRcIiwgXCJuYW1lXCIsIFwiZGVzY1wiLCBcImltZ1wiLCBcImVudHJpZXNcIl0pO1xuICAgIH0pO1xufTtcblxuQ0pTLmdldFBlcm1MZXZlbChmdW5jdGlvbihwZXJtTGV2ZWwpIHtcbiAgICBpZiAocGVybUxldmVsID49IDUpIHtcbiAgICAgICAgc2hvd1BhZ2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhbGVydChcIllvdSBkbyBub3QgaGF2ZSB0aGUgcmVxdWlyZWQgcGVybWlzc2lvbnMgdG8gdmlldyB0aGlzIHBhZ2UuIFJldHVybmluZyB0byBob21lcGFnZS5cIik7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCJpbmRleC5odG1sXCI7XG4gICAgfVxufSk7XG5cbiQoXCIjYXV0aEJ0blwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2dCkge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgaWYgKENKUy5mZXRjaEZpcmViYXNlQXV0aCgpID09PSBudWxsKSB7XG4gICAgICAgIENKUy5hdXRoZW50aWNhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBDSlMuYXV0aGVudGljYXRlKHRydWUpO1xuICAgIH1cbn0pOyIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXRDb29raWUoY29va2llTmFtZSlcbiAgICAgICAgICogRmV0Y2hlcyB0aGUgc3BlY2lmaWVkIGNvb2tpZSBmcm9tIHRoZSBicm93c2VyLCBhbmQgcmV0dXJucyBpdCdzIHZhbHVlLlxuICAgICAgICAgKiBAYXV0aG9yIHczc2Nob29sc1xuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29va2llTmFtZTogVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0aGF0IHdlIHdhbnQgdG8gZmV0Y2guXG4gICAgICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IGNvb2tpZVZhbHVlOiBUaGUgdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBjb29raWUsIG9yIGFuIGVtcHR5IHN0cmluZywgaWYgdGhlcmUgaXMgbm8gXCJub24tZmFsc3lcIiB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIGdldENvb2tpZTogZnVuY3Rpb24oY29va2llTmFtZSkge1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBjb29raWUgd2l0aCBuYW1lIGNvb2tpZSAocmV0dXJuIFwiXCIgaWYgbm9uLWV4aXN0ZW50KVxuICAgICAgICAgICAgY29va2llTmFtZSA9IGNvb2tpZU5hbWUgKyBcIj1cIjtcbiAgICAgICAgICAgIC8vIENoZWNrIGFsbCBvZiB0aGUgY29va2llcyBhbmQgdHJ5IHRvIGZpbmQgdGhlIG9uZSBjb250YWluaW5nIG5hbWUuXG4gICAgICAgICAgICB2YXIgY29va2llTGlzdCA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdChcIjtcIik7XG4gICAgICAgICAgICBmb3IgKHZhciBjSW5kID0gMDsgY0luZCA8IGNvb2tpZUxpc3QubGVuZ3RoOyBjSW5kICsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1ckNvb2tpZSA9IGNvb2tpZUxpc3RbY0luZF07XG4gICAgICAgICAgICAgICAgd2hpbGUgKGN1ckNvb2tpZVswXSA9PT0gXCIgXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VyQ29va2llID0gY3VyQ29va2llLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UndmUgZm91bmQgdGhlIHJpZ2h0IGNvb2tpZSwgcmV0dXJuIGl0cyB2YWx1ZS5cbiAgICAgICAgICAgICAgICBpZiAoY3VyQ29va2llLmluZGV4T2YoY29va2llTmFtZSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1ckNvb2tpZS5zdWJzdHJpbmcoY29va2llTmFtZS5sZW5ndGgsIGN1ckNvb2tpZS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgaWYgdGhlIGNvb2tpZSBkb2Vzbid0IGV4aXN0LCByZXR1cm4gXCJcIlxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBzZXRDb29raWUoY29va2llTmFtZSwgdmFsdWUpXG4gICAgICAgICAqIENyZWF0ZXMvdXBkYXRlcyBhIGNvb2tpZSB3aXRoIHRoZSBkZXNpcmVkIG5hbWUsIHNldHRpbmcgaXQncyB2YWx1ZSB0byBcInZhbHVlXCIuXG4gICAgICAgICAqIEBhdXRob3IgdzNzY2hvb2xzXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb29raWVOYW1lOiBUaGUgbmFtZSBvZiB0aGUgY29va2llIHRoYXQgd2Ugd2FudCB0byBjcmVhdGUvdXBkYXRlLlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWU6IFRoZSB2YWx1ZSB0byBhc3NpZ24gdG8gdGhlIGNvb2tpZS5cbiAgICAgICAgICovXG4gICAgICAgIHNldENvb2tpZTogZnVuY3Rpb24oY29va2llTmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIFNldCBhIGNvb2tpZSB3aXRoIG5hbWUgY29va2llIGFuZCB2YWx1ZSBjb29raWUgdGhhdCB3aWxsIGV4cGlyZSAzMCBkYXlzIGZyb20gbm93LlxuICAgICAgICAgICAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgKDMwICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuICAgICAgICAgICAgdmFyIGV4cGlyZXMgPSBcImV4cGlyZXM9XCIgKyBkLnRvVVRDU3RyaW5nKCk7XG4gICAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWVOYW1lICsgXCI9XCIgKyB2YWx1ZSArIFwiOyBcIiArIGV4cGlyZXM7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXRVcmxQYXJhbXMoKVxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsOiBUaGUgVVJMIHRvIGZldGNoIFVSTCBwYXJhbWV0ZXJzIGZyb21cbiAgICAgICAgICovXG4gICAgICAgIGdldFVybFBhcmFtczogZnVuY3Rpb24odXJsKSB7XG4gICAgICAgICAgICB2YXIgdXJsUGFyYW1zID0ge307XG5cbiAgICAgICAgICAgIHZhciBzcGxpdFVybCA9IHVybC5zcGxpdChcIj9cIilbMV07XG5cbiAgICAgICAgICAgIGlmIChzcGxpdFVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRtcFVybFBhcmFtcyA9IHNwbGl0VXJsLnNwbGl0KFwiJlwiKTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IHVwSW5kID0gMDsgdXBJbmQgPCB0bXBVcmxQYXJhbXMubGVuZ3RoOyB1cEluZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyUGFyYW1TdHIgPSB0bXBVcmxQYXJhbXNbdXBJbmRdO1xuXG4gICAgICAgICAgICAgICAgICAgIHVybFBhcmFtc1tjdXJyUGFyYW1TdHIuc3BsaXQoXCI9XCIpWzBdXSA9IGN1cnJQYXJhbVN0ci5zcGxpdChcIj1cIilbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCNcXCEvZywgXCJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdXJsUGFyYW1zO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG4iXX0=
