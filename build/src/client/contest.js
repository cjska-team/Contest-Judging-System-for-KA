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

var urlParams = helpers.general.getUrlParams(window.location.href);

var numEntriesToLoad = 32;

var contestId = null;

if (urlParams.hasOwnProperty("contest")) {
    contestId = urlParams.contest;
} else {
    alert("Please specify a Contest ID!");
    window.history.back();
}

if (urlParams.hasOwnProperty("count")) {
    numEntriesToLoad = parseInt(urlParams.count, 10);
}

var createEntry = function createEntry(entry) {
    return $("<div>").attr("id", entry.id).append($("<a>").attr("href", "entry.html?contest=" + contestId + "&entry=" + entry.id).append($("<img>").attr("src", "https://www.khanacademy.org/" + entry.thumb).addClass("img-responsive entry-img")).append($("<p>").text(entry.name).addClass("entry-title center-align")).addClass("col s12 m3 l3 center-align contest-entry"));
};

var setupPage = function setupPage() {
    CJS.loadXContestEntries(contestId, function (response) {
        console.log(response);
        var numEntries = 0;
        var $entriesRow = $("<div>").addClass("row");
        $("#entries").append($entriesRow);

        for (var entryId in response) {
            numEntries += 1;
            var thisEntry = response[entryId];

            $entriesRow.append(createEntry(thisEntry));

            if (numEntries % 4 === 0) {
                $entriesRow = $("<div>").addClass("row");
                $("#entries").append($entriesRow);
            }
        }
    }, numEntriesToLoad, true);

    CJS.fetchContest(contestId, function (data) {
        $(".contest-name").text("Entries for " + data.name);
    }, ["name"]);
};

$(document).ready(function () {
    helpers.authentication.setupPageAuth("#authBtn", CJS);
    setupPage();
});

