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

                    if (entryKeys.indexOf(selectedKey) === -1) {
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
    CJS.getPermLevel(function (permLevel) {
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

    CJS.fetchContest(urlParams.contest, function (contestData) {
        CJS.fetchContestEntry(urlParams.contest, urlParams.entry, function (entryData) {
            $(".entry-name").text("" + entryData.name);
            $(".contest-name").text("Entry in " + contestData.name);
        }, ["name"]);
    }, ["name"]);
};

helpers.authentication.setupPageAuth("#authBtn", CJS);
$(".judge-next-control").hide();
setupPage();

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

        $("#judgingControls").css("opacity", "0.4");

        $(self).text("Scores submitted!");

        $(".judge-next-control").show();
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

$(".judge-next-control").on("click", function () {
    CJS.fetchContestEntries(urlParams.contest, function (nextEntry) {
        window.location.href = "entry.html?contest=" + urlParams.contest + "&entry=" + nextEntry[0];
    }, 1, false);
});

},{"../backend/contest_judging_sys.js":1,"../helpers/helpers.js":5}],3:[function(require,module,exports){
"use strict";

module.exports = {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2NsaWVudC9lbnRyeS5qcyIsIi9Vc2Vycy9CcnluZGVuL3NwYXJrL0NvbnRlc3QtSnVkZ2luZy1TeXN0ZW0tZm9yLUtBL3NyYy9oZWxwZXJzL2F1dGhlbnRpY2F0aW9uLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2hlbHBlcnMvZ2VuZXJhbC5qcyIsIi9Vc2Vycy9CcnluZGVuL3NwYXJrL0NvbnRlc3QtSnVkZ2luZy1TeXN0ZW0tZm9yLUtBL3NyYy9oZWxwZXJzL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxZQUFXO0FBQ3pCLFFBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtBQUNwQyxlQUFPO0tBQ1Y7OztBQUdELFFBQUksWUFBWSxHQUFHLDRDQUE0QyxDQUFDOzs7QUFHaEUsUUFBSSx1QkFBdUIsR0FBRyxFQUFFLENBQUM7OztBQUdqQyxRQUFJLGNBQWMsR0FBRztBQUNqQixxQkFBYSxFQUFFLDZEQUE2RDtBQUM1RSx5QkFBaUIsRUFBRSwwQ0FBMEM7S0FDaEUsQ0FBQzs7QUFFRixXQUFPO0FBQ0gsbUJBQVcsRUFBRSxxQkFBUyxLQUFLLEVBQUU7QUFDekIsbUJBQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEI7QUFDRCx5QkFBaUIsRUFBRSw2QkFBVztBQUMxQixt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LGtCQUFjLEVBQUUsT0FBTyxDQUFDLHFCQUFxQixDQUFDO0FBQzlDLFdBQU8sRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDO0NBQ25DLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF3aW5kb3cualF1ZXJ5IHx8ICF3aW5kb3cuRmlyZWJhc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgdmFyaWFibGUgaXMgdXNlZCB0byBzdG9yZSBvdXIgXCJGaXJlYmFzZSBLZXlcIlxuICAgIGxldCBGSVJFQkFTRV9LRVkgPSBcImh0dHBzOi8vY29udGVzdC1qdWRnaW5nLXN5cy5maXJlYmFzZWlvLmNvbVwiO1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyB2YXJpYWJsZSBpcyB1c2VkIHRvIHNwZWNpZnkgdGhlIGRlZmF1bHQgbnVtYmVyIG9mIGVudHJpZXMgdG8gZmV0Y2hcbiAgICBsZXQgREVGX05VTV9FTlRSSUVTX1RPX0xPQUQgPSAxMDtcblxuICAgIC8vIEVycm9yIG1lc3NhZ2VzLlxuICAgIGxldCBFUlJPUl9NRVNTQUdFUyA9IHtcbiAgICAgICAgRVJSX05PVF9KVURHRTogXCJFcnJvcjogWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8ganVkZ2UgY29udGVzdCBlbnRyaWVzLlwiLFxuICAgICAgICBFUlJfQUxSRUFEWV9WT1RFRDogXCJFcnJvcjogWW91J3ZlIGFscmVhZHkganVkZ2VkIHRoaXMgZW50cnkuXCJcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVwb3J0RXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgZmV0Y2hGaXJlYmFzZUF1dGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpLmdldEF1dGgoKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25jZUF1dGhlZDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpLm9uQXV0aChjYWxsYmFjaywgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhdXRoZW50aWNhdGUobG9nb3V0KVxuICAgICAgICAgKiBJZiBsb2dvdXQgaXMgZmFsc2UgKG9yIHVuZGVmaW5lZCksIHdlIHJlZGlyZWN0IHRvIGEgZ29vZ2xlIGxvZ2luIHBhZ2UuXG4gICAgICAgICAqIElmIGxvZ291dCBpcyB0cnVlLCB3ZSBpbnZva2UgRmlyZWJhc2UncyB1bmF1dGggbWV0aG9kICh0byBsb2cgdGhlIHVzZXIgb3V0KSwgYW5kIHJlbG9hZCB0aGUgcGFnZS5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtCb29sZWFufSBsb2dvdXQqOiBTaG91bGQgd2UgbG9nIHRoZSB1c2VyIG91dD8gKERlZmF1bHRzIHRvIGZhbHNlKVxuICAgICAgICAgKi9cbiAgICAgICAgYXV0aGVudGljYXRlOiBmdW5jdGlvbihsb2dvdXQgPSBmYWxzZSkge1xuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIGlmICghbG9nb3V0KSB7XG4gICAgICAgICAgICAgICAgZmlyZWJhc2VSZWYuYXV0aFdpdGhPQXV0aFJlZGlyZWN0KFwiZ29vZ2xlXCIsIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVJlZi51bmF1dGgoKTtcblxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldFBlcm1MZXZlbCgpXG4gICAgICAgICAqIEdldHMgdGhlIHBlcm0gbGV2ZWwgb2YgdGhlIHVzZXIgdGhhdCBpcyBjdXJyZW50bHkgbG9nZ2VkIGluLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIHJlY2lldmVkIHRoZSBkYXRhLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0UGVybUxldmVsOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgbGV0IGF1dGhEYXRhID0gdGhpcy5mZXRjaEZpcmViYXNlQXV0aCgpO1xuXG4gICAgICAgICAgICBpZiAoYXV0aERhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcbiAgICAgICAgICAgICAgICBsZXQgdGhpc1VzZXJDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwidXNlcnNcIikuY2hpbGQoYXV0aERhdGEudWlkKTtcblxuICAgICAgICAgICAgICAgIHRoaXNVc2VyQ2hpbGQub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNuYXBzaG90LnZhbCgpLnBlcm1MZXZlbCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0RW50cnkoY29udGVzdElkLCBlbnRyeUlkLCBjYWxsYmFjaywgcHJvcGVydGllcylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgdGhlIGVudHJ5IHdlIHdhbnQgdG8gbG9hZCBkYXRhIGZvciByZXNpZGVzIHVuZGVyXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBlbnRyeUlkOiBUaGUgSUQgb2YgdGhlIGNvbnRlc3QgZW50cnkgdGhhdCB3ZSB3YW50IHRvIGxvYWQgZGF0YSBmb3JcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIG9mIHRoZSByZXF1aXJlZCBkYXRhXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IHByb3BlcnRpZXMqOiBBIGxpc3Qgb2YgYWxsIHRoZSBwcm9wZXJ0aWVzIHRoYXQgeW91IHdhbnQgdG8gbG9hZCBmcm9tIHRoaXMgY29udGVzdCBlbnRyeVxuICAgICAgICAgKi9cbiAgICAgICAgZmV0Y2hDb250ZXN0RW50cnk6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2ssIHByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IGNvbnRlc3RDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKTtcbiAgICAgICAgICAgIGxldCBlbnRyeUNoaWxkID0gY29udGVzdENoaWxkLmNoaWxkKFwiZW50cmllc1wiKS5jaGlsZChlbnRyeUlkKTtcblxuICAgICAgICAgICAgbGV0IHJlcXVpcmVkUHJvcHMgPSAocHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gW1wiaWRcIiwgXCJuYW1lXCIsIFwidGh1bWJcIl0gOiBwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHt9O1xuXG4gICAgICAgICAgICBmb3IgKGxldCBwcm9wSW5kID0gMDsgcHJvcEluZCA8IHJlcXVpcmVkUHJvcHMubGVuZ3RoOyBwcm9wSW5kKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgY3VyclByb3AgPSByZXF1aXJlZFByb3BzW3Byb3BJbmRdO1xuXG4gICAgICAgICAgICAgICAgZW50cnlDaGlsZC5jaGlsZChjdXJyUHJvcCkub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtjdXJyUHJvcF0gPSBzbmFwc2hvdC52YWwoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IHJlcXVpcmVkUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmZXRjaENvbnRlc3QoY29udGVzdElkLCBjYWxsYmFjaywgcHJvcGVydGllcylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgeW91IHdhbnQgdG8gbG9hZCBkYXRhIGZvclxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIHJlY2VpdmVkIHRoZSBkYXRhLlxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBwcm9wZXJ0aWVzKjogQSBsaXN0IG9mIGFsbCB0aGUgcHJvcGVydGllcyB0aGF0IHlvdSB3YW50IHRvIGxvYWQgZnJvbSB0aGlzIGNvbnRlc3QuXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3Q6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2ssIHByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IGNvbnRlc3RDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKTtcblxuICAgICAgICAgICAgLy8gUHJvcGVydGllcyB0aGF0IHdlIG11c3QgaGF2ZSBiZWZvcmUgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIGxldCByZXF1aXJlZFByb3BzID0gKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IFtcImlkXCIsIFwibmFtZVwiLCBcImRlc2NcIiwgXCJpbWdcIiwgXCJlbnRyeUNvdW50XCJdIDogcHJvcGVydGllcyk7XG5cbiAgICAgICAgICAgIC8vIFRoZSBvYmplY3QgdGhhdCB3ZSBwYXNzIGludG8gb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0ge307XG5cbiAgICAgICAgICAgIGZvciAobGV0IHByb3BJbmQgPSAwOyBwcm9wSW5kIDwgcmVxdWlyZWRQcm9wcy5sZW5ndGg7IHByb3BJbmQrKykge1xuICAgICAgICAgICAgICAgIGxldCBjdXJyUHJvcCA9IHJlcXVpcmVkUHJvcHNbcHJvcEluZF07XG5cbiAgICAgICAgICAgICAgICBjb250ZXN0Q2hpbGQuY2hpbGQoY3VyclByb3ApLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbY3VyclByb3BdID0gc25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0cyhjYWxsYmFjaylcbiAgICAgICAgICogRmV0Y2hlcyBhbGwgY29udGVzdHMgdGhhdCdyZSBiZWluZyBzdG9yZWQgaW4gRmlyZWJhc2UsIGFuZCBwYXNzZXMgdGhlbSBpbnRvIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgY2FwdHVyZWQgYWxsIHRoZSBkYXRhIHRoYXQgd2UgbmVlZC5cbiAgICAgICAgICogQHRvZG8gKEdpZ2FieXRlIEdpYW50KTogQWRkIGJldHRlciBjb21tZW50cyFcbiAgICAgICAgICovXG4gICAgICAgIGZldGNoQ29udGVzdHM6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0S2V5c0NoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0S2V5c1wiKTtcbiAgICAgICAgICAgIGxldCBjb250ZXN0c0NoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKTtcblxuICAgICAgICAgICAgLy8gUHJvcGVydGllcyB0aGF0IHdlIG11c3QgaGF2ZSBiZWZvcmUgd2UgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIGxldCByZXF1aXJlZFByb3BzID0gW1xuICAgICAgICAgICAgICAgIFwiaWRcIixcbiAgICAgICAgICAgICAgICBcIm5hbWVcIixcbiAgICAgICAgICAgICAgICBcImRlc2NcIixcbiAgICAgICAgICAgICAgICBcImltZ1wiLFxuICAgICAgICAgICAgICAgIFwiZW50cnlDb3VudFwiXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAvLyBrZXlzV2VGb3VuZCBob2xkcyBhIGxpc3Qgb2YgYWxsIG9mIHRoZSBjb250ZXN0IGtleXMgdGhhdCB3ZSd2ZSBmb3VuZCBzbyBmYXJcbiAgICAgICAgICAgIHZhciBrZXlzV2VGb3VuZCA9IFsgXTtcblxuICAgICAgICAgICAgLy8gY2FsbGJhY2tEYXRhIGlzIHRoZSBvYmplY3QgdGhhdCBnZXRzIHBhc3NlZCBpbnRvIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHsgfTtcblxuICAgICAgICAgICAgLy8gXCJRdWVyeVwiIG91ciBjb250ZXN0S2V5c0NoaWxkXG4gICAgICAgICAgICBjb250ZXN0S2V5c0NoaWxkLm9yZGVyQnlLZXkoKS5vbihcImNoaWxkX2FkZGVkXCIsIGZ1bmN0aW9uKGZiSXRlbSkge1xuICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgY3VycmVudCBrZXkgdG8gb3VyIFwia2V5c1dlRm91bmRcIiBhcnJheVxuICAgICAgICAgICAgICAgIGtleXNXZUZvdW5kLnB1c2goZmJJdGVtLmtleSgpKTtcblxuICAgICAgICAgICAgICAgIGxldCB0aGlzQ29udGVzdCA9IGNvbnRlc3RzQ2hpbGQuY2hpbGQoZmJJdGVtLmtleSgpKTtcblxuICAgICAgICAgICAgICAgIHZhciB0aGlzQ29udGVzdERhdGEgPSB7IH07XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwcm9wSW5kID0gMDsgcHJvcEluZCA8IHJlcXVpcmVkUHJvcHMubGVuZ3RoOyBwcm9wSW5kKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJQcm9wZXJ0eSA9IHJlcXVpcmVkUHJvcHNbcHJvcEluZF07XG4gICAgICAgICAgICAgICAgICAgIHRoaXNDb250ZXN0LmNoaWxkKGN1cnJQcm9wZXJ0eSkub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKGZiU25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNDb250ZXN0RGF0YVtjdXJyUHJvcGVydHldID0gZmJTbmFwc2hvdC52YWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyAoR2lnYWJ5dGUgR2lhbnQpOiBHZXQgcmlkIG9mIGFsbCB0aGlzIG5lc3RlZCBcImNyYXBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXNDb250ZXN0RGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtmYkl0ZW0ua2V5KCldID0gdGhpc0NvbnRlc3REYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSBrZXlzV2VGb3VuZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0RW50cmllcyhjb250ZXN0SWQsIGNhbGxiYWNrKVxuICAgICAgICAgKlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgS2hhbiBBY2FkZW15IHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSB3YW50IHRvIGZldGNoIGVudHJpZXMgZm9yLlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBhZnRlciB3ZSd2ZSBmZXRjaGVkIGFsbCB0aGUgZGF0YSB0aGF0IHdlIG5lZWQuXG4gICAgICAgICAqIEBwYXJhbSB7SW50ZWdlcn0gbG9hZEhvd01hbnkqOiBUaGUgbnVtYmVyIG9mIGVudHJpZXMgdG8gbG9hZC4gSWYgbm8gdmFsdWUgaXMgcGFzc2VkIHRvIHRoaXMgcGFyYW1ldGVyLFxuICAgICAgICAgKiAgZmFsbGJhY2sgb250byBhIGRlZmF1bHQgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3RFbnRyaWVzOiBmdW5jdGlvbihjb250ZXN0SWQsIGNhbGxiYWNrLCBsb2FkSG93TWFueSA9IERFRl9OVU1fRU5UUklFU19UT19MT0FELCBpbmNsdWRlSnVkZ2VkID0gdHJ1ZSkge1xuICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIHZhbGlkIGNhbGxiYWNrIGZ1bmN0aW9uLCBleGl0IHRoZSBmdW5jdGlvbi5cbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBSZWZlcmVuY2VzIHRvIEZpcmViYXNlIGNoaWxkcmVuXG4gICAgICAgICAgICBsZXQgdGhpc0NvbnRlc3RSZWYgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZCk7XG4gICAgICAgICAgICBsZXQgY29udGVzdEVudHJpZXNSZWYgPSB0aGlzQ29udGVzdFJlZi5jaGlsZChcImVudHJpZXNcIik7XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueSBlbnRyaWVzIHdlJ3ZlIGxvYWRlZFxuICAgICAgICAgICAgdmFyIG51bUxvYWRlZCA9IDA7XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gc3RvcmUgZWFjaCBvZiB0aGUgZW50cmllcyB0aGF0IHdlJ3ZlIGxvYWRlZFxuICAgICAgICAgICAgdmFyIGVudHJ5S2V5cyA9IFsgXTtcblxuICAgICAgICAgICAgdmFyIGFscmVhZHlDaGVja2VkID0gW107XG5cbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgY29udGVzdEVudHJpZXNSZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKGZiU25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICBsZXQgdG1wRW50cnlLZXlzID0gT2JqZWN0LmtleXMoZmJTbmFwc2hvdC52YWwoKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodG1wRW50cnlLZXlzLmxlbmd0aCA8IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIb3dNYW55ID0gdG1wRW50cnlLZXlzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAobnVtTG9hZGVkIDwgbG9hZEhvd01hbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdG1wRW50cnlLZXlzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEtleSA9IHRtcEVudHJ5S2V5c1tyYW5kb21JbmRleF07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJ5S2V5cy5pbmRleE9mKHNlbGVjdGVkS2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmYlNuYXBzaG90LnZhbCgpW3NlbGVjdGVkS2V5XS5oYXNPd25Qcm9wZXJ0eShcInNjb3Jlc1wiKSAmJiAhaW5jbHVkZUp1ZGdlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZmJTbmFwc2hvdC52YWwoKVtzZWxlY3RlZEtleV0uc2NvcmVzLnJ1YnJpYy5oYXNPd25Qcm9wZXJ0eShcImp1ZGdlc1dob1ZvdGVkXCIpIHx8IGZiU25hcHNob3QudmFsKClbc2VsZWN0ZWRLZXldLnNjb3Jlcy5ydWJyaWMuanVkZ2VzV2hvVm90ZWQuaW5kZXhPZihzZWxmLmZldGNoRmlyZWJhc2VBdXRoKCkudWlkKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlLZXlzLnB1c2goc2VsZWN0ZWRLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1Mb2FkZWQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxyZWFkeUNoZWNrZWQuaW5kZXhPZihzZWxlY3RlZEtleSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFscmVhZHkganVkZ2VkIFwiICsgc2VsZWN0ZWRLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxyZWFkeUNoZWNrZWQucHVzaChzZWxlY3RlZEtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkSG93TWFueS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeUtleXMucHVzaChzZWxlY3RlZEtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtTG9hZGVkKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IGNhbGxiYWNrV2FpdCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChudW1Mb2FkZWQgPT09IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoY2FsbGJhY2tXYWl0KTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZW50cnlLZXlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGxvYWRDb250ZXN0RW50cnkoY29udGVzdElkLCBlbnRyeUlkLCBjYWxsYmFjaylcbiAgICAgICAgICogTG9hZHMgYSBjb250ZXN0IGVudHJ5ICh3aGljaCBpcyBzcGVjaWZpZWQgdmlhIHByb3ZpZGluZyBhIGNvbnRlc3QgaWQgYW5kIGFuIGVudHJ5IGlkKS5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB0aGlzIGVudHJ5IHJlc2lkZXMgdW5kZXIuXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBlbnRyeUlkOiBUaGUgc2NyYXRjaHBhZCBJRCBvZiB0aGUgZW50cnkuXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgbG9hZGVkIGFsbCB0aGUgcmVxdWlyZWQgZGF0YS5cbiAgICAgICAgICogQHRvZG8gKEdpZ2FieXRlIEdpYW50KTogQWRkIGF1dGhlbnRpY2F0aW9uIHRvIHRoaXMgZnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIGxvYWRDb250ZXN0RW50cnk6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSB2YWxpZCBjYWxsYmFjayBmdW5jdGlvbiwgZXhpdCB0aGUgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gUmVmZXJlbmNlcyB0byBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IGNvbnRlc3RSZWYgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNvbnRlc3RJZCk7XG4gICAgICAgICAgICBsZXQgZW50cmllc1JlZiA9IGNvbnRlc3RSZWYuY2hpbGQoXCJlbnRyaWVzXCIpLmNoaWxkKGVudHJ5SWQpO1xuXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0UGVybUxldmVsKGZ1bmN0aW9uKHBlcm1MZXZlbCkge1xuICAgICAgICAgICAgICAgIC8vIEEgdmFyaWFibGUgY29udGFpbmluZyBhIGxpc3Qgb2YgYWxsIHRoZSBwcm9wZXJ0aWVzIHRoYXQgd2UgbXVzdCBsb2FkIGJlZm9yZSB3ZSBjYW4gaW52b2tlIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgICAgIHZhciByZXF1aXJlZFByb3BzID0gW1wiaWRcIiwgXCJuYW1lXCIsIFwidGh1bWJcIl07XG5cbiAgICAgICAgICAgICAgICBpZiAocGVybUxldmVsID49IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWRQcm9wcy5wdXNoKFwic2NvcmVzXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFRoZSBKU09OIG9iamVjdCB0aGF0IHdlJ2xsIHBhc3MgaW50byB0aGUgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0geyB9O1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXF1aXJlZFByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9wUmVmID0gZW50cmllc1JlZi5jaGlsZChyZXF1aXJlZFByb3BzW2ldKTtcblxuICAgICAgICAgICAgICAgICAgICBwcm9wUmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhW3JlcXVpcmVkUHJvcHNbaV1dID0gc25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0gcmVxdWlyZWRQcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCBzZWxmLnJlcG9ydEVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGxvYWRYQ29udGVzdEVudHJpZXMoY29udGVzdElkLCBjYWxsYmFjaywgbG9hZEhvd01hbnkpXG4gICAgICAgICAqIExvYWRzIFwieFwiIGNvbnRlc3QgZW50cmllcywgYW5kIHBhc3NlcyB0aGVtIGludG8gYSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSB3YW50IHRvIGxvYWQgZW50cmllcyBmcm9tLlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgdGhlIHJlcXVpcmVkIGRhdGEuXG4gICAgICAgICAqIEBwYXJhbSB7SW50ZWdlcn0gbG9hZEhvd01hbnk6IFRoZSBudW1iZXIgb2YgZW50cmllcyB0aGF0IHdlJ2QgbGlrZSB0byBsb2FkLlxuICAgICAgICAgKi9cbiAgICAgICAgbG9hZFhDb250ZXN0RW50cmllczogZnVuY3Rpb24oY29udGVzdElkLCBjYWxsYmFjaywgbG9hZEhvd01hbnksIGluY2x1ZGVKdWRnZWQgPSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0ge307XG5cbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5mZXRjaENvbnRlc3RFbnRyaWVzKGNvbnRlc3RJZCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBlSW5kID0gMDsgZUluZCA8IHJlc3BvbnNlLmxlbmd0aDsgZUluZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubG9hZENvbnRlc3RFbnRyeShjb250ZXN0SWQsIHJlc3BvbnNlW2VJbmRdLCBmdW5jdGlvbihlbnRyeURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtyZXNwb25zZVtlSW5kXV0gPSBlbnRyeURhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0gcmVzcG9uc2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgbG9hZEhvd01hbnksIGluY2x1ZGVKdWRnZWQpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0RGVmYXVsdFJ1YnJpY3MoY2FsbGJhY2spXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgbG9hZGVkIGFsbCB0aGUgZGVmYXVsdCBydWJyaWNzXG4gICAgICAgICAqL1xuICAgICAgICBnZXREZWZhdWx0UnVicmljczogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuICAgICAgICAgICAgbGV0IHJ1YnJpY3NDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwicnVicmljc1wiKTtcblxuICAgICAgICAgICAgcnVicmljc0NoaWxkLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNuYXBzaG90LnZhbCgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0Q29udGVzdFJ1YnJpY3MoY29udGVzdElkLCBjYWxsYmFjaylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgd2Ugd2FudCB0byBsb2FkIHRoZSBydWJyaWNzIGZvclxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgb2YgdGhlIHJ1YnJpY3NcbiAgICAgICAgICovXG4gICAgICAgIGdldENvbnRlc3RSdWJyaWNzOiBmdW5jdGlvbihjb250ZXN0SWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0ge307XG5cbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5nZXREZWZhdWx0UnVicmljcyhmdW5jdGlvbihkZWZhdWx0UnVicmljcykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YSA9IGRlZmF1bHRSdWJyaWNzO1xuICAgICAgICAgICAgICAgIHNlbGYuZmV0Y2hDb250ZXN0KGNvbnRlc3RJZCwgZnVuY3Rpb24oY29udGVzdFJ1YnJpY3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1c3RvbVJ1YnJpY3MgPSBjb250ZXN0UnVicmljcy5ydWJyaWNzO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXN0b21SdWJyaWNzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjdXN0b21SdWJyaWMgaW4gY3VzdG9tUnVicmljcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2FsbGJhY2tEYXRhLmhhc093blByb3BlcnR5KGN1c3RvbVJ1YnJpYykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhW2N1c3RvbVJ1YnJpY10gPSBjdXN0b21SdWJyaWNzW2N1c3RvbVJ1YnJpY107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VzdG9tUnVicmljcy5oYXNPd25Qcm9wZXJ0eShcIk9yZGVyXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgb0luZCA9IDA7IG9JbmQgPCBjdXN0b21SdWJyaWNzLk9yZGVyLmxlbmd0aDsgb0luZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgY3VycmVudCBydWJyaWMgaXRlbSBpcyBhY3R1YWxseSBhIHZhbGlkIHJ1YnJpYyBpdGVtLCBhbmQgbWFrZSBzdXJlIGl0J3Mgbm90IHRoZSBcIk9yZGVyXCIgaXRlbS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1c3RvbVJ1YnJpY3MuaGFzT3duUHJvcGVydHkoY3VzdG9tUnVicmljcy5PcmRlcltvSW5kXSkgJiYgY3VzdG9tUnVicmljcy5PcmRlcltvSW5kXSAhPT0gXCJPcmRlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGhpc1J1YnJpYyA9IGN1c3RvbVJ1YnJpY3MuT3JkZXJbb0luZF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja0RhdGEuT3JkZXIuaW5kZXhPZih0aGlzUnVicmljKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGEuT3JkZXIucHVzaCh0aGlzUnVicmljKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tUnVicmljcy5PcmRlciA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICB9LCBbXCJydWJyaWNzXCJdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICoganVkZ2VFbnRyeShjb250ZXN0SWQsIGVudHJ5SWQsIHNjb3JlRGF0YSwgY2FsbGJhY2spXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHdlJ3JlIGp1ZGdpbmcgYW4gZW50cnkgZm9yXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBlbnRyeUlkOiBUaGUgSUQgb2YgdGhlIGVudHJ5IHRoYXQgd2UncmUganVkZ2luZ1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NvcmVEYXRhOiBUaGUgc2NvcmluZyBkYXRhXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIGFmdGVyIHdlJ3ZlIHZhbGlkYXRlZCB0aGUgc2NvcmVzLCBhbmQgc3VibWl0dGVkIHRoZW0uXG4gICAgICAgICAqL1xuICAgICAgICBqdWRnZUVudHJ5OiBmdW5jdGlvbihjb250ZXN0SWQsIGVudHJ5SWQsIHNjb3JlRGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIDA6IENoZWNrIHRoZSB1c2VycyBwZXJtIGxldmVsLCBpZiB0aGVpciBwZXJtTGV2ZWwgaXNuJ3QgPj0gNCwgZXhpdC5cbiAgICAgICAgICAgIC8vIDE6IEZldGNoIHRoZSBydWJyaWNzIGZvciB0aGUgY3VycmVudCBjb250ZXN0LCB0byBtYWtlIHN1cmUgd2UncmUgbm90IGRvaW5nIGFueXRoaW5nIGZ1bmt5XG4gICAgICAgICAgICAvLyAyOiBWYWxpZGF0ZSB0aGUgZGF0YSB0aGF0IHdhcyBzdWJtaXR0ZWQgdG8gdGhlIGZ1bmN0aW9uXG4gICAgICAgICAgICAvLyAzOiBTdWJtaXQgdGhlIGRhdGEgdG8gRmlyZWJhc2VcblxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldFBlcm1MZXZlbChmdW5jdGlvbihwZXJtTGV2ZWwpIHtcbiAgICAgICAgICAgICAgICBpZiAocGVybUxldmVsID49IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRoaXNKdWRnZSA9IHNlbGYuZmV0Y2hGaXJlYmFzZUF1dGgoKS51aWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXRDb250ZXN0UnVicmljcyhjb250ZXN0SWQsIGZ1bmN0aW9uKGNvbnRlc3RSdWJyaWNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZCA9IChjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZCA9PT0gdW5kZWZpbmVkID8gW10gOiBjb250ZXN0UnVicmljcy5qdWRnZXNXaG9Wb3RlZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXN0UnVicmljcy5oYXNPd25Qcm9wZXJ0eShcImp1ZGdlc1dob1ZvdGVkXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkLmluZGV4T2YodGhpc0p1ZGdlKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soRVJST1JfTUVTU0FHRVMuRVJSX0FMUkVBRFlfVk9URUQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNKdWRnZXNWb3RlID0ge307XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNjb3JlIGluIHNjb3JlRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXN0UnVicmljcy5oYXNPd25Qcm9wZXJ0eShzY29yZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjb3JlVmFsID0gLTE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNjb3JlRGF0YVtzY29yZV0gPiBjb250ZXN0UnVicmljc1tzY29yZV0ubWF4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZVZhbCA9IGNvbnRlc3RSdWJyaWNzW3Njb3JlXS5tYXg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NvcmVEYXRhW3Njb3JlXSA8IGNvbnRlc3RSdWJyaWNzW3Njb3JlXS5taW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlVmFsID0gY29udGVzdFJ1YnJpY3Nbc2NvcmVdLm1pbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlVmFsID0gc2NvcmVEYXRhW3Njb3JlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNKdWRnZXNWb3RlW3Njb3JlXSA9IHNjb3JlVmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpc0p1ZGdlc1ZvdGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZldGNoQ29udGVzdEVudHJ5KGNvbnRlc3RJZCwgZW50cnlJZCwgZnVuY3Rpb24oZXhpc3RpbmdTY29yZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZ1Njb3JlRGF0YSA9IGV4aXN0aW5nU2NvcmVEYXRhLnNjb3JlcztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkLnB1c2godGhpc0p1ZGdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhVG9Xcml0ZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganVkZ2VzV2hvVm90ZWQ6IGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZ1Njb3JlRGF0YS5oYXNPd25Qcm9wZXJ0eShcInJ1YnJpY1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXhpc3RpbmdSdWJyaWNJdGVtU2NvcmVzID0gZXhpc3RpbmdTY29yZURhdGEucnVicmljO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJ1YnJpY0l0ZW1zID0gY29udGVzdFJ1YnJpY3M7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcnVicmljSXRlbSBpbiBydWJyaWNJdGVtcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXNKdWRnZXNWb3RlLmhhc093blByb3BlcnR5KHJ1YnJpY0l0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGUgaXRlbTogXCIgKyBydWJyaWNJdGVtKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0bXBTY29yZU9iaiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZnOiAoZXhpc3RpbmdSdWJyaWNJdGVtU2NvcmVzW3J1YnJpY0l0ZW1dID09PSB1bmRlZmluZWQgPyAxIDogZXhpc3RpbmdSdWJyaWNJdGVtU2NvcmVzW3J1YnJpY0l0ZW1dLmF2ZyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdWdoOiAoZXhpc3RpbmdSdWJyaWNJdGVtU2NvcmVzW3J1YnJpY0l0ZW1dID09PSB1bmRlZmluZWQgPyAxIDogZXhpc3RpbmdSdWJyaWNJdGVtU2NvcmVzW3J1YnJpY0l0ZW1dLnJvdWdoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YVRvV3JpdGUuanVkZ2VzV2hvVm90ZWQubGVuZ3RoIC0gMSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXBTY29yZU9iai5yb3VnaCA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcFNjb3JlT2JqLmF2ZyA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wU2NvcmVPYmoucm91Z2ggPSB0bXBTY29yZU9iai5yb3VnaCArIHRoaXNKdWRnZXNWb3RlW3J1YnJpY0l0ZW1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcFNjb3JlT2JqLmF2ZyA9IHRtcFNjb3JlT2JqLnJvdWdoIC8gKGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkLmxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVG9Xcml0ZVtydWJyaWNJdGVtXSA9IHRtcFNjb3JlT2JqO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YVRvV3JpdGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZiUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2hpbGQoXCJlbnRyaWVzXCIpLmNoaWxkKGVudHJ5SWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jaGlsZChcInNjb3Jlc1wiKS5jaGlsZChcInJ1YnJpY1wiKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZiUmVmLnNldChkYXRhVG9Xcml0ZSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlcG9ydEVycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBbXCJzY29yZXNcIl0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhFUlJPUl9NRVNTQUdFUy5FUlJfTk9UX0pVREdFKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuIiwidmFyIENKUyA9IHJlcXVpcmUoXCIuLi9iYWNrZW5kL2NvbnRlc3RfanVkZ2luZ19zeXMuanNcIik7XG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2hlbHBlcnMuanNcIik7XG5cbmxldCB1cmxQYXJhbXMgPSBoZWxwZXJzLmdlbmVyYWwuZ2V0VXJsUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxudmFyIHNpemluZyA9IHtcbiAgICB3aWR0aDogNDAwLFxuICAgIGhlaWdodDogNDAwXG59O1xuXG5mdW5jdGlvbiBjcmVhdGVSdWJyaWNUYWIoJHRhYkxpc3QsIHJ1YnJpYywga0luZCkge1xuICAgICR0YWJMaXN0LmFwcGVuZChcbiAgICAgICAgJChcIjxsaT5cIilcbiAgICAgICAgICAgIC5hZGRDbGFzcyhcInRhYiBjb2wgb3B0aW9ucy10YWJcIilcbiAgICAgICAgICAgIC5hdHRyKFwiZGF0YS1zY29yZS12YWx1ZVwiLCBrSW5kKVxuICAgICAgICAgICAgLmFwcGVuZCgkKFwiPGE+XCIpXG4gICAgICAgICAgICAgICAgLnRleHQocnVicmljLmtleXNba0luZF0pXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJocmVmXCIsIGBydWJyaWMtJHtrSW5kfWApXG4gICAgICAgICAgICAgICAgLmNsaWNrKChldnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0ICR0aGlzRWxlbSA9ICQoZXZ0LnRvRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICR0YWJMaXN0LnRhYnMoXCJzZWxlY3RfdGFiXCIsIGBydWJyaWMtJHtrSW5kfWApO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkdGhpc0VsZW0uYXR0cihcImRhdGEtc2NvcmUtdmFsdWVcIikpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgKTtcbn1cblxubGV0IGNvbnRyb2xGYWN0b3JpZXMgPSB7XG4gICAga2V5cyhydWJyaWMsIGVsZW0pIHtcbiAgICAgICAgbGV0ICR0YWJMaXN0ID0gJChcIjx1bD5cIikuYWRkQ2xhc3MoXCJ0YWJzIGp1ZGdpbmctY29udHJvbCBvcHRpb25zLWNvbnRyb2xcIikuYXR0cihcImRhdGEtcnVicmljLWl0ZW1cIiwgcnVicmljLnJ1YnJpY0l0ZW0pO1xuICAgICAgICBmb3IgKGxldCBrSW5kID0gMDsga0luZCA8IHJ1YnJpYy5rZXlzLmxlbmd0aDsga0luZCsrKSB7XG4gICAgICAgICAgICBjcmVhdGVSdWJyaWNUYWIoJHRhYkxpc3QsIHJ1YnJpYywga0luZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbS5hcHBlbmQoJHRhYkxpc3QpO1xuICAgICAgICAkdGFiTGlzdC50YWJzKCk7XG4gICAgfSxcbiAgICBzbGlkZXIocnVicmljLCBlbGVtKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiSGV5IHNsaWRlcnMhXCIpO1xuICAgICAgICBlbGVtLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8cD5cIilcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoXCJyYW5nZS1maWVsZFwiKVxuICAgICAgICAgICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICQoXCI8aW5wdXQ+XCIpLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicmFuZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibWluXCI6IHJ1YnJpYy5taW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1heFwiOiBydWJyaWMubWF4LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBydWJyaWMubWluLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdGVwXCI6IDFcbiAgICAgICAgICAgICAgICAgICAgfSkuYWRkQ2xhc3MoXCJqdWRnaW5nLWNvbnRyb2wgc2xpZGVyLWNvbnRyb2xcIikuYXR0cihcImRhdGEtcnVicmljLWl0ZW1cIiwgcnVicmljLnJ1YnJpY0l0ZW0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn07XG5cbnZhciBjcmVhdGVKdWRnaW5nQ29udHJvbCA9IGZ1bmN0aW9uKHJ1YnJpYywgdHlwZSkge1xuICAgIHZhciBlbGVtID0gJChcIjxkaXY+XCIpXG4gICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAkKFwiPGg1PlwiKS50ZXh0KHJ1YnJpYy5ydWJyaWNJdGVtLnJlcGxhY2UoL1xcXy9nLCBcIiBcIikpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKFwianVkZ2luZy1jb250cm9sLXRpdGxlXCIpXG4gICAgICAgICkuYWRkQ2xhc3MoXCJjb2wgbDYgbTYgczEyIGp1ZGdpbmctY29udHJvbCBjZW50ZXItYWxpZ25cIik7XG5cbiAgICBjb250cm9sRmFjdG9yaWVzW3R5cGVdKHJ1YnJpYywgZWxlbSk7XG5cbiAgICByZXR1cm4gZWxlbTtcbn07XG5cbnZhciBzZXR1cFBhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBDSlMuZ2V0UGVybUxldmVsKGZ1bmN0aW9uKHBlcm1MZXZlbCkge1xuICAgICAgICBpZiAoIXVybFBhcmFtcy5oYXNPd25Qcm9wZXJ0eShcImNvbnRlc3RcIikgfHwgIXVybFBhcmFtcy5oYXNPd25Qcm9wZXJ0eShcImVudHJ5XCIpKSB7XG4gICAgICAgICAgICBhbGVydChcIkNvbnRlc3QgSUQgYW5kL29yIEVudHJ5IElEIG5vdCBzcGVjaWZpZWQuIFJldHVybmluZyB0byBwcmV2aW91cyBwYWdlLlwiKTtcbiAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBjb250ZXN0SWQgPSB1cmxQYXJhbXMuY29udGVzdC5yZXBsYWNlKC9cXCMvZywgXCJcIik7XG4gICAgICAgICAgICBsZXQgZW50cnlJZCA9IHVybFBhcmFtcy5lbnRyeTtcblxuICAgICAgICAgICAgbGV0IGlmcmFtZVVybCA9IGBodHRwczovL3d3dy5raGFuYWNhZGVteS5vcmcvY29tcHV0ZXItcHJvZ3JhbW1pbmcvY29udGVzdC1lbnRyeS8ke2VudHJ5SWR9L2VtYmVkZGVkP2J1dHRvbnM9bm8mZWRpdG9yPXllcyZhdXRob3I9bm8md2lkdGg9JHtzaXppbmcud2lkdGh9JmhlaWdodD0ke3NpemluZy5oZWlnaHR9YDtcblxuICAgICAgICAgICAgJChcIiNwcmV2aWV3XCIpLmFwcGVuZChcbiAgICAgICAgICAgICAgICAkKFwiPGlmcmFtZT5cIikuYXR0cihcInNyY1wiLCBpZnJhbWVVcmwpLmNzcyhcImhlaWdodFwiLCAoc2l6aW5nLmhlaWdodCArIDEwKSArIFwicHhcIikuYWRkQ2xhc3MoXCJlbnRyeS1mcmFtZVwiKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKHBlcm1MZXZlbCA+PSA0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGp1ZGdpbmdDb250cm9sc0JveCA9ICQoXCIjanVkZ2luZ0NvbnRyb2xzXCIpO1xuXG4gICAgICAgICAgICAgICAgbGV0ICRjb250cm9sUm93ID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwicm93XCIpO1xuICAgICAgICAgICAgICAgIGp1ZGdpbmdDb250cm9sc0JveC5hcHBlbmQoJGNvbnRyb2xSb3cpO1xuXG4gICAgICAgICAgICAgICAgQ0pTLmdldENvbnRlc3RSdWJyaWNzKGNvbnRlc3RJZCwgZnVuY3Rpb24ocnVicmljcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhydWJyaWNzKTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBySW5kID0gMDsgckluZCA8IHJ1YnJpY3MuT3JkZXIubGVuZ3RoOyBySW5kKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0aGlzUnVicmljID0gcnVicmljcy5PcmRlcltySW5kXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ1YnJpY1R5cGUgPSBcIlwiO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVicmljc1t0aGlzUnVicmljXS5oYXNPd25Qcm9wZXJ0eShcImtleXNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWJyaWNUeXBlID0gXCJrZXlzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1YnJpY1R5cGUgPSBcInNsaWRlclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBydWJyaWNzW3RoaXNSdWJyaWNdLnJ1YnJpY0l0ZW0gPSB0aGlzUnVicmljO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udHJvbFJvdy5hcHBlbmQoY3JlYXRlSnVkZ2luZ0NvbnRyb2wocnVicmljc1t0aGlzUnVicmljXSwgcnVicmljVHlwZSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJGNvbnRyb2xSb3cuY2hpbGRyZW4oKS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRyb2xSb3cgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJyb3dcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganVkZ2luZ0NvbnRyb2xzQm94LmFwcGVuZCgkY29udHJvbFJvdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJChcIi5qdWRnZU9ubHlcIikuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBDSlMuZmV0Y2hDb250ZXN0KHVybFBhcmFtcy5jb250ZXN0LCAoY29udGVzdERhdGEpID0+IHtcbiAgICAgICAgQ0pTLmZldGNoQ29udGVzdEVudHJ5KHVybFBhcmFtcy5jb250ZXN0LCB1cmxQYXJhbXMuZW50cnksIChlbnRyeURhdGEpID0+IHtcbiAgICAgICAgICAgICQoXCIuZW50cnktbmFtZVwiKS50ZXh0KGAke2VudHJ5RGF0YS5uYW1lfWApO1xuICAgICAgICAgICAgJChcIi5jb250ZXN0LW5hbWVcIikudGV4dChgRW50cnkgaW4gJHtjb250ZXN0RGF0YS5uYW1lfWApO1xuICAgICAgICB9LCBbXCJuYW1lXCJdKTtcbiAgICB9LCBbXCJuYW1lXCJdKTtcbn07XG5cbmhlbHBlcnMuYXV0aGVudGljYXRpb24uc2V0dXBQYWdlQXV0aChcIiNhdXRoQnRuXCIsIENKUyk7XG4kKFwiLmp1ZGdlLW5leHQtY29udHJvbFwiKS5oaWRlKCk7XG5zZXR1cFBhZ2UoKTtcblxuJChcIi5zdWJtaXQtc2NvcmUtY29udHJvbFwiKS5vbihcImNsaWNrXCIsIChldnQpID0+IHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGxldCBzZWxmID0gJChldnQudG9FbGVtZW50KTtcblxuICAgICQoc2VsZikuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKS50ZXh0KFwiU3VibWl0dGluZyBzY29yZXMuLi5cIik7XG4gICAgJChcIiNqdWRnaW5nQ29udHJvbHMgKlwiKS5wcm9wKFwiZGlzYWJsZWRcIiwgXCJ0cnVlXCIpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG5cbiAgICB2YXIgc2NvcmVEYXRhID0ge307XG5cbiAgICAkKFwiLmp1ZGdpbmctY29udHJvbFwiKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgIGxldCAkY29udHJvbEVsZW0gPSAkKGl0ZW0pO1xuICAgICAgICBsZXQgcnVicmljSXRlbSA9ICRjb250cm9sRWxlbS5hdHRyKFwiZGF0YS1ydWJyaWMtaXRlbVwiKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhydWJyaWNJdGVtKTtcblxuICAgICAgICBpZiAocnVicmljSXRlbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoJGNvbnRyb2xFbGVtLmF0dHIoXCJjbGFzc1wiKS5pbmRleE9mKFwib3B0aW9ucy1jb250cm9sXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGxldCAkc2VsZWN0ZWRJdGVtID0gJGNvbnRyb2xFbGVtLmZpbmQoXCIuYWN0aXZlXCIpO1xuXG4gICAgICAgICAgICAgICAgc2NvcmVEYXRhW3J1YnJpY0l0ZW1dID0gcGFyc2VJbnQoJHNlbGVjdGVkSXRlbS5wYXJlbnQoKS5hdHRyKFwiZGF0YS1zY29yZS12YWx1ZVwiKSwgMTApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgkY29udHJvbEVsZW0uYXR0cihcImNsYXNzXCIpLmluZGV4T2YoXCJzbGlkZXItY29udHJvbFwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzY29yZURhdGFbcnVicmljSXRlbV0gPSBwYXJzZUludCgkY29udHJvbEVsZW0udmFsKCksIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgQ0pTLmp1ZGdlRW50cnkodXJsUGFyYW1zLmNvbnRlc3QsIHVybFBhcmFtcy5lbnRyeSwgc2NvcmVEYXRhLCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFsZXJ0KGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICQoXCIjanVkZ2luZ0NvbnRyb2xzXCIpLmNzcyhcIm9wYWNpdHlcIiwgXCIwLjRcIik7XG5cbiAgICAgICAgJChzZWxmKS50ZXh0KFwiU2NvcmVzIHN1Ym1pdHRlZCFcIik7XG5cbiAgICAgICAgJChcIi5qdWRnZS1uZXh0LWNvbnRyb2xcIikuc2hvdygpO1xuICAgIH0pO1xufSk7XG5cbiQoXCIucmVsb2FkLWVudHJ5LWNvbnRyb2xcIikub24oXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgJChcIi5lbnRyeS1mcmFtZVwiKS5hdHRyKFwic3JjXCIsICQoXCIuZW50cnktZnJhbWVcIikuYXR0cihcInNyY1wiKSk7XG59KTtcblxuJChcIi5zZXQtZGltZW5zaW9ucy1jb250cm9sXCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHNpemluZy53aWR0aCA9IHBhcnNlSW50KCQoXCJbbmFtZT13aWR0aF1cIikudmFsKCksIDEwKTtcbiAgICBzaXppbmcuaGVpZ2h0ID0gcGFyc2VJbnQoJChcIltuYW1lPWhlaWdodF1cIikudmFsKCksIDEwKTtcblxuICAgIGNvbnNvbGUubG9nKGBodHRwczovL3d3dy5raGFuYWNhZGVteS5vcmcvY29tcHV0ZXItcHJvZ3JhbW1pbmcvY29udGVzdC1lbnRyeS8ke3VybFBhcmFtcy5lbnRyeX0vZW1iZWRkZWQ/YnV0dG9ucz1ubyZlZGl0b3I9eWVzJmF1dGhvcj1ubyZ3aWR0aD0ke3NpemluZy53aWR0aH0maGVpZ2h0PSR7c2l6aW5nLmhlaWdodH1gKTtcblxuICAgICQoXCIuZW50cnktZnJhbWVcIikuYXR0cihcInNyY1wiLCBgaHR0cHM6Ly93d3cua2hhbmFjYWRlbXkub3JnL2NvbXB1dGVyLXByb2dyYW1taW5nL2NvbnRlc3QtZW50cnkvJHt1cmxQYXJhbXMuZW50cnl9L2VtYmVkZGVkP2J1dHRvbnM9bm8mZWRpdG9yPXllcyZhdXRob3I9bm8md2lkdGg9JHtzaXppbmcud2lkdGh9JmhlaWdodD0ke3NpemluZy5oZWlnaHR9YCk7XG59KTtcblxuJChcIi5qdWRnZS1uZXh0LWNvbnRyb2xcIikub24oXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgQ0pTLmZldGNoQ29udGVzdEVudHJpZXModXJsUGFyYW1zLmNvbnRlc3QsIGZ1bmN0aW9uKG5leHRFbnRyeSkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGBlbnRyeS5odG1sP2NvbnRlc3Q9JHt1cmxQYXJhbXMuY29udGVzdH0mZW50cnk9JHtuZXh0RW50cnlbMF19YDtcbiAgICB9LCAxLCBmYWxzZSk7XG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzZXR1cE9uQ2xpY2s6IGZ1bmN0aW9uKHNlbGVjdG9yLCBjanNXcmFwcGVyKSB7XG4gICAgICAgICQoc2VsZWN0b3IpLm9uKFwiY2xpY2tcIiwgKGV2dCkgPT4ge1xuICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIGlmIChjanNXcmFwcGVyLmZldGNoRmlyZWJhc2VBdXRoKCkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjanNXcmFwcGVyLmF1dGhlbnRpY2F0ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjanNXcmFwcGVyLmF1dGhlbnRpY2F0ZSh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBzaG93V2VsY29tZTogZnVuY3Rpb24oc2VsZWN0b3IsIGNqc1dyYXBwZXIpIHtcbiAgICAgICAgaWYgKGNqc1dyYXBwZXIuZmV0Y2hGaXJlYmFzZUF1dGgoKSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgJChzZWxlY3RvcikudGV4dChcIkhlbGxvIGd1ZXN0ISBDbGljayBtZSB0byBsb2cgaW4uXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJChzZWxlY3RvcikudGV4dChgSGVsbG8gJHtjanNXcmFwcGVyLmZldGNoRmlyZWJhc2VBdXRoKCkuZ29vZ2xlLmRpc3BsYXlOYW1lfSEgKE5vdCB5b3U/IENsaWNrIGhlcmUhKWApO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBzZXR1cFBhZ2VBdXRoOiBmdW5jdGlvbihhdXRoQnRuU2VsZWN0b3IsIGNqc1dyYXBwZXIpIHtcbiAgICAgICAgdGhpcy5zZXR1cE9uQ2xpY2soYXV0aEJ0blNlbGVjdG9yLCBjanNXcmFwcGVyKTtcbiAgICAgICAgdGhpcy5zaG93V2VsY29tZShhdXRoQnRuU2VsZWN0b3IsIGNqc1dyYXBwZXIpO1xuICAgIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogZ2V0Q29va2llKGNvb2tpZU5hbWUpXG4gICAgICogRmV0Y2hlcyB0aGUgc3BlY2lmaWVkIGNvb2tpZSBmcm9tIHRoZSBicm93c2VyLCBhbmQgcmV0dXJucyBpdCdzIHZhbHVlLlxuICAgICAqIEBhdXRob3IgdzNzY2hvb2xzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvb2tpZU5hbWU6IFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdGhhdCB3ZSB3YW50IHRvIGZldGNoLlxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IGNvb2tpZVZhbHVlOiBUaGUgdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBjb29raWUsIG9yIGFuIGVtcHR5IHN0cmluZywgaWYgdGhlcmUgaXMgbm8gXCJub24tZmFsc3lcIiB2YWx1ZS5cbiAgICAgKi9cbiAgICBnZXRDb29raWU6IGZ1bmN0aW9uKGNvb2tpZU5hbWUpIHtcbiAgICAgICAgLy8gR2V0IHRoZSBjb29raWUgd2l0aCBuYW1lIGNvb2tpZSAocmV0dXJuIFwiXCIgaWYgbm9uLWV4aXN0ZW50KVxuICAgICAgICBjb29raWVOYW1lID0gY29va2llTmFtZSArIFwiPVwiO1xuICAgICAgICAvLyBDaGVjayBhbGwgb2YgdGhlIGNvb2tpZXMgYW5kIHRyeSB0byBmaW5kIHRoZSBvbmUgY29udGFpbmluZyBuYW1lLlxuICAgICAgICB2YXIgY29va2llTGlzdCA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdChcIjtcIik7XG4gICAgICAgIGZvciAodmFyIGNJbmQgPSAwOyBjSW5kIDwgY29va2llTGlzdC5sZW5ndGg7IGNJbmQgKyspIHtcbiAgICAgICAgICAgIHZhciBjdXJDb29raWUgPSBjb29raWVMaXN0W2NJbmRdO1xuICAgICAgICAgICAgd2hpbGUgKGN1ckNvb2tpZVswXSA9PT0gXCIgXCIpIHtcbiAgICAgICAgICAgICAgICBjdXJDb29raWUgPSBjdXJDb29raWUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgd2UndmUgZm91bmQgdGhlIHJpZ2h0IGNvb2tpZSwgcmV0dXJuIGl0cyB2YWx1ZS5cbiAgICAgICAgICAgIGlmIChjdXJDb29raWUuaW5kZXhPZihjb29raWVOYW1lKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJDb29raWUuc3Vic3RyaW5nKGNvb2tpZU5hbWUubGVuZ3RoLCBjdXJDb29raWUubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UsIGlmIHRoZSBjb29raWUgZG9lc24ndCBleGlzdCwgcmV0dXJuIFwiXCJcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBzZXRDb29raWUoY29va2llTmFtZSwgdmFsdWUpXG4gICAgICogQ3JlYXRlcy91cGRhdGVzIGEgY29va2llIHdpdGggdGhlIGRlc2lyZWQgbmFtZSwgc2V0dGluZyBpdCdzIHZhbHVlIHRvIFwidmFsdWVcIi5cbiAgICAgKiBAYXV0aG9yIHczc2Nob29sc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb29raWVOYW1lOiBUaGUgbmFtZSBvZiB0aGUgY29va2llIHRoYXQgd2Ugd2FudCB0byBjcmVhdGUvdXBkYXRlLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZTogVGhlIHZhbHVlIHRvIGFzc2lnbiB0byB0aGUgY29va2llLlxuICAgICAqL1xuICAgIHNldENvb2tpZTogZnVuY3Rpb24oY29va2llTmFtZSwgdmFsdWUpIHtcbiAgICAgICAgLy8gU2V0IGEgY29va2llIHdpdGggbmFtZSBjb29raWUgYW5kIHZhbHVlIGNvb2tpZSB0aGF0IHdpbGwgZXhwaXJlIDMwIGRheXMgZnJvbSBub3cuXG4gICAgICAgIHZhciBkID0gbmV3IERhdGUoKTtcbiAgICAgICAgZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgKDMwICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuICAgICAgICB2YXIgZXhwaXJlcyA9IFwiZXhwaXJlcz1cIiArIGQudG9VVENTdHJpbmcoKTtcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llTmFtZSArIFwiPVwiICsgdmFsdWUgKyBcIjsgXCIgKyBleHBpcmVzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogZ2V0VXJsUGFyYW1zKClcbiAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmw6IFRoZSBVUkwgdG8gZmV0Y2ggVVJMIHBhcmFtZXRlcnMgZnJvbVxuICAgICAqL1xuICAgIGdldFVybFBhcmFtczogZnVuY3Rpb24odXJsKSB7XG4gICAgICAgIHZhciB1cmxQYXJhbXMgPSB7fTtcblxuICAgICAgICB2YXIgc3BsaXRVcmwgPSB1cmwuc3BsaXQoXCI/XCIpWzFdO1xuXG4gICAgICAgIGlmIChzcGxpdFVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgdG1wVXJsUGFyYW1zID0gc3BsaXRVcmwuc3BsaXQoXCImXCIpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCB1cEluZCA9IDA7IHVwSW5kIDwgdG1wVXJsUGFyYW1zLmxlbmd0aDsgdXBJbmQrKykge1xuICAgICAgICAgICAgICAgIGxldCBjdXJyUGFyYW1TdHIgPSB0bXBVcmxQYXJhbXNbdXBJbmRdO1xuXG4gICAgICAgICAgICAgICAgdXJsUGFyYW1zW2N1cnJQYXJhbVN0ci5zcGxpdChcIj1cIilbMF1dID0gY3VyclBhcmFtU3RyLnNwbGl0KFwiPVwiKVsxXVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwjXFwhL2csIFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHVybFBhcmFtcztcbiAgICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGF1dGhlbnRpY2F0aW9uOiByZXF1aXJlKFwiLi9hdXRoZW50aWNhdGlvbi5qc1wiKSxcbiAgICBnZW5lcmFsOiByZXF1aXJlKFwiLi9nZW5lcmFsLmpzXCIpXG59OyJdfQ==
