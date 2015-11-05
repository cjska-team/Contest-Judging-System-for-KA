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
            var _this = this;

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
                }, _this.reportError);
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
            var _this2 = this;

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
                }, _this2.reportError);
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

var fbAuth = CJS.fetchFirebaseAuth();
var urlParams = helpers.getUrlParams(window.location.href);

var sizing = {
    width: 400,
    height: 400
};

function createRubricTab($tabList, rubric, kInd) {
    $tabList.append($("<li>").addClass("tab col options-tab").attr("data-score-value", kInd).append($("<a>").text(rubric.keys[kInd]).attr("href", "rubric-" + kInd).click(function (evt) {
        var $thisElem = $(evt.toElement);
        $tabList.tabs("select_tab", "rubric-" + kInd);
        console.log($thisElem.attr("data-score-value"));
    })));
}

var controlFactories = {
    keys: function keys(rubric, elem) {
        var $tabList = $("<ul>").addClass("tabs judging-control options-control").attr("data-rubric-item", rubric.rubricItem);
        for (var kInd = 0; kInd < rubric.keys.length; kInd++) {
            createRubricTab($tabList, rubric, kInd);
        }
        elem.append($tabList);
        $tabList.tabs();
    },
    slider: function slider(rubric, elem) {
        console.log("Hey sliders!");
        elem.append($("<p>").addClass("range-field").append($("<input>").attr({
            "type": "range",
            "min": rubric.min,
            "max": rubric.max,
            "value": rubric.min,
            "step": 1
        }).addClass("judging-control slider-control").attr("data-rubric-item", rubric.rubricItem)));
    }
};

var createJudgingControl = function createJudgingControl(rubric, type) {
    var elem = $("<div>").append($("<h5>").text(rubric.rubricItem.replace(/\_/g, " ")).addClass("judging-control-title")).addClass("col l6 m6 s12 judging-control center-align");

    controlFactories[type](rubric, elem);

    return elem;
};