$("#next-unjudged").on("click", function (evt) {
    evt.preventDefault();

    CJS.fetchContestEntries(urlParams.contest, function (nextEntry) {
        if (nextEntry[0] !== undefined) {
            window.location.href = "entry.html?contest=" + urlParams.contest + "&entry=" + nextEntry[0];
        } else {
            alert("We couldn't find an un-judged entry, sorry!");
        }
    }, 1, false);
});

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2NsaWVudC9jb250ZXN0LmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2hlbHBlcnMvYXV0aGVudGljYXRpb24uanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvaGVscGVycy9nZW5lcmFsLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2hlbHBlcnMvaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLFlBQVc7QUFDekIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO0FBQ3BDLGVBQU87S0FDVjs7O0FBR0QsUUFBSSxZQUFZLEdBQUcsNENBQTRDLENBQUM7OztBQUdoRSxRQUFJLHVCQUF1QixHQUFHLEVBQUUsQ0FBQzs7O0FBR2pDLFFBQUksY0FBYyxHQUFHO0FBQ2pCLHFCQUFhLEVBQUUsNkRBQTZEO0FBQzVFLHlCQUFpQixFQUFFLDBDQUEwQztLQUNoRSxDQUFDOztBQUVGLFdBQU87QUFDSCxtQkFBVyxFQUFFLHFCQUFTLEtBQUssRUFBRTtBQUN6QixtQkFBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN4QjtBQUNELHlCQUFpQixFQUFFLDZCQUFXO0FBQzFC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TUQsZ0JBQVksRUFBRSxzQkFBUyxHQUFHLEVBQUU7QUFDeEIsWUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDOztBQUVuQixZQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVqQyxZQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7QUFDeEIsZ0JBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRXZDLGlCQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUN0RCxvQkFBSSxZQUFZLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV2Qyx5QkFBUyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUM3RCxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQzdCO1NBQ0o7O0FBRUQsZUFBTyxTQUFTLENBQUM7S0FDcEI7Q0FDSixDQUFDOzs7OztBQy9ERixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2Isa0JBQWMsRUFBRSxPQUFPLENBQUMscUJBQXFCLENBQUM7QUFDOUMsV0FBTyxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUM7Q0FDbkMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgICBpZiAoIXdpbmRvdy5qUXVlcnkgfHwgIXdpbmRvdy5GaXJlYmFzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVGhlIGZvbGxvd2luZyB2YXJpYWJsZSBpcyB1c2VkIHRvIHN0b3JlIG91ciBcIkZpcmViYXNlIEtleVwiXG4gICAgbGV0IEZJUkVCQVNFX0tFWSA9IFwiaHR0cHM6Ly9jb250ZXN0LWp1ZGdpbmctc3lzLmZpcmViYXNlaW8uY29tXCI7XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIHZhcmlhYmxlIGlzIHVzZWQgdG8gc3BlY2lmeSB0aGUgZGVmYXVsdCBudW1iZXIgb2YgZW50cmllcyB0byBmZXRjaFxuICAgIGxldCBERUZfTlVNX0VOVFJJRVNfVE9fTE9BRCA9IDEwO1xuXG4gICAgLy8gRXJyb3IgbWVzc2FnZXMuXG4gICAgbGV0IEVSUk9SX01FU1NBR0VTID0ge1xuICAgICAgICBFUlJfTk9UX0pVREdFOiBcIkVycm9yOiBZb3UgZG8gbm90IGhhdmUgcGVybWlzc2lvbiB0byBqdWRnZSBjb250ZXN0IGVudHJpZXMuXCIsXG4gICAgICAgIEVSUl9BTFJFQURZX1ZPVEVEOiBcIkVycm9yOiBZb3UndmUgYWxyZWFkeSBqdWRnZWQgdGhpcyBlbnRyeS5cIlxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXBvcnRFcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgICBmZXRjaEZpcmViYXNlQXV0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSkuZ2V0QXV0aCgpO1xuICAgICAgICB9LFxuICAgICAgICBvbmNlQXV0aGVkOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSkub25BdXRoKGNhbGxiYWNrLCB0aGlzLnJlcG9ydEVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGF1dGhlbnRpY2F0ZShsb2dvdXQpXG4gICAgICAgICAqIElmIGxvZ291dCBpcyBmYWxzZSAob3IgdW5kZWZpbmVkKSwgd2UgcmVkaXJlY3QgdG8gYSBnb29nbGUgbG9naW4gcGFnZS5cbiAgICAgICAgICogSWYgbG9nb3V0IGlzIHRydWUsIHdlIGludm9rZSBGaXJlYmFzZSdzIHVuYXV0aCBtZXRob2QgKHRvIGxvZyB0aGUgdXNlciBvdXQpLCBhbmQgcmVsb2FkIHRoZSBwYWdlLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGxvZ291dCo6IFNob3VsZCB3ZSBsb2cgdGhlIHVzZXIgb3V0PyAoRGVmYXVsdHMgdG8gZmFsc2UpXG4gICAgICAgICAqL1xuICAgICAgICBhdXRoZW50aWNhdGU6IGZ1bmN0aW9uKGxvZ291dCA9IGZhbHNlKSB7XG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgaWYgKCFsb2dvdXQpIHtcbiAgICAgICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICBmaXJlYmFzZVJlZi5hdXRoV2l0aE9BdXRoUG9wdXAoXCJnb29nbGVcIiwgZnVuY3Rpb24oZXJyLCBhdXRoRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmYlVzZXJzUmVmID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJ1c2Vyc1wiKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZmJVc2Vyc1JlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24odXNlcnNTbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdXNlcnNTbmFwc2hvdC5oYXNDaGlsZChhdXRoRGF0YS51aWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZiVXNlcnNSZWYuY2hpbGQoYXV0aERhdGEudWlkKS5zZXQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYXV0aERhdGEuZ29vZ2xlLmRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVybUxldmVsOiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHNlbGYucmVwb3J0RXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQWRkZWQgbmV3IHVzZXIgdG8gRmlyZWJhc2UhIFdlbGNvbWUgdG8gQ0pTS0EgXFxcIlwiICsgYXV0aERhdGEuZ29vZ2xlLmRpc3BsYXlOYW1lICsgXCJcXFwiIVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVJlZi51bmF1dGgoKTtcblxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldFBlcm1MZXZlbCgpXG4gICAgICAgICAqIEdldHMgdGhlIHBlcm0gbGV2ZWwgb2YgdGhlIHVzZXIgdGhhdCBpcyBjdXJyZW50bHkgbG9nZ2VkIGluLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIHJlY2lldmVkIHRoZSBkYXRhLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0UGVybUxldmVsOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgbGV0IGF1dGhEYXRhID0gdGhpcy5mZXRjaEZpcmViYXNlQXV0aCgpO1xuXG4gICAgICAgICAgICBpZiAoYXV0aERhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcbiAgICAgICAgICAgICAgICBsZXQgdGhpc1VzZXJDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwidXNlcnNcIikuY2hpbGQoYXV0aERhdGEudWlkKTtcblxuICAgICAgICAgICAgICAgIHRoaXNVc2VyQ2hpbGQub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzbmFwc2hvdC52YWwoKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc25hcHNob3QudmFsKCkucGVybUxldmVsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0RW50cnkoY29udGVzdElkLCBlbnRyeUlkLCBjYWxsYmFjaywgcHJvcGVydGllcylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgdGhlIGVudHJ5IHdlIHdhbnQgdG8gbG9hZCBkYXRhIGZvciByZXNpZGVzIHVuZGVyXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBlbnRyeUlkOiBUaGUgSUQgb2YgdGhlIGNvbnRlc3QgZW50cnkgdGhhdCB3ZSB3YW50IHRvIGxvYWQgZGF0YSBmb3JcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIG9mIHRoZSByZXF1aXJlZCBkYXRhXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IHByb3BlcnRpZXMqOiBBIGxpc3Qgb2YgYWxsIHRoZSBwcm9wZXJ0aWVzIHRoYXQgeW91IHdhbnQgdG8gbG9hZCBmcm9tIHRoaXMgY29udGVzdCBlbnRyeVxuICAgICAgICAgKi9cbiAgICAgICAgZmV0Y2hDb250ZXN0RW50cnk6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2ssIHByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IGNvbnRlc3RDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKTtcbiAgICAgICAgICAgIGxldCBlbnRyeUNoaWxkID0gY29udGVzdENoaWxkLmNoaWxkKFwiZW50cmllc1wiKS5jaGlsZChlbnRyeUlkKTtcblxuICAgICAgICAgICAgbGV0IHJlcXVpcmVkUHJvcHMgPSAocHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gW1wiaWRcIiwgXCJuYW1lXCIsIFwidGh1bWJcIl0gOiBwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHt9O1xuXG4gICAgICAgICAgICBmb3IgKGxldCBwcm9wSW5kID0gMDsgcHJvcEluZCA8IHJlcXVpcmVkUHJvcHMubGVuZ3RoOyBwcm9wSW5kKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgY3VyclByb3AgPSByZXF1aXJlZFByb3BzW3Byb3BJbmRdO1xuXG4gICAgICAgICAgICAgICAgZW50cnlDaGlsZC5jaGlsZChjdXJyUHJvcCkub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtjdXJyUHJvcF0gPSBzbmFwc2hvdC52YWwoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IHJlcXVpcmVkUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmZXRjaENvbnRlc3QoY29udGVzdElkLCBjYWxsYmFjaywgcHJvcGVydGllcylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgeW91IHdhbnQgdG8gbG9hZCBkYXRhIGZvclxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIHJlY2VpdmVkIHRoZSBkYXRhLlxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBwcm9wZXJ0aWVzKjogQSBsaXN0IG9mIGFsbCB0aGUgcHJvcGVydGllcyB0aGF0IHlvdSB3YW50IHRvIGxvYWQgZnJvbSB0aGlzIGNvbnRlc3QuXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3Q6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2ssIHByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IGNvbnRlc3RDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKTtcblxuICAgICAgICAgICAgLy8gUHJvcGVydGllcyB0aGF0IHdlIG11c3QgaGF2ZSBiZWZvcmUgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIGxldCByZXF1aXJlZFByb3BzID0gKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IFtcImlkXCIsIFwibmFtZVwiLCBcImRlc2NcIiwgXCJpbWdcIiwgXCJlbnRyeUNvdW50XCJdIDogcHJvcGVydGllcyk7XG5cbiAgICAgICAgICAgIC8vIFRoZSBvYmplY3QgdGhhdCB3ZSBwYXNzIGludG8gb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0ge307XG5cbiAgICAgICAgICAgIGZvciAobGV0IHByb3BJbmQgPSAwOyBwcm9wSW5kIDwgcmVxdWlyZWRQcm9wcy5sZW5ndGg7IHByb3BJbmQrKykge1xuICAgICAgICAgICAgICAgIGxldCBjdXJyUHJvcCA9IHJlcXVpcmVkUHJvcHNbcHJvcEluZF07XG5cbiAgICAgICAgICAgICAgICBjb250ZXN0Q2hpbGQuY2hpbGQoY3VyclByb3ApLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbY3VyclByb3BdID0gc25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0cyhjYWxsYmFjaylcbiAgICAgICAgICogRmV0Y2hlcyBhbGwgY29udGVzdHMgdGhhdCdyZSBiZWluZyBzdG9yZWQgaW4gRmlyZWJhc2UsIGFuZCBwYXNzZXMgdGhlbSBpbnRvIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgY2FwdHVyZWQgYWxsIHRoZSBkYXRhIHRoYXQgd2UgbmVlZC5cbiAgICAgICAgICogQHRvZG8gKEdpZ2FieXRlIEdpYW50KTogQWRkIGJldHRlciBjb21tZW50cyFcbiAgICAgICAgICovXG4gICAgICAgIGZldGNoQ29udGVzdHM6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0S2V5c0NoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0S2V5c1wiKTtcbiAgICAgICAgICAgIGxldCBjb250ZXN0c0NoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKTtcblxuICAgICAgICAgICAgLy8gUHJvcGVydGllcyB0aGF0IHdlIG11c3QgaGF2ZSBiZWZvcmUgd2UgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIGxldCByZXF1aXJlZFByb3BzID0gW1xuICAgICAgICAgICAgICAgIFwiaWRcIixcbiAgICAgICAgICAgICAgICBcIm5hbWVcIixcbiAgICAgICAgICAgICAgICBcImRlc2NcIixcbiAgICAgICAgICAgICAgICBcImltZ1wiLFxuICAgICAgICAgICAgICAgIFwiZW50cnlDb3VudFwiXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAvLyBrZXlzV2VGb3VuZCBob2xkcyBhIGxpc3Qgb2YgYWxsIG9mIHRoZSBjb250ZXN0IGtleXMgdGhhdCB3ZSd2ZSBmb3VuZCBzbyBmYXJcbiAgICAgICAgICAgIHZhciBrZXlzV2VGb3VuZCA9IFsgXTtcblxuICAgICAgICAgICAgLy8gY2FsbGJhY2tEYXRhIGlzIHRoZSBvYmplY3QgdGhhdCBnZXRzIHBhc3NlZCBpbnRvIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHsgfTtcblxuICAgICAgICAgICAgLy8gXCJRdWVyeVwiIG91ciBjb250ZXN0S2V5c0NoaWxkXG4gICAgICAgICAgICBjb250ZXN0S2V5c0NoaWxkLm9yZGVyQnlLZXkoKS5vbihcImNoaWxkX2FkZGVkXCIsIGZ1bmN0aW9uKGZiSXRlbSkge1xuICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgY3VycmVudCBrZXkgdG8gb3VyIFwia2V5c1dlRm91bmRcIiBhcnJheVxuICAgICAgICAgICAgICAgIGtleXNXZUZvdW5kLnB1c2goZmJJdGVtLmtleSgpKTtcblxuICAgICAgICAgICAgICAgIGxldCB0aGlzQ29udGVzdCA9IGNvbnRlc3RzQ2hpbGQuY2hpbGQoZmJJdGVtLmtleSgpKTtcblxuICAgICAgICAgICAgICAgIHZhciB0aGlzQ29udGVzdERhdGEgPSB7IH07XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwcm9wSW5kID0gMDsgcHJvcEluZCA8IHJlcXVpcmVkUHJvcHMubGVuZ3RoOyBwcm9wSW5kKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJQcm9wZXJ0eSA9IHJlcXVpcmVkUHJvcHNbcHJvcEluZF07XG4gICAgICAgICAgICAgICAgICAgIHRoaXNDb250ZXN0LmNoaWxkKGN1cnJQcm9wZXJ0eSkub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKGZiU25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNDb250ZXN0RGF0YVtjdXJyUHJvcGVydHldID0gZmJTbmFwc2hvdC52YWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyAoR2lnYWJ5dGUgR2lhbnQpOiBHZXQgcmlkIG9mIGFsbCB0aGlzIG5lc3RlZCBcImNyYXBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXNDb250ZXN0RGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtmYkl0ZW0ua2V5KCldID0gdGhpc0NvbnRlc3REYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSBrZXlzV2VGb3VuZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0RW50cmllcyhjb250ZXN0SWQsIGNhbGxiYWNrKVxuICAgICAgICAgKlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgS2hhbiBBY2FkZW15IHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSB3YW50IHRvIGZldGNoIGVudHJpZXMgZm9yLlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBhZnRlciB3ZSd2ZSBmZXRjaGVkIGFsbCB0aGUgZGF0YSB0aGF0IHdlIG5lZWQuXG4gICAgICAgICAqIEBwYXJhbSB7SW50ZWdlcn0gbG9hZEhvd01hbnkqOiBUaGUgbnVtYmVyIG9mIGVudHJpZXMgdG8gbG9hZC4gSWYgbm8gdmFsdWUgaXMgcGFzc2VkIHRvIHRoaXMgcGFyYW1ldGVyLFxuICAgICAgICAgKiAgZmFsbGJhY2sgb250byBhIGRlZmF1bHQgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3RFbnRyaWVzOiBmdW5jdGlvbihjb250ZXN0SWQsIGNhbGxiYWNrLCBsb2FkSG93TWFueSA9IERFRl9OVU1fRU5UUklFU19UT19MT0FELCBpbmNsdWRlSnVkZ2VkID0gdHJ1ZSkge1xuICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIHZhbGlkIGNhbGxiYWNrIGZ1bmN0aW9uLCBleGl0IHRoZSBmdW5jdGlvbi5cbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBSZWZlcmVuY2VzIHRvIEZpcmViYXNlIGNoaWxkcmVuXG4gICAgICAgICAgICBsZXQgdGhpc0NvbnRlc3RSZWYgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZCk7XG4gICAgICAgICAgICBsZXQgY29udGVzdEVudHJpZXNSZWYgPSB0aGlzQ29udGVzdFJlZi5jaGlsZChcImVudHJpZXNcIik7XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueSBlbnRyaWVzIHdlJ3ZlIGxvYWRlZFxuICAgICAgICAgICAgdmFyIG51bUxvYWRlZCA9IDA7XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gc3RvcmUgZWFjaCBvZiB0aGUgZW50cmllcyB0aGF0IHdlJ3ZlIGxvYWRlZFxuICAgICAgICAgICAgdmFyIGVudHJ5S2V5cyA9IFsgXTtcblxuICAgICAgICAgICAgdmFyIGFscmVhZHlDaGVja2VkID0gW107XG5cbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgY29udGVzdEVudHJpZXNSZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKGZiU25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICBsZXQgdG1wRW50cnlLZXlzID0gT2JqZWN0LmtleXMoZmJTbmFwc2hvdC52YWwoKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodG1wRW50cnlLZXlzLmxlbmd0aCA8IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIb3dNYW55ID0gdG1wRW50cnlLZXlzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAobnVtTG9hZGVkIDwgbG9hZEhvd01hbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdG1wRW50cnlLZXlzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEtleSA9IHRtcEVudHJ5S2V5c1tyYW5kb21JbmRleF07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJ5S2V5cy5pbmRleE9mKHNlbGVjdGVkS2V5KSA9PT0gLTEgJiYgKCFmYlNuYXBzaG90LnZhbCgpW3NlbGVjdGVkS2V5XS5oYXNPd25Qcm9wZXJ0eShcImFyY2hpdmVkXCIpIHx8IGZiU25hcHNob3QudmFsKClbc2VsZWN0ZWRLZXldLmFyY2hpdmVkID09PSBmYWxzZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmYlNuYXBzaG90LnZhbCgpW3NlbGVjdGVkS2V5XS5oYXNPd25Qcm9wZXJ0eShcInNjb3Jlc1wiKSAmJiAhaW5jbHVkZUp1ZGdlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZmJTbmFwc2hvdC52YWwoKVtzZWxlY3RlZEtleV0uc2NvcmVzLnJ1YnJpYy5oYXNPd25Qcm9wZXJ0eShcImp1ZGdlc1dob1ZvdGVkXCIpIHx8IGZiU25hcHNob3QudmFsKClbc2VsZWN0ZWRLZXldLnNjb3Jlcy5ydWJyaWMuanVkZ2VzV2hvVm90ZWQuaW5kZXhPZihzZWxmLmZldGNoRmlyZWJhc2VBdXRoKCkudWlkKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlLZXlzLnB1c2goc2VsZWN0ZWRLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1Mb2FkZWQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxyZWFkeUNoZWNrZWQuaW5kZXhPZihzZWxlY3RlZEtleSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFscmVhZHkganVkZ2VkIFwiICsgc2VsZWN0ZWRLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxyZWFkeUNoZWNrZWQucHVzaChzZWxlY3RlZEtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkSG93TWFueS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeUtleXMucHVzaChzZWxlY3RlZEtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtTG9hZGVkKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IGNhbGxiYWNrV2FpdCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChudW1Mb2FkZWQgPT09IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoY2FsbGJhY2tXYWl0KTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZW50cnlLZXlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGxvYWRDb250ZXN0RW50cnkoY29udGVzdElkLCBlbnRyeUlkLCBjYWxsYmFjaylcbiAgICAgICAgICogTG9hZHMgYSBjb250ZXN0IGVudHJ5ICh3aGljaCBpcyBzcGVjaWZpZWQgdmlhIHByb3ZpZGluZyBhIGNvbnRlc3QgaWQgYW5kIGFuIGVudHJ5IGlkKS5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB0aGlzIGVudHJ5IHJlc2lkZXMgdW5kZXIuXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBlbnRyeUlkOiBUaGUgc2NyYXRjaHBhZCBJRCBvZiB0aGUgZW50cnkuXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgbG9hZGVkIGFsbCB0aGUgcmVxdWlyZWQgZGF0YS5cbiAgICAgICAgICogQHRvZG8gKEdpZ2FieXRlIEdpYW50KTogQWRkIGF1dGhlbnRpY2F0aW9uIHRvIHRoaXMgZnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIGxvYWRDb250ZXN0RW50cnk6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSB2YWxpZCBjYWxsYmFjayBmdW5jdGlvbiwgZXhpdCB0aGUgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gUmVmZXJlbmNlcyB0byBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IGNvbnRlc3RSZWYgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZCk7XG4gICAgICAgICAgICBsZXQgZW50cmllc1JlZiA9IGNvbnRlc3RSZWYuY2hpbGQoXCJlbnRyaWVzXCIpLmNoaWxkKGVudHJ5SWQpO1xuXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0UGVybUxldmVsKGZ1bmN0aW9uKHBlcm1MZXZlbCkge1xuICAgICAgICAgICAgICAgIC8vIEEgdmFyaWFibGUgY29udGFpbmluZyBhIGxpc3Qgb2YgYWxsIHRoZSBwcm9wZXJ0aWVzIHRoYXQgd2UgbXVzdCBsb2FkIGJlZm9yZSB3ZSBjYW4gaW52b2tlIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgICAgIHZhciByZXF1aXJlZFByb3BzID0gW1wiaWRcIiwgXCJuYW1lXCIsIFwidGh1bWJcIl07XG5cbiAgICAgICAgICAgICAgICBpZiAocGVybUxldmVsID49IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWRQcm9wcy5wdXNoKFwic2NvcmVzXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFRoZSBKU09OIG9iamVjdCB0aGF0IHdlJ2xsIHBhc3MgaW50byB0aGUgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0geyB9O1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXF1aXJlZFByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9wUmVmID0gZW50cmllc1JlZi5jaGlsZChyZXF1aXJlZFByb3BzW2ldKTtcblxuICAgICAgICAgICAgICAgICAgICBwcm9wUmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhW3JlcXVpcmVkUHJvcHNbaV1dID0gc25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0gcmVxdWlyZWRQcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCBzZWxmLnJlcG9ydEVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGxvYWRYQ29udGVzdEVudHJpZXMoY29udGVzdElkLCBjYWxsYmFjaywgbG9hZEhvd01hbnkpXG4gICAgICAgICAqIExvYWRzIFwieFwiIGNvbnRlc3QgZW50cmllcywgYW5kIHBhc3NlcyB0aGVtIGludG8gYSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSB3YW50IHRvIGxvYWQgZW50cmllcyBmcm9tLlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgdGhlIHJlcXVpcmVkIGRhdGEuXG4gICAgICAgICAqIEBwYXJhbSB7SW50ZWdlcn0gbG9hZEhvd01hbnk6IFRoZSBudW1iZXIgb2YgZW50cmllcyB0aGF0IHdlJ2QgbGlrZSB0byBsb2FkLlxuICAgICAgICAgKi9cbiAgICAgICAgbG9hZFhDb250ZXN0RW50cmllczogZnVuY3Rpb24oY29udGVzdElkLCBjYWxsYmFjaywgbG9hZEhvd01hbnksIGluY2x1ZGVKdWRnZWQgPSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0ge307XG5cbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5mZXRjaENvbnRlc3RFbnRyaWVzKGNvbnRlc3RJZCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBlSW5kID0gMDsgZUluZCA8IHJlc3BvbnNlLmxlbmd0aDsgZUluZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubG9hZENvbnRlc3RFbnRyeShjb250ZXN0SWQsIHJlc3BvbnNlW2VJbmRdLCBmdW5jdGlvbihlbnRyeURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtyZXNwb25zZVtlSW5kXV0gPSBlbnRyeURhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0gcmVzcG9uc2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgbG9hZEhvd01hbnksIGluY2x1ZGVKdWRnZWQpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0RGVmYXVsdFJ1YnJpY3MoY2FsbGJhY2spXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgbG9hZGVkIGFsbCB0aGUgZGVmYXVsdCBydWJyaWNzXG4gICAgICAgICAqL1xuICAgICAgICBnZXREZWZhdWx0UnVicmljczogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuICAgICAgICAgICAgbGV0IHJ1YnJpY3NDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwicnVicmljc1wiKTtcblxuICAgICAgICAgICAgcnVicmljc0NoaWxkLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNuYXBzaG90LnZhbCgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0Q29udGVzdFJ1YnJpY3MoY29udGVzdElkLCBjYWxsYmFjaylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgd2Ugd2FudCB0byBsb2FkIHRoZSBydWJyaWNzIGZvclxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgb2YgdGhlIHJ1YnJpY3NcbiAgICAgICAgICovXG4gICAgICAgIGdldENvbnRlc3RSdWJyaWNzOiBmdW5jdGlvbihjb250ZXN0SWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0ge307XG5cbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5nZXREZWZhdWx0UnVicmljcyhmdW5jdGlvbihkZWZhdWx0UnVicmljcykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YSA9IGRlZmF1bHRSdWJyaWNzO1xuICAgICAgICAgICAgICAgIHNlbGYuZmV0Y2hDb250ZXN0KGNvbnRlc3RJZCwgZnVuY3Rpb24oY29udGVzdFJ1YnJpY3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1c3RvbVJ1YnJpY3MgPSBjb250ZXN0UnVicmljcy5ydWJyaWNzO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXN0b21SdWJyaWNzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjdXN0b21SdWJyaWMgaW4gY3VzdG9tUnVicmljcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2FsbGJhY2tEYXRhLmhhc093blByb3BlcnR5KGN1c3RvbVJ1YnJpYykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhW2N1c3RvbVJ1YnJpY10gPSBjdXN0b21SdWJyaWNzW2N1c3RvbVJ1YnJpY107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VzdG9tUnVicmljcy5oYXNPd25Qcm9wZXJ0eShcIk9yZGVyXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgb0luZCA9IDA7IG9JbmQgPCBjdXN0b21SdWJyaWNzLk9yZGVyLmxlbmd0aDsgb0luZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgY3VycmVudCBydWJyaWMgaXRlbSBpcyBhY3R1YWxseSBhIHZhbGlkIHJ1YnJpYyBpdGVtLCBhbmQgbWFrZSBzdXJlIGl0J3Mgbm90IHRoZSBcIk9yZGVyXCIgaXRlbS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1c3RvbVJ1YnJpY3MuaGFzT3duUHJvcGVydHkoY3VzdG9tUnVicmljcy5PcmRlcltvSW5kXSkgJiYgY3VzdG9tUnVicmljcy5PcmRlcltvSW5kXSAhPT0gXCJPcmRlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGhpc1J1YnJpYyA9IGN1c3RvbVJ1YnJpY3MuT3JkZXJbb0luZF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja0RhdGEuT3JkZXIuaW5kZXhPZih0aGlzUnVicmljKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGEuT3JkZXIucHVzaCh0aGlzUnVicmljKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tUnVicmljcy5PcmRlciA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICB9LCBbXCJydWJyaWNzXCJdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICoganVkZ2VFbnRyeShjb250ZXN0SWQsIGVudHJ5SWQsIHNjb3JlRGF0YSwgY2FsbGJhY2spXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHdlJ3JlIGp1ZGdpbmcgYW4gZW50cnkgZm9yXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBlbnRyeUlkOiBUaGUgSUQgb2YgdGhlIGVudHJ5IHRoYXQgd2UncmUganVkZ2luZ1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NvcmVEYXRhOiBUaGUgc2NvcmluZyBkYXRhXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIGFmdGVyIHdlJ3ZlIHZhbGlkYXRlZCB0aGUgc2NvcmVzLCBhbmQgc3VibWl0dGVkIHRoZW0uXG4gICAgICAgICAqL1xuICAgICAgICBqdWRnZUVudHJ5OiBmdW5jdGlvbihjb250ZXN0SWQsIGVudHJ5SWQsIHNjb3JlRGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIDA6IENoZWNrIHRoZSB1c2VycyBwZXJtIGxldmVsLCBpZiB0aGVpciBwZXJtTGV2ZWwgaXNuJ3QgPj0gNCwgZXhpdC5cbiAgICAgICAgICAgIC8vIDE6IEZldGNoIHRoZSBydWJyaWNzIGZvciB0aGUgY3VycmVudCBjb250ZXN0LCB0byBtYWtlIHN1cmUgd2UncmUgbm90IGRvaW5nIGFueXRoaW5nIGZ1bmt5XG4gICAgICAgICAgICAvLyAyOiBWYWxpZGF0ZSB0aGUgZGF0YSB0aGF0IHdhcyBzdWJtaXR0ZWQgdG8gdGhlIGZ1bmN0aW9uXG4gICAgICAgICAgICAvLyAzOiBTdWJtaXQgdGhlIGRhdGEgdG8gRmlyZWJhc2VcblxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldFBlcm1MZXZlbChmdW5jdGlvbihwZXJtTGV2ZWwpIHtcbiAgICAgICAgICAgICAgICBpZiAocGVybUxldmVsID49IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRoaXNKdWRnZSA9IHNlbGYuZmV0Y2hGaXJlYmFzZUF1dGgoKS51aWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXRDb250ZXN0UnVicmljcyhjb250ZXN0SWQsIGZ1bmN0aW9uKGNvbnRlc3RSdWJyaWNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZCA9IChjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZCA9PT0gdW5kZWZpbmVkID8gW10gOiBjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXN0UnVicmljcy5oYXNPd25Qcm9wZXJ0eShcImp1ZGdlc1dob1ZvdGVkXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkLmluZGV4T2YodGhpc0p1ZGdlKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soRVJST1JfTUVTU0FHRVMuRVJSX0FMUkVBRFlfVk9URUQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNKdWRnZXNWb3RlID0ge307XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNjb3JlIGluIHNjb3JlRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXN0UnVicmljcy5oYXNPd25Qcm9wZXJ0eShzY29yZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjb3JlVmFsID0gLTE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNjb3JlRGF0YVtzY29yZV0gPiBjb250ZXN0UnVicmljc1tzY29yZV0ubWF4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZVZhbCA9IGNvbnRlc3RSdWJyaWNzW3Njb3JlXS5tYXg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NvcmVEYXRhW3Njb3JlXSA8IGNvbnRlc3RSdWJyaWNzW3Njb3JlXS5taW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlVmFsID0gY29udGVzdFJ1YnJpY3Nbc2NvcmVdLm1pbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlVmFsID0gc2NvcmVEYXRhW3Njb3JlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNKdWRnZXNWb3RlW3Njb3JlXSA9IHNjb3JlVmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpc0p1ZGdlc1ZvdGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZldGNoQ29udGVzdEVudHJ5KGNvbnRlc3RJZCwgZW50cnlJZCwgZnVuY3Rpb24oZXhpc3RpbmdTY29yZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZ1Njb3JlRGF0YSA9IGV4aXN0aW5nU2NvcmVEYXRhLnNjb3JlcztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkLnB1c2godGhpc0p1ZGdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhVG9Xcml0ZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganVkZ2VzV2hvVm90ZWQ6IGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZ1Njb3JlRGF0YS5oYXNPd25Qcm9wZXJ0eShcInJ1YnJpY1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXhpc3RpbmdSdWJyaWNJdGVtU2NvcmVzID0gZXhpc3RpbmdTY29yZURhdGEucnVicmljO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJ1YnJpY0l0ZW1zID0gY29udGVzdFJ1YnJpY3M7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcnVicmljSXRlbSBpbiBydWJyaWNJdGVtcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXNKdWRnZXNWb3RlLmhhc093blByb3BlcnR5KHJ1YnJpY0l0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGUgaXRlbTogXCIgKyBydWJyaWNJdGVtKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0bXBTY29yZU9iaiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZnOiAoZXhpc3RpbmdSdWJyaWNJdGVtU2NvcmVzW3J1YnJpY0l0ZW1dID09PSB1bmRlZmluZWQgPyAxIDogZXhpc3RpbmdSdWJyaWNJdGVtU2NvcmVzW3J1YnJpY0l0ZW1dLmF2ZyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdWdoOiAoZXhpc3RpbmdSdWJyaWNJdGVtU2NvcmVzW3J1YnJpY0l0ZW1dID09PSB1bmRlZmluZWQgPyAxIDogZXhpc3RpbmdSdWJyaWNJdGVtU2NvcmVzW3J1YnJpY0l0ZW1dLnJvdWdoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YVRvV3JpdGUuanVkZ2VzV2hvVm90ZWQubGVuZ3RoIC0gMSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXBTY29yZU9iai5yb3VnaCA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcFNjb3JlT2JqLmF2ZyA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wU2NvcmVPYmoucm91Z2ggPSB0bXBTY29yZU9iai5yb3VnaCArIHRoaXNKdWRnZXNWb3RlW3J1YnJpY0l0ZW1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcFNjb3JlT2JqLmF2ZyA9IHRtcFNjb3JlT2JqLnJvdWdoIC8gKGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkLmxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVG9Xcml0ZVtydWJyaWNJdGVtXSA9IHRtcFNjb3JlT2JqO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YVRvV3JpdGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZiUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2hpbGQoXCJlbnRyaWVzXCIpLmNoaWxkKGVudHJ5SWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jaGlsZChcInNjb3Jlc1wiKS5jaGlsZChcInJ1YnJpY1wiKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZiUmVmLnNldChkYXRhVG9Xcml0ZSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlcG9ydEVycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBbXCJzY29yZXNcIl0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhFUlJPUl9NRVNTQUdFUy5FUlJfTk9UX0pVREdFKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuIiwidmFyIENKUyA9IHJlcXVpcmUoXCIuLi9iYWNrZW5kL2NvbnRlc3RfanVkZ2luZ19zeXMuanNcIik7XG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2hlbHBlcnMuanNcIik7XG5cbmxldCB1cmxQYXJhbXMgPSBoZWxwZXJzLmdlbmVyYWwuZ2V0VXJsUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxudmFyIG51bUVudHJpZXNUb0xvYWQgPSAzMjtcblxudmFyIGNvbnRlc3RJZCA9IG51bGw7XG5cbmlmICh1cmxQYXJhbXMuaGFzT3duUHJvcGVydHkoXCJjb250ZXN0XCIpKSB7XG4gICAgY29udGVzdElkID0gdXJsUGFyYW1zLmNvbnRlc3Q7XG59IGVsc2Uge1xuICAgIGFsZXJ0KFwiUGxlYXNlIHNwZWNpZnkgYSBDb250ZXN0IElEIVwiKTtcbiAgICB3aW5kb3cuaGlzdG9yeS5iYWNrKCk7XG59XG5cbmlmICh1cmxQYXJhbXMuaGFzT3duUHJvcGVydHkoXCJjb3VudFwiKSkge1xuICAgIG51bUVudHJpZXNUb0xvYWQgPSBwYXJzZUludCh1cmxQYXJhbXMuY291bnQsIDEwKTtcbn1cblxudmFyIGNyZWF0ZUVudHJ5ID0gZnVuY3Rpb24oZW50cnkpIHtcbiAgICByZXR1cm4gJChcIjxkaXY+XCIpLmF0dHIoXCJpZFwiLCBlbnRyeS5pZClcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8YT5cIikuYXR0cihcImhyZWZcIiwgYGVudHJ5Lmh0bWw/Y29udGVzdD0ke2NvbnRlc3RJZH0mZW50cnk9JHtlbnRyeS5pZH1gKVxuICAgICAgICAgICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICQoXCI8aW1nPlwiKS5hdHRyKFwic3JjXCIsIFwiaHR0cHM6Ly93d3cua2hhbmFjYWRlbXkub3JnL1wiICsgZW50cnkudGh1bWIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoXCJpbWctcmVzcG9uc2l2ZSBlbnRyeS1pbWdcIilcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgJChcIjxwPlwiKS50ZXh0KGVudHJ5Lm5hbWUpLmFkZENsYXNzKFwiZW50cnktdGl0bGUgY2VudGVyLWFsaWduXCIpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhcImNvbCBzMTIgbTMgbDMgY2VudGVyLWFsaWduIGNvbnRlc3QtZW50cnlcIilcbiAgICAgICAgKTtcbn07XG5cbnZhciBzZXR1cFBhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBDSlMubG9hZFhDb250ZXN0RW50cmllcyhjb250ZXN0SWQsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgbGV0IG51bUVudHJpZXMgPSAwO1xuICAgICAgICBsZXQgJGVudHJpZXNSb3cgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJyb3dcIik7XG4gICAgICAgICQoXCIjZW50cmllc1wiKS5hcHBlbmQoJGVudHJpZXNSb3cpO1xuXG4gICAgICAgIGZvciAobGV0IGVudHJ5SWQgaW4gcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIG51bUVudHJpZXMgKz0gMTtcbiAgICAgICAgICAgIGxldCB0aGlzRW50cnkgPSByZXNwb25zZVtlbnRyeUlkXTtcblxuICAgICAgICAgICAgJGVudHJpZXNSb3dcbiAgICAgICAgICAgICAgICAuYXBwZW5kKGNyZWF0ZUVudHJ5KHRoaXNFbnRyeSkpO1xuXG4gICAgICAgICAgICBpZiAobnVtRW50cmllcyAlIDQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAkZW50cmllc1JvdyA9ICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcInJvd1wiKTtcbiAgICAgICAgICAgICAgICAkKFwiI2VudHJpZXNcIikuYXBwZW5kKCRlbnRyaWVzUm93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIG51bUVudHJpZXNUb0xvYWQsIHRydWUpO1xuXG4gICAgQ0pTLmZldGNoQ29udGVzdChjb250ZXN0SWQsIChkYXRhKSA9PiB7XG4gICAgICAgICQoXCIuY29udGVzdC1uYW1lXCIpLnRleHQoYEVudHJpZXMgZm9yICR7ZGF0YS5uYW1lfWApO1xuICAgIH0sIFtcIm5hbWVcIl0pO1xufTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaGVscGVycy5hdXRoZW50aWNhdGlvbi5zZXR1cFBhZ2VBdXRoKFwiI2F1dGhCdG5cIiwgQ0pTKTtcbiAgICBzZXR1cFBhZ2UoKTtcbn0pO1xuXG4kKFwiI25leHQtdW5qdWRnZWRcIikub24oXCJjbGlja1wiLCAoZXZ0KSA9PiB7XG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBDSlMuZmV0Y2hDb250ZXN0RW50cmllcyh1cmxQYXJhbXMuY29udGVzdCwgZnVuY3Rpb24obmV4dEVudHJ5KSB7XG4gICAgICAgIGlmIChuZXh0RW50cnlbMF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBgZW50cnkuaHRtbD9jb250ZXN0PSR7dXJsUGFyYW1zLmNvbnRlc3R9JmVudHJ5PSR7bmV4dEVudHJ5WzBdfWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbGVydChcIldlIGNvdWxkbid0IGZpbmQgYW4gdW4tanVkZ2VkIGVudHJ5LCBzb3JyeSFcIik7XG4gICAgICAgIH1cbiAgICB9LCAxLCBmYWxzZSk7XG59KSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGFkZEFkbWluTGluazogZnVuY3Rpb24oc2VsZWN0b3IsIGNqc1dyYXBwZXIpIHtcbiAgICAgICAgY2pzV3JhcHBlci5nZXRQZXJtTGV2ZWwoZnVuY3Rpb24ocGVybUxldmVsKSB7XG4gICAgICAgICAgICBpZiAocGVybUxldmVsID49IDUpIHtcbiAgICAgICAgICAgICAgICAkKFwiPGxpPlwiKS5hZGRDbGFzcyhcImFjdGl2ZVwiKS5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICQoXCI8YT5cIikuYXR0cihcImhyZWZcIiwgXCIuL2FkbWluL1wiKS50ZXh0KFwiQWRtaW4gZGFzaGJvYXJkXCIpXG4gICAgICAgICAgICAgICAgKS5pbnNlcnRCZWZvcmUoJChzZWxlY3RvcikucGFyZW50KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHNldHVwT25DbGljazogZnVuY3Rpb24oc2VsZWN0b3IsIGNqc1dyYXBwZXIpIHtcbiAgICAgICAgJChzZWxlY3Rvcikub24oXCJjbGlja1wiLCAoZXZ0KSA9PiB7XG4gICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaWYgKGNqc1dyYXBwZXIuZmV0Y2hGaXJlYmFzZUF1dGgoKSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNqc1dyYXBwZXIuYXV0aGVudGljYXRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNqc1dyYXBwZXIuYXV0aGVudGljYXRlKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHNob3dXZWxjb21lOiBmdW5jdGlvbihzZWxlY3RvciwgY2pzV3JhcHBlcikge1xuICAgICAgICBpZiAoY2pzV3JhcHBlci5mZXRjaEZpcmViYXNlQXV0aCgpID09PSBudWxsKSB7XG4gICAgICAgICAgICAkKHNlbGVjdG9yKS50ZXh0KFwiSGVsbG8gZ3Vlc3QhIENsaWNrIG1lIHRvIGxvZyBpbi5cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKHNlbGVjdG9yKS50ZXh0KGBIZWxsbyAke2Nqc1dyYXBwZXIuZmV0Y2hGaXJlYmFzZUF1dGgoKS5nb29nbGUuZGlzcGxheU5hbWV9ISAoTm90IHlvdT8gQ2xpY2sgaGVyZSEpYCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNldHVwUGFnZUF1dGg6IGZ1bmN0aW9uKGF1dGhCdG5TZWxlY3RvciwgY2pzV3JhcHBlcikge1xuICAgICAgICB0aGlzLnNldHVwT25DbGljayhhdXRoQnRuU2VsZWN0b3IsIGNqc1dyYXBwZXIpO1xuICAgICAgICB0aGlzLnNob3dXZWxjb21lKGF1dGhCdG5TZWxlY3RvciwgY2pzV3JhcHBlcik7XG4gICAgICAgIC8vIHRoaXMuYWRkQWRtaW5MaW5rKGF1dGhCdG5TZWxlY3RvciwgY2pzV3JhcHBlcik7XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBnZXRDb29raWUoY29va2llTmFtZSlcbiAgICAgKiBGZXRjaGVzIHRoZSBzcGVjaWZpZWQgY29va2llIGZyb20gdGhlIGJyb3dzZXIsIGFuZCByZXR1cm5zIGl0J3MgdmFsdWUuXG4gICAgICogQGF1dGhvciB3M3NjaG9vbHNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29va2llTmFtZTogVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0aGF0IHdlIHdhbnQgdG8gZmV0Y2guXG4gICAgICogQHJldHVybnMge1N0cmluZ30gY29va2llVmFsdWU6IFRoZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIGNvb2tpZSwgb3IgYW4gZW1wdHkgc3RyaW5nLCBpZiB0aGVyZSBpcyBubyBcIm5vbi1mYWxzeVwiIHZhbHVlLlxuICAgICAqL1xuICAgIGdldENvb2tpZTogZnVuY3Rpb24oY29va2llTmFtZSkge1xuICAgICAgICAvLyBHZXQgdGhlIGNvb2tpZSB3aXRoIG5hbWUgY29va2llIChyZXR1cm4gXCJcIiBpZiBub24tZXhpc3RlbnQpXG4gICAgICAgIGNvb2tpZU5hbWUgPSBjb29raWVOYW1lICsgXCI9XCI7XG4gICAgICAgIC8vIENoZWNrIGFsbCBvZiB0aGUgY29va2llcyBhbmQgdHJ5IHRvIGZpbmQgdGhlIG9uZSBjb250YWluaW5nIG5hbWUuXG4gICAgICAgIHZhciBjb29raWVMaXN0ID0gZG9jdW1lbnQuY29va2llLnNwbGl0KFwiO1wiKTtcbiAgICAgICAgZm9yICh2YXIgY0luZCA9IDA7IGNJbmQgPCBjb29raWVMaXN0Lmxlbmd0aDsgY0luZCArKykge1xuICAgICAgICAgICAgdmFyIGN1ckNvb2tpZSA9IGNvb2tpZUxpc3RbY0luZF07XG4gICAgICAgICAgICB3aGlsZSAoY3VyQ29va2llWzBdID09PSBcIiBcIikge1xuICAgICAgICAgICAgICAgIGN1ckNvb2tpZSA9IGN1ckNvb2tpZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiB3ZSd2ZSBmb3VuZCB0aGUgcmlnaHQgY29va2llLCByZXR1cm4gaXRzIHZhbHVlLlxuICAgICAgICAgICAgaWYgKGN1ckNvb2tpZS5pbmRleE9mKGNvb2tpZU5hbWUpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1ckNvb2tpZS5zdWJzdHJpbmcoY29va2llTmFtZS5sZW5ndGgsIGN1ckNvb2tpZS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgaWYgdGhlIGNvb2tpZSBkb2Vzbid0IGV4aXN0LCByZXR1cm4gXCJcIlxuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIHNldENvb2tpZShjb29raWVOYW1lLCB2YWx1ZSlcbiAgICAgKiBDcmVhdGVzL3VwZGF0ZXMgYSBjb29raWUgd2l0aCB0aGUgZGVzaXJlZCBuYW1lLCBzZXR0aW5nIGl0J3MgdmFsdWUgdG8gXCJ2YWx1ZVwiLlxuICAgICAqIEBhdXRob3IgdzNzY2hvb2xzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvb2tpZU5hbWU6IFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdGhhdCB3ZSB3YW50IHRvIGNyZWF0ZS91cGRhdGUuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlOiBUaGUgdmFsdWUgdG8gYXNzaWduIHRvIHRoZSBjb29raWUuXG4gICAgICovXG4gICAgc2V0Q29va2llOiBmdW5jdGlvbihjb29raWVOYW1lLCB2YWx1ZSkge1xuICAgICAgICAvLyBTZXQgYSBjb29raWUgd2l0aCBuYW1lIGNvb2tpZSBhbmQgdmFsdWUgY29va2llIHRoYXQgd2lsbCBleHBpcmUgMzAgZGF5cyBmcm9tIG5vdy5cbiAgICAgICAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBkLnNldFRpbWUoZC5nZXRUaW1lKCkgKyAoMzAgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG4gICAgICAgIHZhciBleHBpcmVzID0gXCJleHBpcmVzPVwiICsgZC50b1VUQ1N0cmluZygpO1xuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWVOYW1lICsgXCI9XCIgKyB2YWx1ZSArIFwiOyBcIiArIGV4cGlyZXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBnZXRVcmxQYXJhbXMoKVxuICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybDogVGhlIFVSTCB0byBmZXRjaCBVUkwgcGFyYW1ldGVycyBmcm9tXG4gICAgICovXG4gICAgZ2V0VXJsUGFyYW1zOiBmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgdmFyIHVybFBhcmFtcyA9IHt9O1xuXG4gICAgICAgIHZhciBzcGxpdFVybCA9IHVybC5zcGxpdChcIj9cIilbMV07XG5cbiAgICAgICAgaWYgKHNwbGl0VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciB0bXBVcmxQYXJhbXMgPSBzcGxpdFVybC5zcGxpdChcIiZcIik7XG5cbiAgICAgICAgICAgIGZvciAobGV0IHVwSW5kID0gMDsgdXBJbmQgPCB0bXBVcmxQYXJhbXMubGVuZ3RoOyB1cEluZCsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJQYXJhbVN0ciA9IHRtcFVybFBhcmFtc1t1cEluZF07XG5cbiAgICAgICAgICAgICAgICB1cmxQYXJhbXNbY3VyclBhcmFtU3RyLnNwbGl0KFwiPVwiKVswXV0gPSBjdXJyUGFyYW1TdHIuc3BsaXQoXCI9XCIpWzFdXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCNcXCEvZywgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXJsUGFyYW1zO1xuICAgIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgYXV0aGVudGljYXRpb246IHJlcXVpcmUoXCIuL2F1dGhlbnRpY2F0aW9uLmpzXCIpLFxuICAgIGdlbmVyYWw6IHJlcXVpcmUoXCIuL2dlbmVyYWwuanNcIilcbn07Il19
