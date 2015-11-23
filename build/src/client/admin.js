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

                    firebaseRef.authWithOAuthRedirect("google", function (err, authData) {
                        if (err) {
                            self.reportError(err);
                        } else {
                            var fbUsersRef = firebaseRef.child("users");

                            fbUsersRef.once("value", function (usersSnapshot) {
                                if (!usersSnapshot.hasChild(authData.uid)) {
                                    usersRef.child(authData.uid).set({
                                        name: authData.google.displayName,
                                        permLevel: 1
                                    }, self.reportError);

                                    console.log("Added new user to Firebase! Welcome to CJSKA \"" + authData.google.displayName + "\"!");
                                }
                            });
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

var gContests = null;

var newData = {
    id: null,
    name: null,
    newRubrics: []
};

$(function () {
    CJS.getPermLevel(function (permLevel) {
        if (permLevel >= 5) {
            helpers.authentication.setupPageAuth("#authBtn", CJS);

            CJS.fetchContests(function (contests) {
                $("#start").text("Select a contest...");
                gContests = contests;
                var contestKeys = Object.keys(contests);

                for (var cInd = 0; cInd < contestKeys.length; cInd++) {
                    $("#contestSelect").append($("<option>").attr("value", contestKeys[cInd]).text(contests[contestKeys[cInd]].name));
                }

                $("#contestSelect").material_select();
            });
        } else {
            window.location.href = "../index.html";
        }
    });
});

$("#contestSelect").on("change", function () {
    $("#submitData").attr("disabled", false).removeClass("disabled");

    newData.id = $("#contestSelect").val();
    newData.name = gContests[$("#contestSelect").val()].name;

    $("[name=contestName]").val(newData.name);
});

var rubricKeys = [];

function removeRubricKey(index) {
    if (index < rubricKeys.length) {
        var rubricKey = rubricKeys.splice(index, 1)[0];
        rubricKey.$el.remove();
    }
}

function addRubricKey($container) {
    var data = {
        name: "",
        $el: $("<div>").addClass("key col l12 m12 s12").append($("<label>").text("Rubric Key " + (rubricKeys.length + 1)))
    };

    var $input = $("<input>").attr("type", "text").attr("id", "rubric-key");

    data.$input = $input;

    $input.bind("input propertychange", function () {
        console.log("hi");
        data.name = $input.val();
        if ($input.val().length > 0 && data.$el.is(":last-child")) {
            addRubricKey($container);
        }
        if (rubricKeys.length >= 2 && rubricKeys[rubricKeys.length - 2].name === "" && rubricKeys[rubricKeys.length - 1].name === "" && !rubricKeys[rubricKeys.length - 1].$input.is(":focus")) {
            removeRubricKey(rubricKeys.length - 1);
        }
    });

    data.$el.append($input);

    $container.append(data.$el);

    rubricKeys.push(data);

    return data;
}

addRubricKey($(".keys"));

$("#submitData").on("click", function () {
    // TODO (@GigabyteGiant)
});

$(".create-rubric-item").on("click", function () {
    // TODO (@GigabyteGiant)
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2NsaWVudC9hZG1pbi5qcyIsIi9Vc2Vycy9CcnluZGVuL3NwYXJrL0NvbnRlc3QtSnVkZ2luZy1TeXN0ZW0tZm9yLUtBL3NyYy9oZWxwZXJzL2F1dGhlbnRpY2F0aW9uLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2hlbHBlcnMvZ2VuZXJhbC5qcyIsIi9Vc2Vycy9CcnluZGVuL3NwYXJrL0NvbnRlc3QtSnVkZ2luZy1TeXN0ZW0tZm9yLUtBL3NyYy9oZWxwZXJzL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxZQUFXO0FBQ3pCLFFBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtBQUNwQyxlQUFPO0tBQ1Y7OztBQUdELFFBQUksWUFBWSxHQUFHLDRDQUE0QyxDQUFDOzs7QUFHaEUsUUFBSSx1QkFBdUIsR0FBRyxFQUFFLENBQUM7OztBQUdqQyxRQUFJLGNBQWMsR0FBRztBQUNqQixxQkFBYSxFQUFFLDZEQUE2RDtBQUM1RSx5QkFBaUIsRUFBRSwwQ0FBMEM7S0FDaEUsQ0FBQzs7QUFFRixXQUFPO0FBQ0gsbUJBQVcsRUFBRSxxQkFBUyxLQUFLLEVBQUU7QUFDekIsbUJBQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEI7QUFDRCx5QkFBaUIsRUFBRSw2QkFBVztBQUMxQixt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WSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQzdELE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDN0I7U0FDSjs7QUFFRCxlQUFPLFNBQVMsQ0FBQztLQUNwQjtDQUNKLENBQUM7Ozs7O0FDL0RGLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDYixrQkFBYyxFQUFFLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQztBQUM5QyxXQUFPLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQztDQUNuQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICAgIGlmICghd2luZG93LmpRdWVyeSB8fCAhd2luZG93LkZpcmViYXNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIHZhcmlhYmxlIGlzIHVzZWQgdG8gc3RvcmUgb3VyIFwiRmlyZWJhc2UgS2V5XCJcbiAgICBsZXQgRklSRUJBU0VfS0VZID0gXCJodHRwczovL2NvbnRlc3QtanVkZ2luZy1zeXMuZmlyZWJhc2Vpby5jb21cIjtcblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgdmFyaWFibGUgaXMgdXNlZCB0byBzcGVjaWZ5IHRoZSBkZWZhdWx0IG51bWJlciBvZiBlbnRyaWVzIHRvIGZldGNoXG4gICAgbGV0IERFRl9OVU1fRU5UUklFU19UT19MT0FEID0gMTA7XG5cbiAgICAvLyBFcnJvciBtZXNzYWdlcy5cbiAgICBsZXQgRVJST1JfTUVTU0FHRVMgPSB7XG4gICAgICAgIEVSUl9OT1RfSlVER0U6IFwiRXJyb3I6IFlvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIGp1ZGdlIGNvbnRlc3QgZW50cmllcy5cIixcbiAgICAgICAgRVJSX0FMUkVBRFlfVk9URUQ6IFwiRXJyb3I6IFlvdSd2ZSBhbHJlYWR5IGp1ZGdlZCB0aGlzIGVudHJ5LlwiXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlcG9ydEVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIH0sXG4gICAgICAgIGZldGNoRmlyZWJhc2VBdXRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKS5nZXRBdXRoKCk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uY2VBdXRoZWQ6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKS5vbkF1dGgoY2FsbGJhY2ssIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogYXV0aGVudGljYXRlKGxvZ291dClcbiAgICAgICAgICogSWYgbG9nb3V0IGlzIGZhbHNlIChvciB1bmRlZmluZWQpLCB3ZSByZWRpcmVjdCB0byBhIGdvb2dsZSBsb2dpbiBwYWdlLlxuICAgICAgICAgKiBJZiBsb2dvdXQgaXMgdHJ1ZSwgd2UgaW52b2tlIEZpcmViYXNlJ3MgdW5hdXRoIG1ldGhvZCAodG8gbG9nIHRoZSB1c2VyIG91dCksIGFuZCByZWxvYWQgdGhlIHBhZ2UuXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gbG9nb3V0KjogU2hvdWxkIHdlIGxvZyB0aGUgdXNlciBvdXQ/IChEZWZhdWx0cyB0byBmYWxzZSlcbiAgICAgICAgICovXG4gICAgICAgIGF1dGhlbnRpY2F0ZTogZnVuY3Rpb24obG9nb3V0ID0gZmFsc2UpIHtcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICBpZiAoIWxvZ291dCkge1xuICAgICAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgICAgIGZpcmViYXNlUmVmLmF1dGhXaXRoT0F1dGhSZWRpcmVjdChcImdvb2dsZVwiLCBmdW5jdGlvbihlcnIsIGF1dGhEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVwb3J0RXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmYlVzZXJzUmVmID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJ1c2Vyc1wiKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZmJVc2Vyc1JlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24odXNlcnNTbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdXNlcnNTbmFwc2hvdC5oYXNDaGlsZChhdXRoRGF0YS51aWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJzUmVmLmNoaWxkKGF1dGhEYXRhLnVpZCkuc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGF1dGhEYXRhLmdvb2dsZS5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1MZXZlbDogMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBzZWxmLnJlcG9ydEVycm9yKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFkZGVkIG5ldyB1c2VyIHRvIEZpcmViYXNlISBXZWxjb21lIHRvIENKU0tBIFxcXCJcIiArIGF1dGhEYXRhLmdvb2dsZS5kaXNwbGF5TmFtZSArIFwiXFxcIiFcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlyZWJhc2VSZWYudW5hdXRoKCk7XG5cbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXRQZXJtTGV2ZWwoKVxuICAgICAgICAgKiBHZXRzIHRoZSBwZXJtIGxldmVsIG9mIHRoZSB1c2VyIHRoYXQgaXMgY3VycmVudGx5IGxvZ2dlZCBpbi5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSByZWNpZXZlZCB0aGUgZGF0YS5cbiAgICAgICAgICovXG4gICAgICAgIGdldFBlcm1MZXZlbDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGxldCBhdXRoRGF0YSA9IHRoaXMuZmV0Y2hGaXJlYmFzZUF1dGgoKTtcblxuICAgICAgICAgICAgaWYgKGF1dGhEYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG4gICAgICAgICAgICAgICAgbGV0IHRoaXNVc2VyQ2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcInVzZXJzXCIpLmNoaWxkKGF1dGhEYXRhLnVpZCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzVXNlckNoaWxkLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhzbmFwc2hvdC52YWwoKS5wZXJtTGV2ZWwpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZldGNoQ29udGVzdEVudHJ5KGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2ssIHByb3BlcnRpZXMpXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHRoZSBlbnRyeSB3ZSB3YW50IHRvIGxvYWQgZGF0YSBmb3IgcmVzaWRlcyB1bmRlclxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZW50cnlJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IGVudHJ5IHRoYXQgd2Ugd2FudCB0byBsb2FkIGRhdGEgZm9yXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgbG9hZGVkIGFsbCBvZiB0aGUgcmVxdWlyZWQgZGF0YVxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBwcm9wZXJ0aWVzKjogQSBsaXN0IG9mIGFsbCB0aGUgcHJvcGVydGllcyB0aGF0IHlvdSB3YW50IHRvIGxvYWQgZnJvbSB0aGlzIGNvbnRlc3QgZW50cnlcbiAgICAgICAgICovXG4gICAgICAgIGZldGNoQ29udGVzdEVudHJ5OiBmdW5jdGlvbihjb250ZXN0SWQsIGVudHJ5SWQsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0Q2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZCk7XG4gICAgICAgICAgICBsZXQgZW50cnlDaGlsZCA9IGNvbnRlc3RDaGlsZC5jaGlsZChcImVudHJpZXNcIikuY2hpbGQoZW50cnlJZCk7XG5cbiAgICAgICAgICAgIGxldCByZXF1aXJlZFByb3BzID0gKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IFtcImlkXCIsIFwibmFtZVwiLCBcInRodW1iXCJdIDogcHJvcGVydGllcyk7XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7fTtcblxuICAgICAgICAgICAgZm9yIChsZXQgcHJvcEluZCA9IDA7IHByb3BJbmQgPCByZXF1aXJlZFByb3BzLmxlbmd0aDsgcHJvcEluZCsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJQcm9wID0gcmVxdWlyZWRQcm9wc1twcm9wSW5kXTtcblxuICAgICAgICAgICAgICAgIGVudHJ5Q2hpbGQuY2hpbGQoY3VyclByb3ApLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbY3VyclByb3BdID0gc25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0KGNvbnRlc3RJZCwgY2FsbGJhY2ssIHByb3BlcnRpZXMpXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHlvdSB3YW50IHRvIGxvYWQgZGF0YSBmb3JcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSByZWNlaXZlZCB0aGUgZGF0YS5cbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gcHJvcGVydGllcyo6IEEgbGlzdCBvZiBhbGwgdGhlIHByb3BlcnRpZXMgdGhhdCB5b3Ugd2FudCB0byBsb2FkIGZyb20gdGhpcyBjb250ZXN0LlxuICAgICAgICAgKi9cbiAgICAgICAgZmV0Y2hDb250ZXN0OiBmdW5jdGlvbihjb250ZXN0SWQsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0Q2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZCk7XG5cbiAgICAgICAgICAgIC8vIFByb3BlcnRpZXMgdGhhdCB3ZSBtdXN0IGhhdmUgYmVmb3JlIGNhbiBpbnZva2Ugb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICBsZXQgcmVxdWlyZWRQcm9wcyA9IChwcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyBbXCJpZFwiLCBcIm5hbWVcIiwgXCJkZXNjXCIsIFwiaW1nXCIsIFwiZW50cnlDb3VudFwiXSA6IHByb3BlcnRpZXMpO1xuXG4gICAgICAgICAgICAvLyBUaGUgb2JqZWN0IHRoYXQgd2UgcGFzcyBpbnRvIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHt9O1xuXG4gICAgICAgICAgICBmb3IgKGxldCBwcm9wSW5kID0gMDsgcHJvcEluZCA8IHJlcXVpcmVkUHJvcHMubGVuZ3RoOyBwcm9wSW5kKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgY3VyclByb3AgPSByZXF1aXJlZFByb3BzW3Byb3BJbmRdO1xuXG4gICAgICAgICAgICAgICAgY29udGVzdENoaWxkLmNoaWxkKGN1cnJQcm9wKS5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhW2N1cnJQcm9wXSA9IHNuYXBzaG90LnZhbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0gcmVxdWlyZWRQcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzLnJlcG9ydEVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZldGNoQ29udGVzdHMoY2FsbGJhY2spXG4gICAgICAgICAqIEZldGNoZXMgYWxsIGNvbnRlc3RzIHRoYXQncmUgYmVpbmcgc3RvcmVkIGluIEZpcmViYXNlLCBhbmQgcGFzc2VzIHRoZW0gaW50byBhIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGNhcHR1cmVkIGFsbCB0aGUgZGF0YSB0aGF0IHdlIG5lZWQuXG4gICAgICAgICAqIEB0b2RvIChHaWdhYnl0ZSBHaWFudCk6IEFkZCBiZXR0ZXIgY29tbWVudHMhXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3RzOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIEZpcmViYXNlIGNoaWxkcmVuXG4gICAgICAgICAgICBsZXQgY29udGVzdEtleXNDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdEtleXNcIik7XG4gICAgICAgICAgICBsZXQgY29udGVzdHNDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIik7XG5cbiAgICAgICAgICAgIC8vIFByb3BlcnRpZXMgdGhhdCB3ZSBtdXN0IGhhdmUgYmVmb3JlIHdlIGNhbiBpbnZva2Ugb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICBsZXQgcmVxdWlyZWRQcm9wcyA9IFtcbiAgICAgICAgICAgICAgICBcImlkXCIsXG4gICAgICAgICAgICAgICAgXCJuYW1lXCIsXG4gICAgICAgICAgICAgICAgXCJkZXNjXCIsXG4gICAgICAgICAgICAgICAgXCJpbWdcIixcbiAgICAgICAgICAgICAgICBcImVudHJ5Q291bnRcIlxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgLy8ga2V5c1dlRm91bmQgaG9sZHMgYSBsaXN0IG9mIGFsbCBvZiB0aGUgY29udGVzdCBrZXlzIHRoYXQgd2UndmUgZm91bmQgc28gZmFyXG4gICAgICAgICAgICB2YXIga2V5c1dlRm91bmQgPSBbIF07XG5cbiAgICAgICAgICAgIC8vIGNhbGxiYWNrRGF0YSBpcyB0aGUgb2JqZWN0IHRoYXQgZ2V0cyBwYXNzZWQgaW50byBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7IH07XG5cbiAgICAgICAgICAgIC8vIFwiUXVlcnlcIiBvdXIgY29udGVzdEtleXNDaGlsZFxuICAgICAgICAgICAgY29udGVzdEtleXNDaGlsZC5vcmRlckJ5S2V5KCkub24oXCJjaGlsZF9hZGRlZFwiLCBmdW5jdGlvbihmYkl0ZW0pIHtcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGN1cnJlbnQga2V5IHRvIG91ciBcImtleXNXZUZvdW5kXCIgYXJyYXlcbiAgICAgICAgICAgICAgICBrZXlzV2VGb3VuZC5wdXNoKGZiSXRlbS5rZXkoKSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdGhpc0NvbnRlc3QgPSBjb250ZXN0c0NoaWxkLmNoaWxkKGZiSXRlbS5rZXkoKSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGhpc0NvbnRlc3REYXRhID0geyB9O1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcHJvcEluZCA9IDA7IHByb3BJbmQgPCByZXF1aXJlZFByb3BzLmxlbmd0aDsgcHJvcEluZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyUHJvcGVydHkgPSByZXF1aXJlZFByb3BzW3Byb3BJbmRdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzQ29udGVzdC5jaGlsZChjdXJyUHJvcGVydHkpLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihmYlNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzQ29udGVzdERhdGFbY3VyclByb3BlcnR5XSA9IGZiU25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gKEdpZ2FieXRlIEdpYW50KTogR2V0IHJpZCBvZiBhbGwgdGhpcyBuZXN0ZWQgXCJjcmFwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzQ29udGVzdERhdGEpLmxlbmd0aCA9PT0gcmVxdWlyZWRQcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbZmJJdGVtLmtleSgpXSA9IHRoaXNDb250ZXN0RGF0YTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0ga2V5c1dlRm91bmQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzLnJlcG9ydEVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZldGNoQ29udGVzdEVudHJpZXMoY29udGVzdElkLCBjYWxsYmFjaylcbiAgICAgICAgICpcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIEtoYW4gQWNhZGVteSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgd2Ugd2FudCB0byBmZXRjaCBlbnRyaWVzIGZvci5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2UgYWZ0ZXIgd2UndmUgZmV0Y2hlZCBhbGwgdGhlIGRhdGEgdGhhdCB3ZSBuZWVkLlxuICAgICAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IGxvYWRIb3dNYW55KjogVGhlIG51bWJlciBvZiBlbnRyaWVzIHRvIGxvYWQuIElmIG5vIHZhbHVlIGlzIHBhc3NlZCB0byB0aGlzIHBhcmFtZXRlcixcbiAgICAgICAgICogIGZhbGxiYWNrIG9udG8gYSBkZWZhdWx0IHZhbHVlLlxuICAgICAgICAgKi9cbiAgICAgICAgZmV0Y2hDb250ZXN0RW50cmllczogZnVuY3Rpb24oY29udGVzdElkLCBjYWxsYmFjaywgbG9hZEhvd01hbnkgPSBERUZfTlVNX0VOVFJJRVNfVE9fTE9BRCwgaW5jbHVkZUp1ZGdlZCA9IHRydWUpIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSB2YWxpZCBjYWxsYmFjayBmdW5jdGlvbiwgZXhpdCB0aGUgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gUmVmZXJlbmNlcyB0byBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IHRoaXNDb250ZXN0UmVmID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKS5jaGlsZChjb250ZXN0SWQpO1xuICAgICAgICAgICAgbGV0IGNvbnRlc3RFbnRyaWVzUmVmID0gdGhpc0NvbnRlc3RSZWYuY2hpbGQoXCJlbnRyaWVzXCIpO1xuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgZW50cmllcyB3ZSd2ZSBsb2FkZWRcbiAgICAgICAgICAgIHZhciBudW1Mb2FkZWQgPSAwO1xuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHN0b3JlIGVhY2ggb2YgdGhlIGVudHJpZXMgdGhhdCB3ZSd2ZSBsb2FkZWRcbiAgICAgICAgICAgIHZhciBlbnRyeUtleXMgPSBbIF07XG5cbiAgICAgICAgICAgIHZhciBhbHJlYWR5Q2hlY2tlZCA9IFtdO1xuXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGNvbnRlc3RFbnRyaWVzUmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihmYlNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgbGV0IHRtcEVudHJ5S2V5cyA9IE9iamVjdC5rZXlzKGZiU25hcHNob3QudmFsKCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRtcEVudHJ5S2V5cy5sZW5ndGggPCBsb2FkSG93TWFueSkge1xuICAgICAgICAgICAgICAgICAgICBsb2FkSG93TWFueSA9IHRtcEVudHJ5S2V5cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKG51bUxvYWRlZCA8IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRtcEVudHJ5S2V5cy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRLZXkgPSB0bXBFbnRyeUtleXNbcmFuZG9tSW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeUtleXMuaW5kZXhPZihzZWxlY3RlZEtleSkgPT09IC0xICYmICghZmJTbmFwc2hvdC52YWwoKVtzZWxlY3RlZEtleV0uaGFzT3duUHJvcGVydHkoXCJhcmNoaXZlZFwiKSB8fCBmYlNuYXBzaG90LnZhbCgpW3NlbGVjdGVkS2V5XS5hcmNoaXZlZCA9PT0gZmFsc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmJTbmFwc2hvdC52YWwoKVtzZWxlY3RlZEtleV0uaGFzT3duUHJvcGVydHkoXCJzY29yZXNcIikgJiYgIWluY2x1ZGVKdWRnZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWZiU25hcHNob3QudmFsKClbc2VsZWN0ZWRLZXldLnNjb3Jlcy5ydWJyaWMuaGFzT3duUHJvcGVydHkoXCJqdWRnZXNXaG9Wb3RlZFwiKSB8fCBmYlNuYXBzaG90LnZhbCgpW3NlbGVjdGVkS2V5XS5zY29yZXMucnVicmljLmp1ZGdlc1dob1ZvdGVkLmluZGV4T2Yoc2VsZi5mZXRjaEZpcmViYXNlQXV0aCgpLnVpZCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5S2V5cy5wdXNoKHNlbGVjdGVkS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtTG9hZGVkKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFscmVhZHlDaGVja2VkLmluZGV4T2Yoc2VsZWN0ZWRLZXkpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJBbHJlYWR5IGp1ZGdlZCBcIiArIHNlbGVjdGVkS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFscmVhZHlDaGVja2VkLnB1c2goc2VsZWN0ZWRLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEhvd01hbnktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlLZXlzLnB1c2goc2VsZWN0ZWRLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bUxvYWRlZCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBjYWxsYmFja1dhaXQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVtTG9hZGVkID09PSBsb2FkSG93TWFueSkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhbGxiYWNrV2FpdCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVudHJ5S2V5cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsb2FkQ29udGVzdEVudHJ5KGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2spXG4gICAgICAgICAqIExvYWRzIGEgY29udGVzdCBlbnRyeSAod2hpY2ggaXMgc3BlY2lmaWVkIHZpYSBwcm92aWRpbmcgYSBjb250ZXN0IGlkIGFuZCBhbiBlbnRyeSBpZCkuXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgdGhpcyBlbnRyeSByZXNpZGVzIHVuZGVyLlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZW50cnlJZDogVGhlIHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGVudHJ5LlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgdGhlIHJlcXVpcmVkIGRhdGEuXG4gICAgICAgICAqIEB0b2RvIChHaWdhYnl0ZSBHaWFudCk6IEFkZCBhdXRoZW50aWNhdGlvbiB0byB0aGlzIGZ1bmN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBsb2FkQ29udGVzdEVudHJ5OiBmdW5jdGlvbihjb250ZXN0SWQsIGVudHJ5SWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdmFsaWQgY2FsbGJhY2sgZnVuY3Rpb24sIGV4aXQgdGhlIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZXMgdG8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0UmVmID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKS5jaGlsZChjb250ZXN0SWQpO1xuICAgICAgICAgICAgbGV0IGVudHJpZXNSZWYgPSBjb250ZXN0UmVmLmNoaWxkKFwiZW50cmllc1wiKS5jaGlsZChlbnRyeUlkKTtcblxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldFBlcm1MZXZlbChmdW5jdGlvbihwZXJtTGV2ZWwpIHtcbiAgICAgICAgICAgICAgICAvLyBBIHZhcmlhYmxlIGNvbnRhaW5pbmcgYSBsaXN0IG9mIGFsbCB0aGUgcHJvcGVydGllcyB0aGF0IHdlIG11c3QgbG9hZCBiZWZvcmUgd2UgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICB2YXIgcmVxdWlyZWRQcm9wcyA9IFtcImlkXCIsIFwibmFtZVwiLCBcInRodW1iXCJdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBlcm1MZXZlbCA+PSA1KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkUHJvcHMucHVzaChcInNjb3Jlc1wiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUaGUgSlNPTiBvYmplY3QgdGhhdCB3ZSdsbCBwYXNzIGludG8gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHsgfTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVxdWlyZWRQcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcFJlZiA9IGVudHJpZXNSZWYuY2hpbGQocmVxdWlyZWRQcm9wc1tpXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcHJvcFJlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtyZXF1aXJlZFByb3BzW2ldXSA9IHNuYXBzaG90LnZhbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IHJlcXVpcmVkUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgc2VsZi5yZXBvcnRFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsb2FkWENvbnRlc3RFbnRyaWVzKGNvbnRlc3RJZCwgY2FsbGJhY2ssIGxvYWRIb3dNYW55KVxuICAgICAgICAgKiBMb2FkcyBcInhcIiBjb250ZXN0IGVudHJpZXMsIGFuZCBwYXNzZXMgdGhlbSBpbnRvIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgd2Ugd2FudCB0byBsb2FkIGVudHJpZXMgZnJvbS5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIHRoZSByZXF1aXJlZCBkYXRhLlxuICAgICAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IGxvYWRIb3dNYW55OiBUaGUgbnVtYmVyIG9mIGVudHJpZXMgdGhhdCB3ZSdkIGxpa2UgdG8gbG9hZC5cbiAgICAgICAgICovXG4gICAgICAgIGxvYWRYQ29udGVzdEVudHJpZXM6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2ssIGxvYWRIb3dNYW55LCBpbmNsdWRlSnVkZ2VkID0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHt9O1xuXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZmV0Y2hDb250ZXN0RW50cmllcyhjb250ZXN0SWQsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZUluZCA9IDA7IGVJbmQgPCByZXNwb25zZS5sZW5ndGg7IGVJbmQrKykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmxvYWRDb250ZXN0RW50cnkoY29udGVzdElkLCByZXNwb25zZVtlSW5kXSwgZnVuY3Rpb24oZW50cnlEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbcmVzcG9uc2VbZUluZF1dID0gZW50cnlEYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IHJlc3BvbnNlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGxvYWRIb3dNYW55LCBpbmNsdWRlSnVkZ2VkKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldERlZmF1bHRSdWJyaWNzKGNhbGxiYWNrKVxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgdGhlIGRlZmF1bHQgcnVicmljc1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0RGVmYXVsdFJ1YnJpY3M6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcbiAgICAgICAgICAgIGxldCBydWJyaWNzQ2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcInJ1YnJpY3NcIik7XG5cbiAgICAgICAgICAgIHJ1YnJpY3NDaGlsZC5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhzbmFwc2hvdC52YWwoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldENvbnRlc3RSdWJyaWNzKGNvbnRlc3RJZCwgY2FsbGJhY2spXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHdlIHdhbnQgdG8gbG9hZCB0aGUgcnVicmljcyBmb3JcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIG9mIHRoZSBydWJyaWNzXG4gICAgICAgICAqL1xuICAgICAgICBnZXRDb250ZXN0UnVicmljczogZnVuY3Rpb24oY29udGVzdElkLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHt9O1xuXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0RGVmYXVsdFJ1YnJpY3MoZnVuY3Rpb24oZGVmYXVsdFJ1YnJpY3MpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGEgPSBkZWZhdWx0UnVicmljcztcbiAgICAgICAgICAgICAgICBzZWxmLmZldGNoQ29udGVzdChjb250ZXN0SWQsIGZ1bmN0aW9uKGNvbnRlc3RSdWJyaWNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXN0b21SdWJyaWNzID0gY29udGVzdFJ1YnJpY3MucnVicmljcztcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VzdG9tUnVicmljcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY3VzdG9tUnVicmljIGluIGN1c3RvbVJ1YnJpY3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNhbGxiYWNrRGF0YS5oYXNPd25Qcm9wZXJ0eShjdXN0b21SdWJyaWMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtjdXN0b21SdWJyaWNdID0gY3VzdG9tUnVicmljc1tjdXN0b21SdWJyaWNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1c3RvbVJ1YnJpY3MuaGFzT3duUHJvcGVydHkoXCJPcmRlclwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG9JbmQgPSAwOyBvSW5kIDwgY3VzdG9tUnVicmljcy5PcmRlci5sZW5ndGg7IG9JbmQrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGN1cnJlbnQgcnVicmljIGl0ZW0gaXMgYWN0dWFsbHkgYSB2YWxpZCBydWJyaWMgaXRlbSwgYW5kIG1ha2Ugc3VyZSBpdCdzIG5vdCB0aGUgXCJPcmRlclwiIGl0ZW0uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXN0b21SdWJyaWNzLmhhc093blByb3BlcnR5KGN1c3RvbVJ1YnJpY3MuT3JkZXJbb0luZF0pICYmIGN1c3RvbVJ1YnJpY3MuT3JkZXJbb0luZF0gIT09IFwiT3JkZXJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRoaXNSdWJyaWMgPSBjdXN0b21SdWJyaWNzLk9yZGVyW29JbmRdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2tEYXRhLk9yZGVyLmluZGV4T2YodGhpc1J1YnJpYykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhLk9yZGVyLnB1c2godGhpc1J1YnJpYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbVJ1YnJpY3MuT3JkZXIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgfSwgW1wicnVicmljc1wiXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGp1ZGdlRW50cnkoY29udGVzdElkLCBlbnRyeUlkLCBzY29yZURhdGEsIGNhbGxiYWNrKVxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSdyZSBqdWRnaW5nIGFuIGVudHJ5IGZvclxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZW50cnlJZDogVGhlIElEIG9mIHRoZSBlbnRyeSB0aGF0IHdlJ3JlIGp1ZGdpbmdcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHNjb3JlRGF0YTogVGhlIHNjb3JpbmcgZGF0YVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBhZnRlciB3ZSd2ZSB2YWxpZGF0ZWQgdGhlIHNjb3JlcywgYW5kIHN1Ym1pdHRlZCB0aGVtLlxuICAgICAgICAgKi9cbiAgICAgICAganVkZ2VFbnRyeTogZnVuY3Rpb24oY29udGVzdElkLCBlbnRyeUlkLCBzY29yZURhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyAwOiBDaGVjayB0aGUgdXNlcnMgcGVybSBsZXZlbCwgaWYgdGhlaXIgcGVybUxldmVsIGlzbid0ID49IDQsIGV4aXQuXG4gICAgICAgICAgICAvLyAxOiBGZXRjaCB0aGUgcnVicmljcyBmb3IgdGhlIGN1cnJlbnQgY29udGVzdCwgdG8gbWFrZSBzdXJlIHdlJ3JlIG5vdCBkb2luZyBhbnl0aGluZyBmdW5reVxuICAgICAgICAgICAgLy8gMjogVmFsaWRhdGUgdGhlIGRhdGEgdGhhdCB3YXMgc3VibWl0dGVkIHRvIHRoZSBmdW5jdGlvblxuICAgICAgICAgICAgLy8gMzogU3VibWl0IHRoZSBkYXRhIHRvIEZpcmViYXNlXG5cbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5nZXRQZXJtTGV2ZWwoZnVuY3Rpb24ocGVybUxldmVsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBlcm1MZXZlbCA+PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0aGlzSnVkZ2UgPSBzZWxmLmZldGNoRmlyZWJhc2VBdXRoKCkudWlkO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0Q29udGVzdFJ1YnJpY3MoY29udGVzdElkLCBmdW5jdGlvbihjb250ZXN0UnVicmljcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWQgPSAoY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWQgPT09IHVuZGVmaW5lZCA/IFtdIDogY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGVzdFJ1YnJpY3MuaGFzT3duUHJvcGVydHkoXCJqdWRnZXNXaG9Wb3RlZFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZC5pbmRleE9mKHRoaXNKdWRnZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKEVSUk9SX01FU1NBR0VTLkVSUl9BTFJFQURZX1ZPVEVEKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGlzSnVkZ2VzVm90ZSA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzY29yZSBpbiBzY29yZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGVzdFJ1YnJpY3MuaGFzT3duUHJvcGVydHkoc2NvcmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzY29yZVZhbCA9IC0xO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY29yZURhdGFbc2NvcmVdID4gY29udGVzdFJ1YnJpY3Nbc2NvcmVdLm1heCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmVWYWwgPSBjb250ZXN0UnVicmljc1tzY29yZV0ubWF4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNjb3JlRGF0YVtzY29yZV0gPCBjb250ZXN0UnVicmljc1tzY29yZV0ubWluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZVZhbCA9IGNvbnRlc3RSdWJyaWNzW3Njb3JlXS5taW47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZVZhbCA9IHNjb3JlRGF0YVtzY29yZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzSnVkZ2VzVm90ZVtzY29yZV0gPSBzY29yZVZhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXNKdWRnZXNWb3RlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5mZXRjaENvbnRlc3RFbnRyeShjb250ZXN0SWQsIGVudHJ5SWQsIGZ1bmN0aW9uKGV4aXN0aW5nU2NvcmVEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdTY29yZURhdGEgPSBleGlzdGluZ1Njb3JlRGF0YS5zY29yZXM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZC5wdXNoKHRoaXNKdWRnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YVRvV3JpdGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGp1ZGdlc1dob1ZvdGVkOiBjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmdTY29yZURhdGEuaGFzT3duUHJvcGVydHkoXCJydWJyaWNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4aXN0aW5nUnVicmljSXRlbVNjb3JlcyA9IGV4aXN0aW5nU2NvcmVEYXRhLnJ1YnJpYztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBydWJyaWNJdGVtcyA9IGNvbnRlc3RSdWJyaWNzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHJ1YnJpY0l0ZW0gaW4gcnVicmljSXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzSnVkZ2VzVm90ZS5oYXNPd25Qcm9wZXJ0eShydWJyaWNJdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlIGl0ZW06IFwiICsgcnVicmljSXRlbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG1wU2NvcmVPYmogPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2ZzogKGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXSA9PT0gdW5kZWZpbmVkID8gMSA6IGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXS5hdmcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3VnaDogKGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXSA9PT0gdW5kZWZpbmVkID8gMSA6IGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXS5yb3VnaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFUb1dyaXRlLmp1ZGdlc1dob1ZvdGVkLmxlbmd0aCAtIDEgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wU2NvcmVPYmoucm91Z2ggPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXBTY29yZU9iai5hdmcgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcFNjb3JlT2JqLnJvdWdoID0gdG1wU2NvcmVPYmoucm91Z2ggKyB0aGlzSnVkZ2VzVm90ZVtydWJyaWNJdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXBTY29yZU9iai5hdmcgPSB0bXBTY29yZU9iai5yb3VnaCAvIChjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZC5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVRvV3JpdGVbcnVicmljSXRlbV0gPSB0bXBTY29yZU9iajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGFUb1dyaXRlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmYlJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNoaWxkKFwiZW50cmllc1wiKS5jaGlsZChlbnRyeUlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2hpbGQoXCJzY29yZXNcIikuY2hpbGQoXCJydWJyaWNcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYlJlZi5zZXQoZGF0YVRvV3JpdGUsIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yZXBvcnRFcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1wic2NvcmVzXCJdKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soRVJST1JfTUVTU0FHRVMuRVJSX05PVF9KVURHRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcbiIsInZhciBDSlMgPSByZXF1aXJlKFwiLi4vYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzXCIpO1xudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVycy9oZWxwZXJzLmpzXCIpO1xuXG52YXIgZ0NvbnRlc3RzID0gbnVsbDtcblxudmFyIG5ld0RhdGEgPSB7XG4gICAgaWQ6IG51bGwsXG4gICAgbmFtZTogbnVsbCxcbiAgICBuZXdSdWJyaWNzOiBbXVxufTtcblxuJChmdW5jdGlvbigpIHtcbiAgICBDSlMuZ2V0UGVybUxldmVsKGZ1bmN0aW9uKHBlcm1MZXZlbCkge1xuICAgICAgICBpZiAocGVybUxldmVsID49IDUpIHtcbiAgICAgICAgICAgIGhlbHBlcnMuYXV0aGVudGljYXRpb24uc2V0dXBQYWdlQXV0aChcIiNhdXRoQnRuXCIsIENKUyk7XG5cbiAgICAgICAgICAgIENKUy5mZXRjaENvbnRlc3RzKGZ1bmN0aW9uKGNvbnRlc3RzKSB7XG4gICAgICAgICAgICAgICAgJChcIiNzdGFydFwiKS50ZXh0KFwiU2VsZWN0IGEgY29udGVzdC4uLlwiKTtcbiAgICAgICAgICAgICAgICBnQ29udGVzdHMgPSBjb250ZXN0cztcbiAgICAgICAgICAgICAgICBsZXQgY29udGVzdEtleXMgPSBPYmplY3Qua2V5cyhjb250ZXN0cyk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjSW5kID0gMDsgY0luZCA8IGNvbnRlc3RLZXlzLmxlbmd0aDsgY0luZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICQoXCIjY29udGVzdFNlbGVjdFwiKS5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiPG9wdGlvbj5cIikuYXR0cihcInZhbHVlXCIsIGNvbnRlc3RLZXlzW2NJbmRdKS50ZXh0KGNvbnRlc3RzW2NvbnRlc3RLZXlzW2NJbmRdXS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICQoXCIjY29udGVzdFNlbGVjdFwiKS5tYXRlcmlhbF9zZWxlY3QoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi4uL2luZGV4Lmh0bWxcIjtcbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG5cbiQoXCIjY29udGVzdFNlbGVjdFwiKS5vbihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgJChcIiNzdWJtaXREYXRhXCIpLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSkucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcblxuICAgIG5ld0RhdGEuaWQgPSAkKFwiI2NvbnRlc3RTZWxlY3RcIikudmFsKCk7XG4gICAgbmV3RGF0YS5uYW1lID0gZ0NvbnRlc3RzWyQoXCIjY29udGVzdFNlbGVjdFwiKS52YWwoKV0ubmFtZTtcblxuICAgICQoXCJbbmFtZT1jb250ZXN0TmFtZV1cIikudmFsKG5ld0RhdGEubmFtZSk7XG59KTtcblxubGV0IHJ1YnJpY0tleXMgPSBbXTtcblxuZnVuY3Rpb24gcmVtb3ZlUnVicmljS2V5KGluZGV4KSB7XG4gICAgaWYgKGluZGV4IDwgcnVicmljS2V5cy5sZW5ndGgpIHtcbiAgICAgICAgbGV0IHJ1YnJpY0tleSA9IHJ1YnJpY0tleXMuc3BsaWNlKGluZGV4LCAxKVswXTtcbiAgICAgICAgcnVicmljS2V5LiRlbC5yZW1vdmUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFkZFJ1YnJpY0tleSgkY29udGFpbmVyKSB7XG4gICAgbGV0IGRhdGEgPSB7XG4gICAgICAgIG5hbWU6IFwiXCIsXG4gICAgICAgICRlbDogJChcIjxkaXY+XCIpLmFkZENsYXNzKFwia2V5IGNvbCBsMTIgbTEyIHMxMlwiKVxuICAgICAgICAgICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICQoXCI8bGFiZWw+XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGV4dChgUnVicmljIEtleSAke3J1YnJpY0tleXMubGVuZ3RoICsgMX1gKVxuICAgICAgICAgICAgICAgIClcbiAgICB9O1xuXG4gICAgbGV0ICRpbnB1dCA9ICQoXCI8aW5wdXQ+XCIpLmF0dHIoXCJ0eXBlXCIsIFwidGV4dFwiKS5hdHRyKFwiaWRcIiwgXCJydWJyaWMta2V5XCIpXG5cbiAgICBkYXRhLiRpbnB1dCA9ICRpbnB1dDtcblxuICAgICRpbnB1dC5iaW5kKFwiaW5wdXQgcHJvcGVydHljaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImhpXCIpO1xuICAgICAgICBkYXRhLm5hbWUgPSAkaW5wdXQudmFsKCk7XG4gICAgICAgIGlmICgkaW5wdXQudmFsKCkubGVuZ3RoID4gMCAmJiBkYXRhLiRlbC5pcyhcIjpsYXN0LWNoaWxkXCIpKSB7XG4gICAgICAgICAgICBhZGRSdWJyaWNLZXkoJGNvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJ1YnJpY0tleXMubGVuZ3RoID49IDIgJiZcbiAgICAgICAgICAgIHJ1YnJpY0tleXNbcnVicmljS2V5cy5sZW5ndGggLSAyXS5uYW1lID09PSBcIlwiICYmXG4gICAgICAgICAgICBydWJyaWNLZXlzW3J1YnJpY0tleXMubGVuZ3RoIC0gMV0ubmFtZSA9PT0gXCJcIiAmJlxuICAgICAgICAgICAgIXJ1YnJpY0tleXNbcnVicmljS2V5cy5sZW5ndGggLSAxXS4kaW5wdXQuaXMoXCI6Zm9jdXNcIikpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVSdWJyaWNLZXkocnVicmljS2V5cy5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZGF0YS4kZWwuYXBwZW5kKCRpbnB1dCk7XG5cbiAgICAkY29udGFpbmVyLmFwcGVuZChkYXRhLiRlbCk7XG5cbiAgICBydWJyaWNLZXlzLnB1c2goZGF0YSk7XG5cbiAgICByZXR1cm4gZGF0YTtcbn1cblxuYWRkUnVicmljS2V5KCQoXCIua2V5c1wiKSk7XG5cbiQoXCIjc3VibWl0RGF0YVwiKS5vbihcImNsaWNrXCIsICgpID0+IHtcbiAgICAvLyBUT0RPIChAR2lnYWJ5dGVHaWFudClcbn0pO1xuXG4kKFwiLmNyZWF0ZS1ydWJyaWMtaXRlbVwiKS5vbihcImNsaWNrXCIsICgpID0+IHtcbiAgICAvLyBUT0RPIChAR2lnYWJ5dGVHaWFudClcbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgYWRkQWRtaW5MaW5rOiBmdW5jdGlvbihzZWxlY3RvciwgY2pzV3JhcHBlcikge1xuICAgICAgICBjanNXcmFwcGVyLmdldFBlcm1MZXZlbChmdW5jdGlvbihwZXJtTGV2ZWwpIHtcbiAgICAgICAgICAgIGlmIChwZXJtTGV2ZWwgPj0gNSkge1xuICAgICAgICAgICAgICAgICQoXCI8bGk+XCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgJChcIjxhPlwiKS5hdHRyKFwiaHJlZlwiLCBcIi4vYWRtaW4vXCIpLnRleHQoXCJBZG1pbiBkYXNoYm9hcmRcIilcbiAgICAgICAgICAgICAgICApLmluc2VydEJlZm9yZSgkKHNlbGVjdG9yKS5wYXJlbnQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgc2V0dXBPbkNsaWNrOiBmdW5jdGlvbihzZWxlY3RvciwgY2pzV3JhcHBlcikge1xuICAgICAgICAkKHNlbGVjdG9yKS5vbihcImNsaWNrXCIsIChldnQpID0+IHtcbiAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAoY2pzV3JhcHBlci5mZXRjaEZpcmViYXNlQXV0aCgpID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY2pzV3JhcHBlci5hdXRoZW50aWNhdGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2pzV3JhcHBlci5hdXRoZW50aWNhdGUodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgc2hvd1dlbGNvbWU6IGZ1bmN0aW9uKHNlbGVjdG9yLCBjanNXcmFwcGVyKSB7XG4gICAgICAgIGlmIChjanNXcmFwcGVyLmZldGNoRmlyZWJhc2VBdXRoKCkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICQoc2VsZWN0b3IpLnRleHQoXCJIZWxsbyBndWVzdCEgQ2xpY2sgbWUgdG8gbG9nIGluLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoc2VsZWN0b3IpLnRleHQoYEhlbGxvICR7Y2pzV3JhcHBlci5mZXRjaEZpcmViYXNlQXV0aCgpLmdvb2dsZS5kaXNwbGF5TmFtZX0hIChOb3QgeW91PyBDbGljayBoZXJlISlgKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc2V0dXBQYWdlQXV0aDogZnVuY3Rpb24oYXV0aEJ0blNlbGVjdG9yLCBjanNXcmFwcGVyKSB7XG4gICAgICAgIHRoaXMuc2V0dXBPbkNsaWNrKGF1dGhCdG5TZWxlY3RvciwgY2pzV3JhcHBlcik7XG4gICAgICAgIHRoaXMuc2hvd1dlbGNvbWUoYXV0aEJ0blNlbGVjdG9yLCBjanNXcmFwcGVyKTtcbiAgICAgICAgLy8gdGhpcy5hZGRBZG1pbkxpbmsoYXV0aEJ0blNlbGVjdG9yLCBjanNXcmFwcGVyKTtcbiAgICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIGdldENvb2tpZShjb29raWVOYW1lKVxuICAgICAqIEZldGNoZXMgdGhlIHNwZWNpZmllZCBjb29raWUgZnJvbSB0aGUgYnJvd3NlciwgYW5kIHJldHVybnMgaXQncyB2YWx1ZS5cbiAgICAgKiBAYXV0aG9yIHczc2Nob29sc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb29raWVOYW1lOiBUaGUgbmFtZSBvZiB0aGUgY29va2llIHRoYXQgd2Ugd2FudCB0byBmZXRjaC5cbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBjb29raWVWYWx1ZTogVGhlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgY29va2llLCBvciBhbiBlbXB0eSBzdHJpbmcsIGlmIHRoZXJlIGlzIG5vIFwibm9uLWZhbHN5XCIgdmFsdWUuXG4gICAgICovXG4gICAgZ2V0Q29va2llOiBmdW5jdGlvbihjb29raWVOYW1lKSB7XG4gICAgICAgIC8vIEdldCB0aGUgY29va2llIHdpdGggbmFtZSBjb29raWUgKHJldHVybiBcIlwiIGlmIG5vbi1leGlzdGVudClcbiAgICAgICAgY29va2llTmFtZSA9IGNvb2tpZU5hbWUgKyBcIj1cIjtcbiAgICAgICAgLy8gQ2hlY2sgYWxsIG9mIHRoZSBjb29raWVzIGFuZCB0cnkgdG8gZmluZCB0aGUgb25lIGNvbnRhaW5pbmcgbmFtZS5cbiAgICAgICAgdmFyIGNvb2tpZUxpc3QgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoXCI7XCIpO1xuICAgICAgICBmb3IgKHZhciBjSW5kID0gMDsgY0luZCA8IGNvb2tpZUxpc3QubGVuZ3RoOyBjSW5kICsrKSB7XG4gICAgICAgICAgICB2YXIgY3VyQ29va2llID0gY29va2llTGlzdFtjSW5kXTtcbiAgICAgICAgICAgIHdoaWxlIChjdXJDb29raWVbMF0gPT09IFwiIFwiKSB7XG4gICAgICAgICAgICAgICAgY3VyQ29va2llID0gY3VyQ29va2llLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIHdlJ3ZlIGZvdW5kIHRoZSByaWdodCBjb29raWUsIHJldHVybiBpdHMgdmFsdWUuXG4gICAgICAgICAgICBpZiAoY3VyQ29va2llLmluZGV4T2YoY29va2llTmFtZSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VyQ29va2llLnN1YnN0cmluZyhjb29raWVOYW1lLmxlbmd0aCwgY3VyQ29va2llLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBpZiB0aGUgY29va2llIGRvZXNuJ3QgZXhpc3QsIHJldHVybiBcIlwiXG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogc2V0Q29va2llKGNvb2tpZU5hbWUsIHZhbHVlKVxuICAgICAqIENyZWF0ZXMvdXBkYXRlcyBhIGNvb2tpZSB3aXRoIHRoZSBkZXNpcmVkIG5hbWUsIHNldHRpbmcgaXQncyB2YWx1ZSB0byBcInZhbHVlXCIuXG4gICAgICogQGF1dGhvciB3M3NjaG9vbHNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29va2llTmFtZTogVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0aGF0IHdlIHdhbnQgdG8gY3JlYXRlL3VwZGF0ZS5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWU6IFRoZSB2YWx1ZSB0byBhc3NpZ24gdG8gdGhlIGNvb2tpZS5cbiAgICAgKi9cbiAgICBzZXRDb29raWU6IGZ1bmN0aW9uKGNvb2tpZU5hbWUsIHZhbHVlKSB7XG4gICAgICAgIC8vIFNldCBhIGNvb2tpZSB3aXRoIG5hbWUgY29va2llIGFuZCB2YWx1ZSBjb29raWUgdGhhdCB3aWxsIGV4cGlyZSAzMCBkYXlzIGZyb20gbm93LlxuICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGQuc2V0VGltZShkLmdldFRpbWUoKSArICgzMCAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcbiAgICAgICAgdmFyIGV4cGlyZXMgPSBcImV4cGlyZXM9XCIgKyBkLnRvVVRDU3RyaW5nKCk7XG4gICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZU5hbWUgKyBcIj1cIiArIHZhbHVlICsgXCI7IFwiICsgZXhwaXJlcztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIGdldFVybFBhcmFtcygpXG4gICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsOiBUaGUgVVJMIHRvIGZldGNoIFVSTCBwYXJhbWV0ZXJzIGZyb21cbiAgICAgKi9cbiAgICBnZXRVcmxQYXJhbXM6IGZ1bmN0aW9uKHVybCkge1xuICAgICAgICB2YXIgdXJsUGFyYW1zID0ge307XG5cbiAgICAgICAgdmFyIHNwbGl0VXJsID0gdXJsLnNwbGl0KFwiP1wiKVsxXTtcblxuICAgICAgICBpZiAoc3BsaXRVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIHRtcFVybFBhcmFtcyA9IHNwbGl0VXJsLnNwbGl0KFwiJlwiKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgdXBJbmQgPSAwOyB1cEluZCA8IHRtcFVybFBhcmFtcy5sZW5ndGg7IHVwSW5kKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgY3VyclBhcmFtU3RyID0gdG1wVXJsUGFyYW1zW3VwSW5kXTtcblxuICAgICAgICAgICAgICAgIHVybFBhcmFtc1tjdXJyUGFyYW1TdHIuc3BsaXQoXCI9XCIpWzBdXSA9IGN1cnJQYXJhbVN0ci5zcGxpdChcIj1cIilbMV1cbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcI1xcIS9nLCBcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cmxQYXJhbXM7XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBhdXRoZW50aWNhdGlvbjogcmVxdWlyZShcIi4vYXV0aGVudGljYXRpb24uanNcIiksXG4gICAgZ2VuZXJhbDogcmVxdWlyZShcIi4vZ2VuZXJhbC5qc1wiKVxufTsiXX0=