var setupPage = function setupPage() {
    if (fbAuth === null) {
        $("#authBtn").text("Hello, guest! Click me to login.");
    } else {
        $("#authBtn").text("Welcome, " + CJS.fetchFirebaseAuth().google.displayName + "! (Not you? Click here)");
    }

    CJS.getPermLevel(function (permLevel) {

        console.log(urlParams);

        if (!urlParams.hasOwnProperty("contest") || !urlParams.hasOwnProperty("entry")) {
            alert("Contest ID and/or Entry ID not specified. Returning to previous page.");
            window.history.back();
        } else {
            var contestId = urlParams.contest.replace(/\#/g, "");
            var entryId = urlParams.entry;

            var iframeUrl = "https://www.khanacademy.org/computer-programming/contest-entry/" + entryId + "/embedded?buttons=no&editor=yes&author=no&width=" + sizing.width + "&height=" + sizing.height;

            $("#preview").append($("<iframe>").attr("src", iframeUrl).css("height", sizing.height + 10 + "px").addClass("entry-frame"));

            if (permLevel >= 4) {
                var judgingControlsBox;

                (function () {
                    judgingControlsBox = $("#judgingControls");

                    var $controlRow = $("<div>").addClass("row");
                    judgingControlsBox.append($controlRow);

                    CJS.getContestRubrics(contestId, function (rubrics) {
                        console.log(rubrics);

                        for (var rInd = 0; rInd < rubrics.Order.length; rInd++) {
                            var thisRubric = rubrics.Order[rInd];

                            var rubricType = "";

                            if (rubrics[thisRubric].hasOwnProperty("keys")) {
                                rubricType = "keys";
                            } else {
                                rubricType = "slider";
                            }

                            rubrics[thisRubric].rubricItem = thisRubric;

                            $controlRow.append(createJudgingControl(rubrics[thisRubric], rubricType));

                            if ($controlRow.children().length > 1) {
                                $controlRow = $("<div>").addClass("row");
                                judgingControlsBox.append($controlRow);
                            }
                        }
                    });
                })();
            } else {
                $(".judgeOnly").hide();
            }
        }
    });

    CJS.fetchContest(urlParams.contest, function (data) {
        $(".contest-name").text("Entry in " + data.name);
    }, ["name"]);
};

setupPage();

$("#authBtn").on("click", function (evt) {
    evt.preventDefault();

    if (fbAuth === null) {
        CJS.authenticate();
    } else {
        CJS.authenticate(true);
    }
});

$(".submit-score-control").on("click", function (evt) {
    evt.preventDefault();

    var self = $(evt.toElement);

    $(self).addClass("disabled").text("Submitting scores...");
    $("#judgingControls *").prop("disabled", "true").addClass("disabled");

    var scoreData = {};

    $(".judging-control").each(function (index, item) {
        var $controlElem = $(item);
        var rubricItem = $controlElem.attr("data-rubric-item");

        console.log(rubricItem);

        if (rubricItem !== undefined) {
            if ($controlElem.attr("class").indexOf("options-control") !== -1) {
                var $selectedItem = $controlElem.find(".active");

                scoreData[rubricItem] = parseInt($selectedItem.parent().attr("data-score-value"), 10);
            } else if ($controlElem.attr("class").indexOf("slider-control") !== -1) {
                scoreData[rubricItem] = parseInt($controlElem.val(), 10);
            }
        }
    });

    CJS.judgeEntry(urlParams.contest, urlParams.entry, scoreData, function (error) {
        if (error) {
            alert(error);
            return;
        }

        $(self).text("Scores submitted!");
    });
});

$(".reload-entry-control").on("click", function () {
    $(".entry-frame").attr("src", $(".entry-frame").attr("src"));
});

$(".set-dimensions-control").on("click", function () {
    sizing.width = parseInt($("[name=width]").val(), 10);
    sizing.height = parseInt($("[name=height]").val(), 10);

    console.log("https://www.khanacademy.org/computer-programming/contest-entry/" + urlParams.entry + "/embedded?buttons=no&editor=yes&author=no&width=" + sizing.width + "&height=" + sizing.height);

    $(".entry-frame").attr("src", "https://www.khanacademy.org/computer-programming/contest-entry/" + urlParams.entry + "/embedded?buttons=no&editor=yes&author=no&width=" + sizing.width + "&height=" + sizing.height);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2NsaWVudC9lbnRyeS5qcyIsIi9Vc2Vycy9CcnluZGVuL3NwYXJrL0NvbnRlc3QtSnVkZ2luZy1TeXN0ZW0tZm9yLUtBL3NyYy9nZW5lcmFsUHVycG9zZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLFlBQVc7QUFDekIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO0FBQ3BDLGVBQU87S0FDVjs7O0FBR0QsUUFBSSxZQUFZLEdBQUcsNENBQTRDLENBQUM7OztBQUdoRSxRQUFJLHVCQUF1QixHQUFHLEVBQUUsQ0FBQzs7O0FBR2pDLFFBQUksY0FBYyxHQUFHO0FBQ2pCLHFCQUFhLEVBQUUsNkRBQTZEO0FBQzVFLHlCQUFpQixFQUFFLDBDQUEwQztLQUNoRSxDQUFDOztBQUVGLFdBQU87QUFDSCxtQkFBVyxFQUFFLHFCQUFTLEtBQUssRUFBRTtBQUN6QixtQkFBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN4QjtBQUNELHlCQUFpQixFQUFFLDZCQUFXO0FBQzFCLG1CQUFPLEFBQUMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFFLE9BQU8sRUFBRSxDQUFDO1NBQ3hEO0FBQ0Qsa0JBQVUsRUFBRSxvQkFBUyxRQUFRLEVBQUU7QUFDM0IsQUFBQyxnQkFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzFFOzs7Ozs7OztBQVFELG9CQUFZLEVBQUUsd0JBQXlCO2dCQUFoQixNQUFNLHlEQUFHLEtBQUs7O0FBQ2pDLGdCQUFJLFdBQVcsR0FBSSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEFBQUMsQ0FBQzs7QUFFdEQsZ0JBQUksQ0FBQyxNQUFNLEVBQUU7QUFDVCwyQkFBVyxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDakUsTUFBTTtBQUNILDJCQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRXJCLHNCQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQzVCO1NBQ0o7Ozs7Ozs7QUFPRCxvQkFBWSxFQUFFLHNCQUFTLFFBQVEsRUFBRTtBQUM3QixnQkFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7O0FBRXhDLGdCQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7QUFDbkIsb0JBQUksV0FBVyxHQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQUFBQyxDQUFDO0FBQ3RELG9CQUFJLGFBQWEsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRW5FLDZCQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFTLFFBQVEsRUFBRTtBQUMzQyw0QkFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDdEMsQ0FBQyxDQUFDO2FBQ04sTUFBTTtBQUNILHdCQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDZjtTQUNKOzs7Ozs7Ozs7QUFTRCx5QkFBaUIsRUFBRSwyQkFBUyxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUU7OztBQUNsRSxnQkFBSSxDQUFDLFFBQVEsSUFBSyxPQUFPLFFBQVEsS0FBSyxVQUFVLEFBQUMsRUFBRTtBQUMvQyx1QkFBTzthQUNWOzs7QUFHRCxnQkFBSSxXQUFXLEdBQUksSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxBQUFDLENBQUM7OztBQUd0RCxnQkFBSSxZQUFZLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbEUsZ0JBQUksVUFBVSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU5RCxnQkFBSSxhQUFhLEdBQUksVUFBVSxLQUFLLFNBQVMsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsVUFBVSxBQUFDLENBQUM7O0FBRXRGLGdCQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7O2tDQUViLE9BQU87QUFDWixvQkFBSSxRQUFRLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUV0QywwQkFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVMsUUFBUSxFQUFFO0FBQ3hELGdDQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDOztBQUV4Qyx3QkFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sS0FBSyxhQUFhLENBQUMsTUFBTSxFQUFFO0FBQzNELGdDQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7cUJBQzFCO2lCQUNKLEVBQUUsTUFBSyxXQUFXLENBQUMsQ0FBQzs7O0FBVHpCLGlCQUFLLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxPQUFPLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRTtzQkFBeEQsT0FBTzthQVVmO1NBQ0o7Ozs7Ozs7O0FBUUQsb0JBQVksRUFBRSxzQkFBUyxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRTs7O0FBQ3BELGdCQUFJLENBQUMsUUFBUSxJQUFLLE9BQU8sUUFBUSxLQUFLLFVBQVUsQUFBQyxFQUFFO0FBQy9DLHVCQUFPO2FBQ1Y7OztBQUdELGdCQUFJLFdBQVcsR0FBSSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEFBQUMsQ0FBQzs7O0FBR3RELGdCQUFJLFlBQVksR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzs7O0FBR2xFLGdCQUFJLGFBQWEsR0FBSSxVQUFVLEtBQUssU0FBUyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxHQUFHLFVBQVUsQUFBQyxDQUFDOzs7QUFHMUcsZ0JBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQzs7bUNBRWIsT0FBTztBQUNaLG9CQUFJLFFBQVEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRXRDLDRCQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBUyxRQUFRLEVBQUU7QUFDMUQsZ0NBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7O0FBRXhDLHdCQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxLQUFLLGFBQWEsQ0FBQyxNQUFNLEVBQUU7QUFDM0QsZ0NBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztxQkFDMUI7aUJBQ0osRUFBRSxPQUFLLFdBQVcsQ0FBQyxDQUFDOzs7QUFUekIsaUJBQUssSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFO3VCQUF4RCxPQUFPO2FBVWY7U0FDSjs7Ozs7Ozs7QUFRRCxxQkFBYSxFQUFFLHVCQUFTLFFBQVEsRUFBRTtBQUM5QixnQkFBSSxDQUFDLFFBQVEsSUFBSyxPQUFPLFFBQVEsS0FBSyxVQUFVLEFBQUMsRUFBRTtBQUMvQyx1QkFBTzthQUNWOzs7QUFHRCxnQkFBSSxXQUFXLEdBQUksSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxBQUFDLENBQUM7OztBQUd0RCxnQkFBSSxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3hELGdCQUFJLGFBQWEsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDOzs7QUFHbEQsZ0JBQUksYUFBYSxHQUFHLENBQ2hCLElBQUksRUFDSixNQUFNLEVBQ04sTUFBTSxFQUNOLEtBQUssRUFDTCxZQUFZLENBQ2YsQ0FBQzs7O0FBR0YsZ0JBQUksV0FBVyxHQUFHLEVBQUcsQ0FBQzs7O0FBR3RCLGdCQUFJLFlBQVksR0FBRyxFQUFHLENBQUM7OztBQUd2Qiw0QkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLFVBQVMsTUFBTSxFQUFFOztBQUU3RCwyQkFBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQzs7QUFFL0Isb0JBQUksV0FBVyxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7O0FBRXBELG9CQUFJLGVBQWUsR0FBRyxFQUFHLENBQUM7O3VDQUVqQixPQUFPO0FBQ1osd0JBQUksWUFBWSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQywrQkFBVyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVMsVUFBVSxFQUFFO0FBQy9ELHVDQUFlLENBQUMsWUFBWSxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDOzs7QUFHakQsNEJBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLE1BQU0sRUFBRTtBQUM5RCx3Q0FBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLGVBQWUsQ0FBQzs7QUFFN0MsZ0NBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEtBQUssV0FBVyxDQUFDLE1BQU0sRUFBRTtBQUN6RCx3Q0FBUSxDQUFDLFlBQVksQ0FBQyxDQUFDOzZCQUMxQjt5QkFDSjtxQkFDSixDQUFDLENBQUM7OztBQWJQLHFCQUFLLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxPQUFPLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRTsyQkFBeEQsT0FBTztpQkFjZjthQUNKLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3hCOzs7Ozs7Ozs7O0FBVUQsMkJBQW1CLEVBQUUsNkJBQVMsU0FBUyxFQUFFLFFBQVEsRUFBeUM7Z0JBQXZDLFdBQVcseURBQUcsdUJBQXVCOzs7QUFFcEYsZ0JBQUksQ0FBQyxRQUFRLElBQUssT0FBTyxRQUFRLEtBQUssVUFBVSxBQUFDLEVBQUU7QUFDL0MsdUJBQU87YUFDVjs7O0FBR0QsZ0JBQUksV0FBVyxHQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQUFBQyxDQUFDOzs7QUFHdEQsZ0JBQUksY0FBYyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3BFLGdCQUFJLGlCQUFpQixHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7OztBQUcxRCxnQkFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDOzs7QUFHbEIsZ0JBQUksU0FBUyxHQUFHLEVBQUcsQ0FBQzs7QUFFcEIsNkJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFTLFVBQVUsRUFBRTtBQUNqRCxvQkFBSSxZQUFZLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDOzs7QUFHcEMsb0JBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEdBQUcsV0FBVyxFQUFFO0FBQ2hELCtCQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUM7aUJBQ2xEOztBQUVELHVCQUFPLFNBQVMsR0FBRyxXQUFXLEVBQUU7QUFDNUIsd0JBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0Usd0JBQUksV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRXpELHdCQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDdkMsaUNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDNUIsaUNBQVMsRUFBRSxDQUFDO3FCQUNmO2lCQUNKO2FBQ0osRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRXJCLGdCQUFJLFlBQVksR0FBRyxXQUFXLENBQUMsWUFBVztBQUN0QyxvQkFBSSxTQUFTLEtBQUssV0FBVyxFQUFFO0FBQzNCLGlDQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDNUIsNEJBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDdkI7YUFDSixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ1o7Ozs7Ozs7Ozs7QUFVRCx3QkFBZ0IsRUFBRSwwQkFBUyxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRTs7QUFFckQsZ0JBQUksQ0FBQyxRQUFRLElBQUssT0FBTyxRQUFRLEtBQUssVUFBVSxBQUFDLEVBQUU7QUFDL0MsdUJBQU87YUFDVjs7O0FBR0QsZ0JBQUksV0FBVyxHQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQUFBQyxDQUFDOzs7QUFHdEQsZ0JBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hFLGdCQUFJLFVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFNUQsZ0JBQUksSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFaEIsZ0JBQUksQ0FBQyxZQUFZLENBQUMsVUFBUyxTQUFTLEVBQUU7O0FBRWxDLG9CQUFJLGFBQWEsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRTVDLG9CQUFJLFNBQVMsSUFBSSxDQUFDLEVBQUU7QUFDaEIsaUNBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ2hDOzs7QUFHRCxvQkFBSSxZQUFZLEdBQUcsRUFBRyxDQUFDOzt1Q0FFZCxDQUFDO0FBQ04sd0JBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWpELDJCQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFTLFFBQVEsRUFBRTtBQUNyQyxvQ0FBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFaEQsNEJBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLE1BQU0sRUFBRTtBQUMzRCxvQ0FBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO3lCQUMxQjtxQkFDSixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzs7O0FBVHpCLHFCQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTsyQkFBdEMsQ0FBQztpQkFVVDthQUNKLENBQUMsQ0FBQztTQUNOOzs7Ozs7Ozs7QUFTRCwyQkFBbUIsRUFBRSw2QkFBUyxTQUFTLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRTtBQUM1RCxnQkFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDOztBQUV0QixnQkFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVoQixnQkFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxVQUFTLFFBQVEsRUFBRTt1Q0FDMUMsSUFBSTtBQUNULHdCQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFTLFNBQVMsRUFBRTtBQUNqRSxvQ0FBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQzs7QUFFekMsNEJBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEtBQUssUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUN0RCxvQ0FBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO3lCQUMxQjtxQkFDSixDQUFDLENBQUM7OztBQVBQLHFCQUFLLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRTsyQkFBMUMsSUFBSTtpQkFRWjthQUNKLEVBQUUsV0FBVyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQXdCbkI7Ozs7OztBQU1ELHlCQUFpQixFQUFFLDJCQUFTLFFBQVEsRUFBRTtBQUNsQyxnQkFBSSxXQUFXLEdBQUksSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxBQUFDLENBQUM7QUFDdEQsZ0JBQUksWUFBWSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRWhELHdCQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFTLFFBQVEsRUFBRTtBQUMxQyx3QkFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQzVCLENBQUMsQ0FBQztTQUNOOzs7Ozs7O0FBT0QseUJBQWlCLEVBQUUsMkJBQVMsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUM3QyxnQkFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDOztBQUV0QixnQkFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVoQixnQkFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVMsY0FBYyxFQUFFO0FBQzVDLDRCQUFZLEdBQUcsY0FBYyxDQUFDO0FBQzlCLG9CQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxVQUFTLGNBQWMsRUFBRTtBQUNsRCx3QkFBSSxhQUFhLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQzs7QUFFM0Msd0JBQUksYUFBYSxLQUFLLElBQUksRUFBRTtBQUN4Qiw2QkFBSyxJQUFJLFlBQVksSUFBSSxhQUFhLEVBQUU7QUFDcEMsZ0NBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxFQUFFO0FBQzVDLDRDQUFZLENBQUMsWUFBWSxDQUFDLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDOzZCQUM1RDt5QkFDSjs7QUFFRCw0QkFBSSxhQUFhLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ3ZDLGlDQUFLLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUU7O0FBRTFELG9DQUFJLGFBQWEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssT0FBTyxFQUFFO0FBQ2xHLHdDQUFJLFVBQVUsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUzQyx3Q0FBSSxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUMvQyxvREFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7cUNBQ3ZDO2lDQUNKOzZCQUNKO3lCQUNKLE1BQU07QUFDSCx5Q0FBYSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7eUJBQzVCO3FCQUNKOztBQUVELDRCQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQzFCLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2FBQ25CLENBQUMsQ0FBQztTQUNOOzs7Ozs7Ozs7QUFTRCxrQkFBVSxFQUFFLG9CQUFTLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRTs7Ozs7O0FBTTFELGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWhCLGdCQUFJLENBQUMsWUFBWSxDQUFDLFVBQVMsU0FBUyxFQUFFO0FBQ2xDLG9CQUFJLFNBQVMsSUFBSSxDQUFDLEVBQUU7O0FBQ2hCLDRCQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxHQUFHLENBQUM7O0FBRTdDLDRCQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLFVBQVMsY0FBYyxFQUFFO0FBQ3ZELDBDQUFjLENBQUMsY0FBYyxHQUFJLGNBQWMsQ0FBQyxjQUFjLEtBQUssU0FBUyxHQUFHLEVBQUUsR0FBRyxjQUFjLENBQUMsY0FBYyxBQUFDLENBQUM7O0FBRW5ILGdDQUFJLGNBQWMsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtBQUNqRCxvQ0FBSSxjQUFjLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUN6RCw0Q0FBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2lDQUM5Qzs2QkFDSjs7QUFFRCxnQ0FBSSxjQUFjLEdBQUcsRUFBRSxDQUFDOztBQUV4QixpQ0FBSyxJQUFJLEtBQUssSUFBSSxTQUFTLEVBQUU7QUFDekIsb0NBQUksY0FBYyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN0Qyx3Q0FBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRWxCLHdDQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFO0FBQzlDLGdEQUFRLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztxQ0FDeEMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFO0FBQ3JELGdEQUFRLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQTtxQ0FDdkMsTUFBTTtBQUNILGdEQUFRLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO3FDQUMvQjs7QUFFRCxrREFBYyxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQztpQ0FDcEM7NkJBQ0o7O0FBRUQsbUNBQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRTVCLGdDQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxVQUFTLGlCQUFpQixFQUFFO0FBQ25FLGlEQUFpQixHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQzs7QUFFN0MsOENBQWMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUU5QyxvQ0FBSSxXQUFXLEdBQUc7QUFDZCxrREFBYyxFQUFFLGNBQWMsQ0FBQyxjQUFjO2lDQUNoRCxDQUFDOztBQUVGLG9DQUFJLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUM1Qyx3Q0FBSSx3QkFBd0IsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7O0FBRXhELHdDQUFJLFdBQVcsR0FBRyxjQUFjLENBQUM7O0FBRWpDLHlDQUFLLElBQUksVUFBVSxJQUFJLFdBQVcsRUFBRTtBQUNoQyw0Q0FBSSxjQUFjLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQzNDLG1EQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsQ0FBQzs7QUFFdkMsZ0RBQUksV0FBVyxHQUFHO0FBQ2QsbURBQUcsRUFBRyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxTQUFTLEdBQUcsQ0FBQyxHQUFHLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQUFBQztBQUN4RyxxREFBSyxFQUFHLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxLQUFLLFNBQVMsR0FBRyxDQUFDLEdBQUcsd0JBQXdCLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxBQUFDOzZDQUMvRyxDQUFDOztBQUVGLGdEQUFJLFdBQVcsQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDN0MsMkRBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLDJEQUFXLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQzs2Q0FDdkI7O0FBRUQsdURBQVcsQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbkUsdURBQVcsQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLEtBQUssR0FBSSxjQUFjLENBQUMsY0FBYyxDQUFDLE1BQU0sQUFBQyxDQUFDOztBQUU3RSx1REFBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLFdBQVcsQ0FBQzt5Q0FDekM7cUNBQ0o7aUNBQ0o7O0FBRUQsdUNBQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRXpCLG9DQUFJLEtBQUssR0FBRyxBQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FDekMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FDbEMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FDL0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFckMscUNBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFVBQVMsS0FBSyxFQUFFO0FBQ25DLHdDQUFJLEtBQUssRUFBRTtBQUNQLDRDQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3hCLCtDQUFPO3FDQUNWOztBQUVELDRDQUFRLEVBQUUsQ0FBQztpQ0FDZCxDQUFDLENBQUM7NkJBQ04sRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7eUJBQ2xCLENBQUMsQ0FBQzs7aUJBQ04sTUFBTTtBQUNILDRCQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2lCQUMxQzthQUNKLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsRUFBRyxDQUFDOzs7OztBQy9mTCxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsbUNBQW1DLENBQUMsQ0FBQztBQUN2RCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs7QUFFOUMsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDckMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUzRCxJQUFJLE1BQU0sR0FBRztBQUNULFNBQUssRUFBRSxHQUFHO0FBQ1YsVUFBTSxFQUFFLEdBQUc7Q0FDZCxDQUFDOztBQUVGLFNBQVMsZUFBZSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQzdDLFlBQVEsQ0FBQyxNQUFNLENBQ1gsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUNKLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUMvQixJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQ1gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDdkIsSUFBSSxDQUFDLE1BQU0sY0FBWSxJQUFJLENBQUcsQ0FDOUIsS0FBSyxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQ1osWUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxnQkFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLGNBQVksSUFBSSxDQUFHLENBQUM7QUFDOUMsZUFBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztLQUNuRCxDQUFDLENBQ0wsQ0FDUixDQUFDO0NBQ0w7O0FBRUQsSUFBSSxnQkFBZ0IsR0FBRztBQUNuQixRQUFJLEVBQUEsY0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQ2YsWUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdEgsYUFBSyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFO0FBQ2xELDJCQUFlLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztTQUMzQztBQUNELFlBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdEIsZ0JBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNuQjtBQUNELFVBQU0sRUFBQSxnQkFBQyxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQ2pCLGVBQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDNUIsWUFBSSxDQUFDLE1BQU0sQ0FDUCxDQUFDLENBQUMsS0FBSyxDQUFDLENBQ0gsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUN2QixNQUFNLENBQ0gsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNkLGtCQUFNLEVBQUUsT0FBTztBQUNmLGlCQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUc7QUFDakIsaUJBQUssRUFBRSxNQUFNLENBQUMsR0FBRztBQUNqQixtQkFBTyxFQUFFLE1BQU0sQ0FBQyxHQUFHO0FBQ25CLGtCQUFNLEVBQUUsQ0FBQztTQUNaLENBQUMsQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUM1RixDQUNSLENBQUM7S0FDTDtDQUNKLENBQUE7O0FBRUQsSUFBSSxvQkFBb0IsR0FBRyxTQUF2QixvQkFBb0IsQ0FBWSxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQzlDLFFBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FDaEIsTUFBTSxDQUNILENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQ2hELFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUN6QyxDQUFDLFFBQVEsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDOztBQUU3RCxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXJDLFdBQU8sSUFBSSxDQUFDO0NBQ2YsQ0FBQzs7QUFFRixJQUFJLFNBQVMsR0FBRyxTQUFaLFNBQVMsR0FBYztBQUN2QixRQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7QUFDakIsU0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0tBQzFELE1BQU07QUFDSCxTQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxlQUFhLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLDZCQUEwQixDQUFDO0tBQ3ZHOztBQUVELE9BQUcsQ0FBQyxZQUFZLENBQUMsVUFBUyxTQUFTLEVBQUU7O0FBRWpDLGVBQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRXZCLFlBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUM1RSxpQkFBSyxDQUFDLHVFQUF1RSxDQUFDLENBQUM7QUFDL0Usa0JBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDekIsTUFBTTtBQUNILGdCQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDckQsZ0JBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7O0FBRTlCLGdCQUFJLFNBQVMsdUVBQXFFLE9BQU8sd0RBQW1ELE1BQU0sQ0FBQyxLQUFLLGdCQUFXLE1BQU0sQ0FBQyxNQUFNLEFBQUUsQ0FBQzs7QUFFbkwsYUFBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FDaEIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxBQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFJLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FDMUcsQ0FBQzs7QUFFRixnQkFBSSxTQUFTLElBQUksQ0FBQyxFQUFFO29CQUNaLGtCQUFrQjs7O0FBQWxCLHNDQUFrQixHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQzs7QUFFOUMsd0JBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0Msc0NBQWtCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUV2Qyx1QkFBRyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxVQUFTLE9BQU8sRUFBRTtBQUMvQywrQkFBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFckIsNkJBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRTtBQUNwRCxnQ0FBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFckMsZ0NBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsZ0NBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUM1QywwQ0FBVSxHQUFHLE1BQU0sQ0FBQzs2QkFDdkIsTUFBTTtBQUNILDBDQUFVLEdBQUcsUUFBUSxDQUFDOzZCQUN6Qjs7QUFFRCxtQ0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7O0FBRTVDLHVDQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDOztBQUUxRSxnQ0FBSSxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUNuQywyQ0FBVyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekMsa0RBQWtCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDOzZCQUMxQzt5QkFDSjtxQkFDSixDQUFDLENBQUM7O2FBQ04sTUFBTTtBQUNILGlCQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDMUI7U0FDSjtLQUNKLENBQUMsQ0FBQzs7QUFFSCxPQUFHLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDMUMsU0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksZUFBYSxJQUFJLENBQUMsSUFBSSxDQUFHLENBQUM7S0FDcEQsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Q0FDaEIsQ0FBQzs7QUFFRixTQUFTLEVBQUUsQ0FBQzs7QUFFWixDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFTLEdBQUcsRUFBRTtBQUNwQyxPQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRXJCLFFBQUksTUFBTSxLQUFLLElBQUksRUFBRTtBQUNqQixXQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDdEIsTUFBTTtBQUNILFdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDMUI7Q0FDSixDQUFDLENBQUM7O0FBRUgsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFDLEdBQUcsRUFBSztBQUM1QyxPQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRXJCLFFBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRTVCLEtBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDMUQsS0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRXRFLFFBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQzs7QUFFbkIsS0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVMsS0FBSyxFQUFFLElBQUksRUFBRTtBQUM3QyxZQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsWUFBSSxVQUFVLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztBQUV2RCxlQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUV4QixZQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7QUFDMUIsZ0JBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUM5RCxvQkFBSSxhQUFhLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFakQseUJBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3pGLE1BQU0sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ3BFLHlCQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUM1RDtTQUNKO0tBQ0osQ0FBQyxDQUFDOztBQUVILE9BQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxVQUFTLEtBQUssRUFBRTtBQUMxRSxZQUFJLEtBQUssRUFBRTtBQUNQLGlCQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDYixtQkFBTztTQUNWOztBQUVELFNBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUNyQyxDQUFDLENBQUM7Q0FDTixDQUFDLENBQUM7O0FBRUgsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFNO0FBQ3pDLEtBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztDQUNoRSxDQUFDLENBQUM7O0FBRUgsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFNO0FBQzNDLFVBQU0sQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyRCxVQUFNLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRXZELFdBQU8sQ0FBQyxHQUFHLHFFQUFtRSxTQUFTLENBQUMsS0FBSyx3REFBbUQsTUFBTSxDQUFDLEtBQUssZ0JBQVcsTUFBTSxDQUFDLE1BQU0sQ0FBRyxDQUFDOztBQUV4TCxLQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssc0VBQW9FLFNBQVMsQ0FBQyxLQUFLLHdEQUFtRCxNQUFNLENBQUMsS0FBSyxnQkFBVyxNQUFNLENBQUMsTUFBTSxDQUFHLENBQUM7Q0FDN00sQ0FBQyxDQUFDOzs7OztBQ2hNSCxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsWUFBVztBQUN6QixXQUFPOzs7Ozs7OztBQVFILGlCQUFTLEVBQUUsbUJBQVMsVUFBVSxFQUFFOztBQUU1QixzQkFBVSxHQUFHLFVBQVUsR0FBRyxHQUFHLENBQUM7O0FBRTlCLGdCQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QyxpQkFBSyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFHLEVBQUU7QUFDbEQsb0JBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyx1QkFBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQ3pCLDZCQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdEM7O0FBRUQsb0JBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDckMsMkJBQU8sU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDbkU7YUFDSjs7QUFFRCxtQkFBTyxFQUFFLENBQUM7U0FDYjs7Ozs7Ozs7QUFRRCxpQkFBUyxFQUFFLG1CQUFTLFVBQVUsRUFBRSxLQUFLLEVBQUU7O0FBRW5DLGdCQUFJLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ25CLGFBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLEFBQUMsQ0FBQyxDQUFDO0FBQ3BELGdCQUFJLE9BQU8sR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNDLG9CQUFRLENBQUMsTUFBTSxHQUFHLFVBQVUsR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxPQUFPLENBQUM7U0FDL0Q7Ozs7OztBQU1ELG9CQUFZLEVBQUUsc0JBQVMsR0FBRyxFQUFFO0FBQ3hCLGdCQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7O0FBRW5CLGdCQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVqQyxnQkFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQ3hCLG9CQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUV2QyxxQkFBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDdEQsd0JBQUksWUFBWSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFdkMsNkJBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDN0QsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztpQkFDN0I7YUFDSjs7QUFFRCxtQkFBTyxTQUFTLENBQUM7U0FDcEI7S0FDSixDQUFDO0NBQ0wsQ0FBQSxFQUFHLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF3aW5kb3cualF1ZXJ5IHx8ICF3aW5kb3cuRmlyZWJhc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgdmFyaWFibGUgaXMgdXNlZCB0byBzdG9yZSBvdXIgXCJGaXJlYmFzZSBLZXlcIlxuICAgIGxldCBGSVJFQkFTRV9LRVkgPSBcImh0dHBzOi8vY29udGVzdC1qdWRnaW5nLXN5cy5maXJlYmFzZWlvLmNvbVwiO1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyB2YXJpYWJsZSBpcyB1c2VkIHRvIHNwZWNpZnkgdGhlIGRlZmF1bHQgbnVtYmVyIG9mIGVudHJpZXMgdG8gZmV0Y2hcbiAgICBsZXQgREVGX05VTV9FTlRSSUVTX1RPX0xPQUQgPSAxMDtcblxuICAgIC8vIEVycm9yIG1lc3NhZ2VzLlxuICAgIGxldCBFUlJPUl9NRVNTQUdFUyA9IHtcbiAgICAgICAgRVJSX05PVF9KVURHRTogXCJFcnJvcjogWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8ganVkZ2UgY29udGVzdCBlbnRyaWVzLlwiLFxuICAgICAgICBFUlJfQUxSRUFEWV9WT1RFRDogXCJFcnJvcjogWW91J3ZlIGFscmVhZHkganVkZ2VkIHRoaXMgZW50cnkuXCJcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVwb3J0RXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgZmV0Y2hGaXJlYmFzZUF1dGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpLmdldEF1dGgoKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25jZUF1dGhlZDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpLm9uQXV0aChjYWxsYmFjaywgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhdXRoZW50aWNhdGUobG9nb3V0KVxuICAgICAgICAgKiBJZiBsb2dvdXQgaXMgZmFsc2UgKG9yIHVuZGVmaW5lZCksIHdlIHJlZGlyZWN0IHRvIGEgZ29vZ2xlIGxvZ2luIHBhZ2UuXG4gICAgICAgICAqIElmIGxvZ291dCBpcyB0cnVlLCB3ZSBpbnZva2UgRmlyZWJhc2UncyB1bmF1dGggbWV0aG9kICh0byBsb2cgdGhlIHVzZXIgb3V0KSwgYW5kIHJlbG9hZCB0aGUgcGFnZS5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtCb29sZWFufSBsb2dvdXQqOiBTaG91bGQgd2UgbG9nIHRoZSB1c2VyIG91dD8gKERlZmF1bHRzIHRvIGZhbHNlKVxuICAgICAgICAgKi9cbiAgICAgICAgYXV0aGVudGljYXRlOiBmdW5jdGlvbihsb2dvdXQgPSBmYWxzZSkge1xuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIGlmICghbG9nb3V0KSB7XG4gICAgICAgICAgICAgICAgZmlyZWJhc2VSZWYuYXV0aFdpdGhPQXV0aFJlZGlyZWN0KFwiZ29vZ2xlXCIsIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVJlZi51bmF1dGgoKTtcblxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldFBlcm1MZXZlbCgpXG4gICAgICAgICAqIEdldHMgdGhlIHBlcm0gbGV2ZWwgb2YgdGhlIHVzZXIgdGhhdCBpcyBjdXJyZW50bHkgbG9nZ2VkIGluLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIHJlY2lldmVkIHRoZSBkYXRhLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0UGVybUxldmVsOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgbGV0IGF1dGhEYXRhID0gdGhpcy5mZXRjaEZpcmViYXNlQXV0aCgpO1xuXG4gICAgICAgICAgICBpZiAoYXV0aERhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcbiAgICAgICAgICAgICAgICBsZXQgdGhpc1VzZXJDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwidXNlcnNcIikuY2hpbGQoYXV0aERhdGEudWlkKTtcblxuICAgICAgICAgICAgICAgIHRoaXNVc2VyQ2hpbGQub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNuYXBzaG90LnZhbCgpLnBlcm1MZXZlbCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0RW50cnkoY29udGVzdElkLCBlbnRyeUlkLCBjYWxsYmFjaywgcHJvcGVydGllcylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgdGhlIGVudHJ5IHdlIHdhbnQgdG8gbG9hZCBkYXRhIGZvciByZXNpZGVzIHVuZGVyXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBlbnRyeUlkOiBUaGUgSUQgb2YgdGhlIGNvbnRlc3QgZW50cnkgdGhhdCB3ZSB3YW50IHRvIGxvYWQgZGF0YSBmb3JcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIG9mIHRoZSByZXF1aXJlZCBkYXRhXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IHByb3BlcnRpZXMqOiBBIGxpc3Qgb2YgYWxsIHRoZSBwcm9wZXJ0aWVzIHRoYXQgeW91IHdhbnQgdG8gbG9hZCBmcm9tIHRoaXMgY29udGVzdCBlbnRyeVxuICAgICAgICAgKi9cbiAgICAgICAgZmV0Y2hDb250ZXN0RW50cnk6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2ssIHByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IGNvbnRlc3RDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKTtcbiAgICAgICAgICAgIGxldCBlbnRyeUNoaWxkID0gY29udGVzdENoaWxkLmNoaWxkKFwiZW50cmllc1wiKS5jaGlsZChlbnRyeUlkKTtcblxuICAgICAgICAgICAgbGV0IHJlcXVpcmVkUHJvcHMgPSAocHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gW1wiaWRcIiwgXCJuYW1lXCIsIFwidGh1bWJcIl0gOiBwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHt9O1xuXG4gICAgICAgICAgICBmb3IgKGxldCBwcm9wSW5kID0gMDsgcHJvcEluZCA8IHJlcXVpcmVkUHJvcHMubGVuZ3RoOyBwcm9wSW5kKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgY3VyclByb3AgPSByZXF1aXJlZFByb3BzW3Byb3BJbmRdO1xuXG4gICAgICAgICAgICAgICAgZW50cnlDaGlsZC5jaGlsZChjdXJyUHJvcCkub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtjdXJyUHJvcF0gPSBzbmFwc2hvdC52YWwoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IHJlcXVpcmVkUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmZXRjaENvbnRlc3QoY29udGVzdElkLCBjYWxsYmFjaywgcHJvcGVydGllcylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgeW91IHdhbnQgdG8gbG9hZCBkYXRhIGZvclxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIHJlY2VpdmVkIHRoZSBkYXRhLlxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBwcm9wZXJ0aWVzKjogQSBsaXN0IG9mIGFsbCB0aGUgcHJvcGVydGllcyB0aGF0IHlvdSB3YW50IHRvIGxvYWQgZnJvbSB0aGlzIGNvbnRlc3QuXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3Q6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2ssIHByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IGNvbnRlc3RDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKTtcblxuICAgICAgICAgICAgLy8gUHJvcGVydGllcyB0aGF0IHdlIG11c3QgaGF2ZSBiZWZvcmUgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIGxldCByZXF1aXJlZFByb3BzID0gKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IFtcImlkXCIsIFwibmFtZVwiLCBcImRlc2NcIiwgXCJpbWdcIiwgXCJlbnRyeUNvdW50XCJdIDogcHJvcGVydGllcyk7XG5cbiAgICAgICAgICAgIC8vIFRoZSBvYmplY3QgdGhhdCB3ZSBwYXNzIGludG8gb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0ge307XG5cbiAgICAgICAgICAgIGZvciAobGV0IHByb3BJbmQgPSAwOyBwcm9wSW5kIDwgcmVxdWlyZWRQcm9wcy5sZW5ndGg7IHByb3BJbmQrKykge1xuICAgICAgICAgICAgICAgIGxldCBjdXJyUHJvcCA9IHJlcXVpcmVkUHJvcHNbcHJvcEluZF07XG5cbiAgICAgICAgICAgICAgICBjb250ZXN0Q2hpbGQuY2hpbGQoY3VyclByb3ApLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbY3VyclByb3BdID0gc25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0cyhjYWxsYmFjaylcbiAgICAgICAgICogRmV0Y2hlcyBhbGwgY29udGVzdHMgdGhhdCdyZSBiZWluZyBzdG9yZWQgaW4gRmlyZWJhc2UsIGFuZCBwYXNzZXMgdGhlbSBpbnRvIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgY2FwdHVyZWQgYWxsIHRoZSBkYXRhIHRoYXQgd2UgbmVlZC5cbiAgICAgICAgICogQHRvZG8gKEdpZ2FieXRlIEdpYW50KTogQWRkIGJldHRlciBjb21tZW50cyFcbiAgICAgICAgICovXG4gICAgICAgIGZldGNoQ29udGVzdHM6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0S2V5c0NoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0S2V5c1wiKTtcbiAgICAgICAgICAgIGxldCBjb250ZXN0c0NoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKTtcblxuICAgICAgICAgICAgLy8gUHJvcGVydGllcyB0aGF0IHdlIG11c3QgaGF2ZSBiZWZvcmUgd2UgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIGxldCByZXF1aXJlZFByb3BzID0gW1xuICAgICAgICAgICAgICAgIFwiaWRcIixcbiAgICAgICAgICAgICAgICBcIm5hbWVcIixcbiAgICAgICAgICAgICAgICBcImRlc2NcIixcbiAgICAgICAgICAgICAgICBcImltZ1wiLFxuICAgICAgICAgICAgICAgIFwiZW50cnlDb3VudFwiXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAvLyBrZXlzV2VGb3VuZCBob2xkcyBhIGxpc3Qgb2YgYWxsIG9mIHRoZSBjb250ZXN0IGtleXMgdGhhdCB3ZSd2ZSBmb3VuZCBzbyBmYXJcbiAgICAgICAgICAgIHZhciBrZXlzV2VGb3VuZCA9IFsgXTtcblxuICAgICAgICAgICAgLy8gY2FsbGJhY2tEYXRhIGlzIHRoZSBvYmplY3QgdGhhdCBnZXRzIHBhc3NlZCBpbnRvIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHsgfTtcblxuICAgICAgICAgICAgLy8gXCJRdWVyeVwiIG91ciBjb250ZXN0S2V5c0NoaWxkXG4gICAgICAgICAgICBjb250ZXN0S2V5c0NoaWxkLm9yZGVyQnlLZXkoKS5vbihcImNoaWxkX2FkZGVkXCIsIGZ1bmN0aW9uKGZiSXRlbSkge1xuICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgY3VycmVudCBrZXkgdG8gb3VyIFwia2V5c1dlRm91bmRcIiBhcnJheVxuICAgICAgICAgICAgICAgIGtleXNXZUZvdW5kLnB1c2goZmJJdGVtLmtleSgpKTtcblxuICAgICAgICAgICAgICAgIGxldCB0aGlzQ29udGVzdCA9IGNvbnRlc3RzQ2hpbGQuY2hpbGQoZmJJdGVtLmtleSgpKTtcblxuICAgICAgICAgICAgICAgIHZhciB0aGlzQ29udGVzdERhdGEgPSB7IH07XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwcm9wSW5kID0gMDsgcHJvcEluZCA8IHJlcXVpcmVkUHJvcHMubGVuZ3RoOyBwcm9wSW5kKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJQcm9wZXJ0eSA9IHJlcXVpcmVkUHJvcHNbcHJvcEluZF07XG4gICAgICAgICAgICAgICAgICAgIHRoaXNDb250ZXN0LmNoaWxkKGN1cnJQcm9wZXJ0eSkub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKGZiU25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNDb250ZXN0RGF0YVtjdXJyUHJvcGVydHldID0gZmJTbmFwc2hvdC52YWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyAoR2lnYWJ5dGUgR2lhbnQpOiBHZXQgcmlkIG9mIGFsbCB0aGlzIG5lc3RlZCBcImNyYXBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXNDb250ZXN0RGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtmYkl0ZW0ua2V5KCldID0gdGhpc0NvbnRlc3REYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSBrZXlzV2VGb3VuZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0RW50cmllcyhjb250ZXN0SWQsIGNhbGxiYWNrKVxuICAgICAgICAgKlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgS2hhbiBBY2FkZW15IHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSB3YW50IHRvIGZldGNoIGVudHJpZXMgZm9yLlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBhZnRlciB3ZSd2ZSBmZXRjaGVkIGFsbCB0aGUgZGF0YSB0aGF0IHdlIG5lZWQuXG4gICAgICAgICAqIEBwYXJhbSB7SW50ZWdlcn0gbG9hZEhvd01hbnkqOiBUaGUgbnVtYmVyIG9mIGVudHJpZXMgdG8gbG9hZC4gSWYgbm8gdmFsdWUgaXMgcGFzc2VkIHRvIHRoaXMgcGFyYW1ldGVyLFxuICAgICAgICAgKiAgZmFsbGJhY2sgb250byBhIGRlZmF1bHQgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3RFbnRyaWVzOiBmdW5jdGlvbihjb250ZXN0SWQsIGNhbGxiYWNrLCBsb2FkSG93TWFueSA9IERFRl9OVU1fRU5UUklFU19UT19MT0FEKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdmFsaWQgY2FsbGJhY2sgZnVuY3Rpb24sIGV4aXQgdGhlIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZXMgdG8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCB0aGlzQ29udGVzdFJlZiA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKTtcbiAgICAgICAgICAgIGxldCBjb250ZXN0RW50cmllc1JlZiA9IHRoaXNDb250ZXN0UmVmLmNoaWxkKFwiZW50cnlLZXlzXCIpO1xuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgZW50cmllcyB3ZSd2ZSBsb2FkZWRcbiAgICAgICAgICAgIHZhciBudW1Mb2FkZWQgPSAwO1xuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHN0b3JlIGVhY2ggb2YgdGhlIGVudHJpZXMgdGhhdCB3ZSd2ZSBsb2FkZWRcbiAgICAgICAgICAgIHZhciBlbnRyeUtleXMgPSBbIF07XG5cbiAgICAgICAgICAgIGNvbnRlc3RFbnRyaWVzUmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihmYlNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgbGV0IHRtcEVudHJ5S2V5cyA9IGZiU25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmVuJ3QgYXQgbGVhc3QgXCJuXCIgZW50cmllcyBmb3IgdGhpcyBjb250ZXN0LCBsb2FkIGFsbCBvZiB0aGVtLlxuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0bXBFbnRyeUtleXMpLmxlbmd0aCA8IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIb3dNYW55ID0gT2JqZWN0LmtleXModG1wRW50cnlLZXlzKS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKG51bUxvYWRlZCA8IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE9iamVjdC5rZXlzKHRtcEVudHJ5S2V5cykubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkS2V5ID0gT2JqZWN0LmtleXModG1wRW50cnlLZXlzKVtyYW5kb21JbmRleF07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJ5S2V5cy5pbmRleE9mKHNlbGVjdGVkS2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5S2V5cy5wdXNoKHNlbGVjdGVkS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bUxvYWRlZCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcy5yZXBvcnRFcnJvcik7XG5cbiAgICAgICAgICAgIGxldCBjYWxsYmFja1dhaXQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVtTG9hZGVkID09PSBsb2FkSG93TWFueSkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhbGxiYWNrV2FpdCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVudHJ5S2V5cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsb2FkQ29udGVzdEVudHJ5KGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2spXG4gICAgICAgICAqIExvYWRzIGEgY29udGVzdCBlbnRyeSAod2hpY2ggaXMgc3BlY2lmaWVkIHZpYSBwcm92aWRpbmcgYSBjb250ZXN0IGlkIGFuZCBhbiBlbnRyeSBpZCkuXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgdGhpcyBlbnRyeSByZXNpZGVzIHVuZGVyLlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZW50cnlJZDogVGhlIHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGVudHJ5LlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgdGhlIHJlcXVpcmVkIGRhdGEuXG4gICAgICAgICAqIEB0b2RvIChHaWdhYnl0ZSBHaWFudCk6IEFkZCBhdXRoZW50aWNhdGlvbiB0byB0aGlzIGZ1bmN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBsb2FkQ29udGVzdEVudHJ5OiBmdW5jdGlvbihjb250ZXN0SWQsIGVudHJ5SWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdmFsaWQgY2FsbGJhY2sgZnVuY3Rpb24sIGV4aXQgdGhlIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZXMgdG8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0UmVmID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKS5jaGlsZChjb250ZXN0SWQpO1xuICAgICAgICAgICAgbGV0IGVudHJpZXNSZWYgPSBjb250ZXN0UmVmLmNoaWxkKFwiZW50cmllc1wiKS5jaGlsZChlbnRyeUlkKTtcblxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldFBlcm1MZXZlbChmdW5jdGlvbihwZXJtTGV2ZWwpIHtcbiAgICAgICAgICAgICAgICAvLyBBIHZhcmlhYmxlIGNvbnRhaW5pbmcgYSBsaXN0IG9mIGFsbCB0aGUgcHJvcGVydGllcyB0aGF0IHdlIG11c3QgbG9hZCBiZWZvcmUgd2UgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICB2YXIgcmVxdWlyZWRQcm9wcyA9IFtcImlkXCIsIFwibmFtZVwiLCBcInRodW1iXCJdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBlcm1MZXZlbCA+PSA1KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkUHJvcHMucHVzaChcInNjb3Jlc1wiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUaGUgSlNPTiBvYmplY3QgdGhhdCB3ZSdsbCBwYXNzIGludG8gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHsgfTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVxdWlyZWRQcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcFJlZiA9IGVudHJpZXNSZWYuY2hpbGQocmVxdWlyZWRQcm9wc1tpXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcHJvcFJlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtyZXF1aXJlZFByb3BzW2ldXSA9IHNuYXBzaG90LnZhbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IHJlcXVpcmVkUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgc2VsZi5yZXBvcnRFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsb2FkWENvbnRlc3RFbnRyaWVzKGNvbnRlc3RJZCwgY2FsbGJhY2ssIGxvYWRIb3dNYW55KVxuICAgICAgICAgKiBMb2FkcyBcInhcIiBjb250ZXN0IGVudHJpZXMsIGFuZCBwYXNzZXMgdGhlbSBpbnRvIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgd2Ugd2FudCB0byBsb2FkIGVudHJpZXMgZnJvbS5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIHRoZSByZXF1aXJlZCBkYXRhLlxuICAgICAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IGxvYWRIb3dNYW55OiBUaGUgbnVtYmVyIG9mIGVudHJpZXMgdGhhdCB3ZSdkIGxpa2UgdG8gbG9hZC5cbiAgICAgICAgICovXG4gICAgICAgIGxvYWRYQ29udGVzdEVudHJpZXM6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2ssIGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0ge307XG5cbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5mZXRjaENvbnRlc3RFbnRyaWVzKGNvbnRlc3RJZCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBlSW5kID0gMDsgZUluZCA8IHJlc3BvbnNlLmxlbmd0aDsgZUluZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubG9hZENvbnRlc3RFbnRyeShjb250ZXN0SWQsIHJlc3BvbnNlW2VJbmRdLCBmdW5jdGlvbihlbnRyeURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtyZXNwb25zZVtlSW5kXV0gPSBlbnRyeURhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0gcmVzcG9uc2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgbG9hZEhvd01hbnkpO1xuXG4gICAgICAgICAgICAvLyBcInRoaXNcIiB3aWxsIGV2ZW50dWFsbHkgZ28gb3V0IG9mIHNjb3BlIChsYXRlciBvbiBpbiB0aGlzIGZ1bmN0aW9uKSxcbiAgICAgICAgICAgIC8vICB0aGF0J3Mgd2h5IHdlIGhhdmUgdGhpcyB2YXJpYWJsZS5cbiAgICAgICAgICAgIC8vIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgLy8gdGhpcy5mZXRjaENvbnRlc3RFbnRyaWVzKGNvbnRlc3RJZCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIC8vICAgICB2YXIgY2FsbGJhY2tEYXRhID0geyB9O1xuXG4gICAgICAgICAgICAvLyAgICAgZm9yIChsZXQgZW50cnlJZCA9IDA7IGVudHJ5SWQgPCByZXNwb25zZS5sZW5ndGg7IGVudHJ5SWQrKykge1xuICAgICAgICAgICAgLy8gICAgICAgICBsZXQgdGhpc0VudHJ5SWQgPSByZXNwb25zZVtlbnRyeUlkXTtcblxuICAgICAgICAgICAgLy8gICAgICAgICBzZWxmLmxvYWRDb250ZXN0RW50cnkoY29udGVzdElkLCB0aGlzRW50cnlJZCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVt0aGlzRW50cnlJZF0gPSByZXNwb25zZTtcbiAgICAgICAgICAgIC8vICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyAgICAgfVxuXG4gICAgICAgICAgICAvLyAgICAgbGV0IGNhbGxiYWNrV2FpdCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhbGxiYWNrV2FpdCk7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgICAgICAvLyAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICAvLyB9LCBsb2FkSG93TWFueSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXREZWZhdWx0UnVicmljcyhjYWxsYmFjaylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIHRoZSBkZWZhdWx0IHJ1YnJpY3NcbiAgICAgICAgICovXG4gICAgICAgIGdldERlZmF1bHRSdWJyaWNzOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG4gICAgICAgICAgICBsZXQgcnVicmljc0NoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJydWJyaWNzXCIpO1xuXG4gICAgICAgICAgICBydWJyaWNzQ2hpbGQub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soc25hcHNob3QudmFsKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXRDb250ZXN0UnVicmljcyhjb250ZXN0SWQsIGNhbGxiYWNrKVxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSB3YW50IHRvIGxvYWQgdGhlIHJ1YnJpY3MgZm9yXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgbG9hZGVkIGFsbCBvZiB0aGUgcnVicmljc1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0Q29udGVzdFJ1YnJpY3M6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7fTtcblxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldERlZmF1bHRSdWJyaWNzKGZ1bmN0aW9uKGRlZmF1bHRSdWJyaWNzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhID0gZGVmYXVsdFJ1YnJpY3M7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaENvbnRlc3QoY29udGVzdElkLCBmdW5jdGlvbihjb250ZXN0UnVicmljcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VzdG9tUnVicmljcyA9IGNvbnRlc3RSdWJyaWNzLnJ1YnJpY3M7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1c3RvbVJ1YnJpY3MgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGN1c3RvbVJ1YnJpYyBpbiBjdXN0b21SdWJyaWNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjYWxsYmFja0RhdGEuaGFzT3duUHJvcGVydHkoY3VzdG9tUnVicmljKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbY3VzdG9tUnVicmljXSA9IGN1c3RvbVJ1YnJpY3NbY3VzdG9tUnVicmljXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXN0b21SdWJyaWNzLmhhc093blByb3BlcnR5KFwiT3JkZXJcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBvSW5kID0gMDsgb0luZCA8IGN1c3RvbVJ1YnJpY3MuT3JkZXIubGVuZ3RoOyBvSW5kKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBjdXJyZW50IHJ1YnJpYyBpdGVtIGlzIGFjdHVhbGx5IGEgdmFsaWQgcnVicmljIGl0ZW0sIGFuZCBtYWtlIHN1cmUgaXQncyBub3QgdGhlIFwiT3JkZXJcIiBpdGVtLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VzdG9tUnVicmljcy5oYXNPd25Qcm9wZXJ0eShjdXN0b21SdWJyaWNzLk9yZGVyW29JbmRdKSAmJiBjdXN0b21SdWJyaWNzLk9yZGVyW29JbmRdICE9PSBcIk9yZGVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0aGlzUnVicmljID0gY3VzdG9tUnVicmljcy5PcmRlcltvSW5kXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrRGF0YS5PcmRlci5pbmRleE9mKHRoaXNSdWJyaWMpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YS5PcmRlci5wdXNoKHRoaXNSdWJyaWMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXN0b21SdWJyaWNzLk9yZGVyID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgIH0sIFtcInJ1YnJpY3NcIl0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBqdWRnZUVudHJ5KGNvbnRlc3RJZCwgZW50cnlJZCwgc2NvcmVEYXRhLCBjYWxsYmFjaylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgd2UncmUganVkZ2luZyBhbiBlbnRyeSBmb3JcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGVudHJ5SWQ6IFRoZSBJRCBvZiB0aGUgZW50cnkgdGhhdCB3ZSdyZSBqdWRnaW5nXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY29yZURhdGE6IFRoZSBzY29yaW5nIGRhdGFcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2UgYWZ0ZXIgd2UndmUgdmFsaWRhdGVkIHRoZSBzY29yZXMsIGFuZCBzdWJtaXR0ZWQgdGhlbS5cbiAgICAgICAgICovXG4gICAgICAgIGp1ZGdlRW50cnk6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgZW50cnlJZCwgc2NvcmVEYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgLy8gMDogQ2hlY2sgdGhlIHVzZXJzIHBlcm0gbGV2ZWwsIGlmIHRoZWlyIHBlcm1MZXZlbCBpc24ndCA+PSA0LCBleGl0LlxuICAgICAgICAgICAgLy8gMTogRmV0Y2ggdGhlIHJ1YnJpY3MgZm9yIHRoZSBjdXJyZW50IGNvbnRlc3QsIHRvIG1ha2Ugc3VyZSB3ZSdyZSBub3QgZG9pbmcgYW55dGhpbmcgZnVua3lcbiAgICAgICAgICAgIC8vIDI6IFZhbGlkYXRlIHRoZSBkYXRhIHRoYXQgd2FzIHN1Ym1pdHRlZCB0byB0aGUgZnVuY3Rpb25cbiAgICAgICAgICAgIC8vIDM6IFN1Ym1pdCB0aGUgZGF0YSB0byBGaXJlYmFzZVxuXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0UGVybUxldmVsKGZ1bmN0aW9uKHBlcm1MZXZlbCkge1xuICAgICAgICAgICAgICAgIGlmIChwZXJtTGV2ZWwgPj0gNCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGhpc0p1ZGdlID0gc2VsZi5mZXRjaEZpcmViYXNlQXV0aCgpLnVpZDtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLmdldENvbnRlc3RSdWJyaWNzKGNvbnRlc3RJZCwgZnVuY3Rpb24oY29udGVzdFJ1YnJpY3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkID0gKGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkID09PSB1bmRlZmluZWQgPyBbXSA6IGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRlc3RSdWJyaWNzLmhhc093blByb3BlcnR5KFwianVkZ2VzV2hvVm90ZWRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWQuaW5kZXhPZih0aGlzSnVkZ2UpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhFUlJPUl9NRVNTQUdFUy5FUlJfQUxSRUFEWV9WT1RFRCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc0p1ZGdlc1ZvdGUgPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgc2NvcmUgaW4gc2NvcmVEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRlc3RSdWJyaWNzLmhhc093blByb3BlcnR5KHNjb3JlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2NvcmVWYWwgPSAtMTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2NvcmVEYXRhW3Njb3JlXSA+IGNvbnRlc3RSdWJyaWNzW3Njb3JlXS5tYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlVmFsID0gY29udGVzdFJ1YnJpY3Nbc2NvcmVdLm1heDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzY29yZURhdGFbc2NvcmVdIDwgY29udGVzdFJ1YnJpY3Nbc2NvcmVdLm1pbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmVWYWwgPSBjb250ZXN0UnVicmljc1tzY29yZV0ubWluXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZVZhbCA9IHNjb3JlRGF0YVtzY29yZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzSnVkZ2VzVm90ZVtzY29yZV0gPSBzY29yZVZhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXNKdWRnZXNWb3RlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5mZXRjaENvbnRlc3RFbnRyeShjb250ZXN0SWQsIGVudHJ5SWQsIGZ1bmN0aW9uKGV4aXN0aW5nU2NvcmVEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdTY29yZURhdGEgPSBleGlzdGluZ1Njb3JlRGF0YS5zY29yZXM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZC5wdXNoKHRoaXNKdWRnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YVRvV3JpdGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGp1ZGdlc1dob1ZvdGVkOiBjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmdTY29yZURhdGEuaGFzT3duUHJvcGVydHkoXCJydWJyaWNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4aXN0aW5nUnVicmljSXRlbVNjb3JlcyA9IGV4aXN0aW5nU2NvcmVEYXRhLnJ1YnJpYztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBydWJyaWNJdGVtcyA9IGNvbnRlc3RSdWJyaWNzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHJ1YnJpY0l0ZW0gaW4gcnVicmljSXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzSnVkZ2VzVm90ZS5oYXNPd25Qcm9wZXJ0eShydWJyaWNJdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlIGl0ZW06IFwiICsgcnVicmljSXRlbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG1wU2NvcmVPYmogPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2ZzogKGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXSA9PT0gdW5kZWZpbmVkID8gMSA6IGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXS5hdmcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3VnaDogKGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXSA9PT0gdW5kZWZpbmVkID8gMSA6IGV4aXN0aW5nUnVicmljSXRlbVNjb3Jlc1tydWJyaWNJdGVtXS5yb3VnaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFUb1dyaXRlLmp1ZGdlc1dob1ZvdGVkLmxlbmd0aCAtIDEgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wU2NvcmVPYmoucm91Z2ggPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXBTY29yZU9iai5hdmcgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcFNjb3JlT2JqLnJvdWdoID0gdG1wU2NvcmVPYmoucm91Z2ggKyB0aGlzSnVkZ2VzVm90ZVtydWJyaWNJdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXBTY29yZU9iai5hdmcgPSB0bXBTY29yZU9iai5yb3VnaCAvIChjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZC5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVRvV3JpdGVbcnVicmljSXRlbV0gPSB0bXBTY29yZU9iajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGFUb1dyaXRlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmYlJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNoaWxkKFwiZW50cmllc1wiKS5jaGlsZChlbnRyeUlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2hpbGQoXCJzY29yZXNcIikuY2hpbGQoXCJydWJyaWNcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYlJlZi5zZXQoZGF0YVRvV3JpdGUsIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yZXBvcnRFcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1wic2NvcmVzXCJdKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soRVJST1JfTUVTU0FHRVMuRVJSX05PVF9KVURHRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcbiIsInZhciBDSlMgPSByZXF1aXJlKFwiLi4vYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzXCIpO1xudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vZ2VuZXJhbFB1cnBvc2UuanNcIik7XG5cbmxldCBmYkF1dGggPSBDSlMuZmV0Y2hGaXJlYmFzZUF1dGgoKTtcbmxldCB1cmxQYXJhbXMgPSBoZWxwZXJzLmdldFVybFBhcmFtcyh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbnZhciBzaXppbmcgPSB7XG4gICAgd2lkdGg6IDQwMCxcbiAgICBoZWlnaHQ6IDQwMFxufTtcblxuZnVuY3Rpb24gY3JlYXRlUnVicmljVGFiKCR0YWJMaXN0LCBydWJyaWMsIGtJbmQpIHtcbiAgICAkdGFiTGlzdC5hcHBlbmQoXG4gICAgICAgICQoXCI8bGk+XCIpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoXCJ0YWIgY29sIG9wdGlvbnMtdGFiXCIpXG4gICAgICAgICAgICAuYXR0cihcImRhdGEtc2NvcmUtdmFsdWVcIiwga0luZClcbiAgICAgICAgICAgIC5hcHBlbmQoJChcIjxhPlwiKVxuICAgICAgICAgICAgICAgIC50ZXh0KHJ1YnJpYy5rZXlzW2tJbmRdKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiaHJlZlwiLCBgcnVicmljLSR7a0luZH1gKVxuICAgICAgICAgICAgICAgIC5jbGljaygoZXZ0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCAkdGhpc0VsZW0gPSAkKGV2dC50b0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAkdGFiTGlzdC50YWJzKFwic2VsZWN0X3RhYlwiLCBgcnVicmljLSR7a0luZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJHRoaXNFbGVtLmF0dHIoXCJkYXRhLXNjb3JlLXZhbHVlXCIpKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgICk7XG59XG5cbmxldCBjb250cm9sRmFjdG9yaWVzID0ge1xuICAgIGtleXMocnVicmljLCBlbGVtKSB7XG4gICAgICAgIGxldCAkdGFiTGlzdCA9ICQoXCI8dWw+XCIpLmFkZENsYXNzKFwidGFicyBqdWRnaW5nLWNvbnRyb2wgb3B0aW9ucy1jb250cm9sXCIpLmF0dHIoXCJkYXRhLXJ1YnJpYy1pdGVtXCIsIHJ1YnJpYy5ydWJyaWNJdGVtKTtcbiAgICAgICAgZm9yIChsZXQga0luZCA9IDA7IGtJbmQgPCBydWJyaWMua2V5cy5sZW5ndGg7IGtJbmQrKykge1xuICAgICAgICAgICAgY3JlYXRlUnVicmljVGFiKCR0YWJMaXN0LCBydWJyaWMsIGtJbmQpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW0uYXBwZW5kKCR0YWJMaXN0KTtcbiAgICAgICAgJHRhYkxpc3QudGFicygpO1xuICAgIH0sXG4gICAgc2xpZGVyKHJ1YnJpYywgZWxlbSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkhleSBzbGlkZXJzIVwiKTtcbiAgICAgICAgZWxlbS5hcHBlbmQoXG4gICAgICAgICAgICAkKFwiPHA+XCIpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKFwicmFuZ2UtZmllbGRcIilcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgICAgICAgICAkKFwiPGlucHV0PlwiKS5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInJhbmdlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1pblwiOiBydWJyaWMubWluLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXhcIjogcnVicmljLm1heCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogcnVicmljLm1pbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3RlcFwiOiAxXG4gICAgICAgICAgICAgICAgICAgIH0pLmFkZENsYXNzKFwianVkZ2luZy1jb250cm9sIHNsaWRlci1jb250cm9sXCIpLmF0dHIoXCJkYXRhLXJ1YnJpYy1pdGVtXCIsIHJ1YnJpYy5ydWJyaWNJdGVtKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59XG5cbnZhciBjcmVhdGVKdWRnaW5nQ29udHJvbCA9IGZ1bmN0aW9uKHJ1YnJpYywgdHlwZSkge1xuICAgIHZhciBlbGVtID0gJChcIjxkaXY+XCIpXG4gICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAkKFwiPGg1PlwiKS50ZXh0KHJ1YnJpYy5ydWJyaWNJdGVtLnJlcGxhY2UoL1xcXy9nLCBcIiBcIikpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKFwianVkZ2luZy1jb250cm9sLXRpdGxlXCIpXG4gICAgICAgICkuYWRkQ2xhc3MoXCJjb2wgbDYgbTYgczEyIGp1ZGdpbmctY29udHJvbCBjZW50ZXItYWxpZ25cIik7XG5cbiAgICBjb250cm9sRmFjdG9yaWVzW3R5cGVdKHJ1YnJpYywgZWxlbSk7XG5cbiAgICByZXR1cm4gZWxlbTtcbn07XG5cbnZhciBzZXR1cFBhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoZmJBdXRoID09PSBudWxsKSB7XG4gICAgICAgICQoXCIjYXV0aEJ0blwiKS50ZXh0KFwiSGVsbG8sIGd1ZXN0ISBDbGljayBtZSB0byBsb2dpbi5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJChcIiNhdXRoQnRuXCIpLnRleHQoYFdlbGNvbWUsICR7Q0pTLmZldGNoRmlyZWJhc2VBdXRoKCkuZ29vZ2xlLmRpc3BsYXlOYW1lfSEgKE5vdCB5b3U/IENsaWNrIGhlcmUpYCk7XG4gICAgfVxuXG4gICAgQ0pTLmdldFBlcm1MZXZlbChmdW5jdGlvbihwZXJtTGV2ZWwpIHtcblxuICAgICAgICBjb25zb2xlLmxvZyh1cmxQYXJhbXMpO1xuXG4gICAgICAgIGlmICghdXJsUGFyYW1zLmhhc093blByb3BlcnR5KFwiY29udGVzdFwiKSB8fCAhdXJsUGFyYW1zLmhhc093blByb3BlcnR5KFwiZW50cnlcIikpIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiQ29udGVzdCBJRCBhbmQvb3IgRW50cnkgSUQgbm90IHNwZWNpZmllZC4gUmV0dXJuaW5nIHRvIHByZXZpb3VzIHBhZ2UuXCIpO1xuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkuYmFjaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGNvbnRlc3RJZCA9IHVybFBhcmFtcy5jb250ZXN0LnJlcGxhY2UoL1xcIy9nLCBcIlwiKTtcbiAgICAgICAgICAgIGxldCBlbnRyeUlkID0gdXJsUGFyYW1zLmVudHJ5O1xuXG4gICAgICAgICAgICBsZXQgaWZyYW1lVXJsID0gYGh0dHBzOi8vd3d3LmtoYW5hY2FkZW15Lm9yZy9jb21wdXRlci1wcm9ncmFtbWluZy9jb250ZXN0LWVudHJ5LyR7ZW50cnlJZH0vZW1iZWRkZWQ/YnV0dG9ucz1ubyZlZGl0b3I9eWVzJmF1dGhvcj1ubyZ3aWR0aD0ke3NpemluZy53aWR0aH0maGVpZ2h0PSR7c2l6aW5nLmhlaWdodH1gO1xuXG4gICAgICAgICAgICAkKFwiI3ByZXZpZXdcIikuYXBwZW5kKFxuICAgICAgICAgICAgICAgICQoXCI8aWZyYW1lPlwiKS5hdHRyKFwic3JjXCIsIGlmcmFtZVVybCkuY3NzKFwiaGVpZ2h0XCIsIChzaXppbmcuaGVpZ2h0ICsgMTApICsgXCJweFwiKS5hZGRDbGFzcyhcImVudHJ5LWZyYW1lXCIpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAocGVybUxldmVsID49IDQpIHtcbiAgICAgICAgICAgICAgICB2YXIganVkZ2luZ0NvbnRyb2xzQm94ID0gJChcIiNqdWRnaW5nQ29udHJvbHNcIik7XG5cbiAgICAgICAgICAgICAgICBsZXQgJGNvbnRyb2xSb3cgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJyb3dcIik7XG4gICAgICAgICAgICAgICAganVkZ2luZ0NvbnRyb2xzQm94LmFwcGVuZCgkY29udHJvbFJvdyk7XG5cbiAgICAgICAgICAgICAgICBDSlMuZ2V0Q29udGVzdFJ1YnJpY3MoY29udGVzdElkLCBmdW5jdGlvbihydWJyaWNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJ1YnJpY3MpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHJJbmQgPSAwOyBySW5kIDwgcnVicmljcy5PcmRlci5sZW5ndGg7IHJJbmQrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRoaXNSdWJyaWMgPSBydWJyaWNzLk9yZGVyW3JJbmRdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnVicmljVHlwZSA9IFwiXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydWJyaWNzW3RoaXNSdWJyaWNdLmhhc093blByb3BlcnR5KFwia2V5c1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1YnJpY1R5cGUgPSBcImtleXNcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVicmljVHlwZSA9IFwic2xpZGVyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1YnJpY3NbdGhpc1J1YnJpY10ucnVicmljSXRlbSA9IHRoaXNSdWJyaWM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRjb250cm9sUm93LmFwcGVuZChjcmVhdGVKdWRnaW5nQ29udHJvbChydWJyaWNzW3RoaXNSdWJyaWNdLCBydWJyaWNUeXBlKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkY29udHJvbFJvdy5jaGlsZHJlbigpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkY29udHJvbFJvdyA9ICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcInJvd1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqdWRnaW5nQ29udHJvbHNCb3guYXBwZW5kKCRjb250cm9sUm93KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKFwiLmp1ZGdlT25seVwiKS5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIENKUy5mZXRjaENvbnRlc3QodXJsUGFyYW1zLmNvbnRlc3QsIChkYXRhKSA9PiB7XG4gICAgICAgICQoXCIuY29udGVzdC1uYW1lXCIpLnRleHQoYEVudHJ5IGluICR7ZGF0YS5uYW1lfWApO1xuICAgIH0sIFtcIm5hbWVcIl0pO1xufTtcblxuc2V0dXBQYWdlKCk7XG5cbiQoXCIjYXV0aEJ0blwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2dCkge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgaWYgKGZiQXV0aCA9PT0gbnVsbCkge1xuICAgICAgICBDSlMuYXV0aGVudGljYXRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgQ0pTLmF1dGhlbnRpY2F0ZSh0cnVlKTtcbiAgICB9XG59KTtcblxuJChcIi5zdWJtaXQtc2NvcmUtY29udHJvbFwiKS5vbihcImNsaWNrXCIsIChldnQpID0+IHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGxldCBzZWxmID0gJChldnQudG9FbGVtZW50KTtcblxuICAgICQoc2VsZikuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKS50ZXh0KFwiU3VibWl0dGluZyBzY29yZXMuLi5cIik7XG4gICAgJChcIiNqdWRnaW5nQ29udHJvbHMgKlwiKS5wcm9wKFwiZGlzYWJsZWRcIiwgXCJ0cnVlXCIpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG5cbiAgICB2YXIgc2NvcmVEYXRhID0ge307XG5cbiAgICAkKFwiLmp1ZGdpbmctY29udHJvbFwiKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgIGxldCAkY29udHJvbEVsZW0gPSAkKGl0ZW0pO1xuICAgICAgICBsZXQgcnVicmljSXRlbSA9ICRjb250cm9sRWxlbS5hdHRyKFwiZGF0YS1ydWJyaWMtaXRlbVwiKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhydWJyaWNJdGVtKTtcblxuICAgICAgICBpZiAocnVicmljSXRlbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoJGNvbnRyb2xFbGVtLmF0dHIoXCJjbGFzc1wiKS5pbmRleE9mKFwib3B0aW9ucy1jb250cm9sXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGxldCAkc2VsZWN0ZWRJdGVtID0gJGNvbnRyb2xFbGVtLmZpbmQoXCIuYWN0aXZlXCIpO1xuXG4gICAgICAgICAgICAgICAgc2NvcmVEYXRhW3J1YnJpY0l0ZW1dID0gcGFyc2VJbnQoJHNlbGVjdGVkSXRlbS5wYXJlbnQoKS5hdHRyKFwiZGF0YS1zY29yZS12YWx1ZVwiKSwgMTApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgkY29udHJvbEVsZW0uYXR0cihcImNsYXNzXCIpLmluZGV4T2YoXCJzbGlkZXItY29udHJvbFwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzY29yZURhdGFbcnVicmljSXRlbV0gPSBwYXJzZUludCgkY29udHJvbEVsZW0udmFsKCksIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgQ0pTLmp1ZGdlRW50cnkodXJsUGFyYW1zLmNvbnRlc3QsIHVybFBhcmFtcy5lbnRyeSwgc2NvcmVEYXRhLCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFsZXJ0KGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICQoc2VsZikudGV4dChcIlNjb3JlcyBzdWJtaXR0ZWQhXCIpO1xuICAgIH0pO1xufSk7XG5cbiQoXCIucmVsb2FkLWVudHJ5LWNvbnRyb2xcIikub24oXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgJChcIi5lbnRyeS1mcmFtZVwiKS5hdHRyKFwic3JjXCIsICQoXCIuZW50cnktZnJhbWVcIikuYXR0cihcInNyY1wiKSk7XG59KTtcblxuJChcIi5zZXQtZGltZW5zaW9ucy1jb250cm9sXCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHNpemluZy53aWR0aCA9IHBhcnNlSW50KCQoXCJbbmFtZT13aWR0aF1cIikudmFsKCksIDEwKTtcbiAgICBzaXppbmcuaGVpZ2h0ID0gcGFyc2VJbnQoJChcIltuYW1lPWhlaWdodF1cIikudmFsKCksIDEwKTtcblxuICAgIGNvbnNvbGUubG9nKGBodHRwczovL3d3dy5raGFuYWNhZGVteS5vcmcvY29tcHV0ZXItcHJvZ3JhbW1pbmcvY29udGVzdC1lbnRyeS8ke3VybFBhcmFtcy5lbnRyeX0vZW1iZWRkZWQ/YnV0dG9ucz1ubyZlZGl0b3I9eWVzJmF1dGhvcj1ubyZ3aWR0aD0ke3NpemluZy53aWR0aH0maGVpZ2h0PSR7c2l6aW5nLmhlaWdodH1gKTtcblxuICAgICQoXCIuZW50cnktZnJhbWVcIikuYXR0cihcInNyY1wiLCBgaHR0cHM6Ly93d3cua2hhbmFjYWRlbXkub3JnL2NvbXB1dGVyLXByb2dyYW1taW5nL2NvbnRlc3QtZW50cnkvJHt1cmxQYXJhbXMuZW50cnl9L2VtYmVkZGVkP2J1dHRvbnM9bm8mZWRpdG9yPXllcyZhdXRob3I9bm8md2lkdGg9JHtzaXppbmcud2lkdGh9JmhlaWdodD0ke3NpemluZy5oZWlnaHR9YCk7XG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0Q29va2llKGNvb2tpZU5hbWUpXG4gICAgICAgICAqIEZldGNoZXMgdGhlIHNwZWNpZmllZCBjb29raWUgZnJvbSB0aGUgYnJvd3NlciwgYW5kIHJldHVybnMgaXQncyB2YWx1ZS5cbiAgICAgICAgICogQGF1dGhvciB3M3NjaG9vbHNcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvb2tpZU5hbWU6IFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdGhhdCB3ZSB3YW50IHRvIGZldGNoLlxuICAgICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBjb29raWVWYWx1ZTogVGhlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgY29va2llLCBvciBhbiBlbXB0eSBzdHJpbmcsIGlmIHRoZXJlIGlzIG5vIFwibm9uLWZhbHN5XCIgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICBnZXRDb29raWU6IGZ1bmN0aW9uKGNvb2tpZU5hbWUpIHtcbiAgICAgICAgICAgIC8vIEdldCB0aGUgY29va2llIHdpdGggbmFtZSBjb29raWUgKHJldHVybiBcIlwiIGlmIG5vbi1leGlzdGVudClcbiAgICAgICAgICAgIGNvb2tpZU5hbWUgPSBjb29raWVOYW1lICsgXCI9XCI7XG4gICAgICAgICAgICAvLyBDaGVjayBhbGwgb2YgdGhlIGNvb2tpZXMgYW5kIHRyeSB0byBmaW5kIHRoZSBvbmUgY29udGFpbmluZyBuYW1lLlxuICAgICAgICAgICAgdmFyIGNvb2tpZUxpc3QgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoXCI7XCIpO1xuICAgICAgICAgICAgZm9yICh2YXIgY0luZCA9IDA7IGNJbmQgPCBjb29raWVMaXN0Lmxlbmd0aDsgY0luZCArKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJDb29raWUgPSBjb29raWVMaXN0W2NJbmRdO1xuICAgICAgICAgICAgICAgIHdoaWxlIChjdXJDb29raWVbMF0gPT09IFwiIFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1ckNvb2tpZSA9IGN1ckNvb2tpZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIElmIHdlJ3ZlIGZvdW5kIHRoZSByaWdodCBjb29raWUsIHJldHVybiBpdHMgdmFsdWUuXG4gICAgICAgICAgICAgICAgaWYgKGN1ckNvb2tpZS5pbmRleE9mKGNvb2tpZU5hbWUpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJDb29raWUuc3Vic3RyaW5nKGNvb2tpZU5hbWUubGVuZ3RoLCBjdXJDb29raWUubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBPdGhlcndpc2UsIGlmIHRoZSBjb29raWUgZG9lc24ndCBleGlzdCwgcmV0dXJuIFwiXCJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogc2V0Q29va2llKGNvb2tpZU5hbWUsIHZhbHVlKVxuICAgICAgICAgKiBDcmVhdGVzL3VwZGF0ZXMgYSBjb29raWUgd2l0aCB0aGUgZGVzaXJlZCBuYW1lLCBzZXR0aW5nIGl0J3MgdmFsdWUgdG8gXCJ2YWx1ZVwiLlxuICAgICAgICAgKiBAYXV0aG9yIHczc2Nob29sc1xuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29va2llTmFtZTogVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0aGF0IHdlIHdhbnQgdG8gY3JlYXRlL3VwZGF0ZS5cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlOiBUaGUgdmFsdWUgdG8gYXNzaWduIHRvIHRoZSBjb29raWUuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRDb29raWU6IGZ1bmN0aW9uKGNvb2tpZU5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBTZXQgYSBjb29raWUgd2l0aCBuYW1lIGNvb2tpZSBhbmQgdmFsdWUgY29va2llIHRoYXQgd2lsbCBleHBpcmUgMzAgZGF5cyBmcm9tIG5vdy5cbiAgICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGQuc2V0VGltZShkLmdldFRpbWUoKSArICgzMCAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcbiAgICAgICAgICAgIHZhciBleHBpcmVzID0gXCJleHBpcmVzPVwiICsgZC50b1VUQ1N0cmluZygpO1xuICAgICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llTmFtZSArIFwiPVwiICsgdmFsdWUgKyBcIjsgXCIgKyBleHBpcmVzO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0VXJsUGFyYW1zKClcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHVybDogVGhlIFVSTCB0byBmZXRjaCBVUkwgcGFyYW1ldGVycyBmcm9tXG4gICAgICAgICAqL1xuICAgICAgICBnZXRVcmxQYXJhbXM6IGZ1bmN0aW9uKHVybCkge1xuICAgICAgICAgICAgdmFyIHVybFBhcmFtcyA9IHt9O1xuXG4gICAgICAgICAgICB2YXIgc3BsaXRVcmwgPSB1cmwuc3BsaXQoXCI/XCIpWzFdO1xuXG4gICAgICAgICAgICBpZiAoc3BsaXRVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHZhciB0bXBVcmxQYXJhbXMgPSBzcGxpdFVybC5zcGxpdChcIiZcIik7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCB1cEluZCA9IDA7IHVwSW5kIDwgdG1wVXJsUGFyYW1zLmxlbmd0aDsgdXBJbmQrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VyclBhcmFtU3RyID0gdG1wVXJsUGFyYW1zW3VwSW5kXTtcblxuICAgICAgICAgICAgICAgICAgICB1cmxQYXJhbXNbY3VyclBhcmFtU3RyLnNwbGl0KFwiPVwiKVswXV0gPSBjdXJyUGFyYW1TdHIuc3BsaXQoXCI9XCIpWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwjXFwhL2csIFwiXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHVybFBhcmFtcztcbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuIl19
