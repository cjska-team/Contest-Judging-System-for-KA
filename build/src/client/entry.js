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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2NsaWVudC9lbnRyeS5qcyIsIi9Vc2Vycy9CcnluZGVuL3NwYXJrL0NvbnRlc3QtSnVkZ2luZy1TeXN0ZW0tZm9yLUtBL3NyYy9oZWxwZXJzL2F1dGhlbnRpY2F0aW9uLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2hlbHBlcnMvZ2VuZXJhbC5qcyIsIi9Vc2Vycy9CcnluZGVuL3NwYXJrL0NvbnRlc3QtSnVkZ2luZy1TeXN0ZW0tZm9yLUtBL3NyYy9oZWxwZXJzL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxZQUFXO0FBQ3pCLFFBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtBQUNwQyxlQUFPO0tBQ1Y7OztBQUdELFFBQUksWUFBWSxHQUFHLDRDQUE0QyxDQUFDOzs7QUFHaEUsUUFBSSx1QkFBdUIsR0FBRyxFQUFFLENBQUM7OztBQUdqQyxRQUFJLGNBQWMsR0FBRztBQUNqQixxQkFBYSxFQUFFLDZEQUE2RDtBQUM1RSx5QkFBaUIsRUFBRSwwQ0FBMEM7S0FDaEUsQ0FBQzs7QUFFRixXQUFPO0FBQ0gsbUJBQVcsRUFBRSxxQkFBUyxLQUFLLEVBQUU7QUFDekIsbUJBQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEI7QUFDRCx5QkFBaUIsRUFBRSw2QkFBVztBQUMxQixt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LElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUN0RCxvQkFBSSxZQUFZLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV2Qyx5QkFBUyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUM3RCxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQzdCO1NBQ0o7O0FBRUQsZUFBTyxTQUFTLENBQUM7S0FDcEI7Q0FDSixDQUFDOzs7OztBQy9ERixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2Isa0JBQWMsRUFBRSxPQUFPLENBQUMscUJBQXFCLENBQUM7QUFDOUMsV0FBTyxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUM7Q0FDbkMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgICBpZiAoIXdpbmRvdy5qUXVlcnkgfHwgIXdpbmRvdy5GaXJlYmFzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVGhlIGZvbGxvd2luZyB2YXJpYWJsZSBpcyB1c2VkIHRvIHN0b3JlIG91ciBcIkZpcmViYXNlIEtleVwiXG4gICAgbGV0IEZJUkVCQVNFX0tFWSA9IFwiaHR0cHM6Ly9jb250ZXN0LWp1ZGdpbmctc3lzLmZpcmViYXNlaW8uY29tXCI7XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIHZhcmlhYmxlIGlzIHVzZWQgdG8gc3BlY2lmeSB0aGUgZGVmYXVsdCBudW1iZXIgb2YgZW50cmllcyB0byBmZXRjaFxuICAgIGxldCBERUZfTlVNX0VOVFJJRVNfVE9fTE9BRCA9IDEwO1xuXG4gICAgLy8gRXJyb3IgbWVzc2FnZXMuXG4gICAgbGV0IEVSUk9SX01FU1NBR0VTID0ge1xuICAgICAgICBFUlJfTk9UX0pVREdFOiBcIkVycm9yOiBZb3UgZG8gbm90IGhhdmUgcGVybWlzc2lvbiB0byBqdWRnZSBjb250ZXN0IGVudHJpZXMuXCIsXG4gICAgICAgIEVSUl9BTFJFQURZX1ZPVEVEOiBcIkVycm9yOiBZb3UndmUgYWxyZWFkeSBqdWRnZWQgdGhpcyBlbnRyeS5cIlxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXBvcnRFcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgICBmZXRjaEZpcmViYXNlQXV0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSkuZ2V0QXV0aCgpO1xuICAgICAgICB9LFxuICAgICAgICBvbmNlQXV0aGVkOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSkub25BdXRoKGNhbGxiYWNrLCB0aGlzLnJlcG9ydEVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGF1dGhlbnRpY2F0ZShsb2dvdXQpXG4gICAgICAgICAqIElmIGxvZ291dCBpcyBmYWxzZSAob3IgdW5kZWZpbmVkKSwgd2UgcmVkaXJlY3QgdG8gYSBnb29nbGUgbG9naW4gcGFnZS5cbiAgICAgICAgICogSWYgbG9nb3V0IGlzIHRydWUsIHdlIGludm9rZSBGaXJlYmFzZSdzIHVuYXV0aCBtZXRob2QgKHRvIGxvZyB0aGUgdXNlciBvdXQpLCBhbmQgcmVsb2FkIHRoZSBwYWdlLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGxvZ291dCo6IFNob3VsZCB3ZSBsb2cgdGhlIHVzZXIgb3V0PyAoRGVmYXVsdHMgdG8gZmFsc2UpXG4gICAgICAgICAqL1xuICAgICAgICBhdXRoZW50aWNhdGU6IGZ1bmN0aW9uKGxvZ291dCA9IGZhbHNlKSB7XG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgaWYgKCFsb2dvdXQpIHtcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVJlZi5hdXRoV2l0aE9BdXRoUmVkaXJlY3QoXCJnb29nbGVcIiwgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcmViYXNlUmVmLnVuYXV0aCgpO1xuXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0UGVybUxldmVsKClcbiAgICAgICAgICogR2V0cyB0aGUgcGVybSBsZXZlbCBvZiB0aGUgdXNlciB0aGF0IGlzIGN1cnJlbnRseSBsb2dnZWQgaW4uXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgcmVjaWV2ZWQgdGhlIGRhdGEuXG4gICAgICAgICAqL1xuICAgICAgICBnZXRQZXJtTGV2ZWw6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBsZXQgYXV0aERhdGEgPSB0aGlzLmZldGNoRmlyZWJhc2VBdXRoKCk7XG5cbiAgICAgICAgICAgIGlmIChhdXRoRGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuICAgICAgICAgICAgICAgIGxldCB0aGlzVXNlckNoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJ1c2Vyc1wiKS5jaGlsZChhdXRoRGF0YS51aWQpO1xuXG4gICAgICAgICAgICAgICAgdGhpc1VzZXJDaGlsZC5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc25hcHNob3QudmFsKCkucGVybUxldmVsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmZXRjaENvbnRlc3RFbnRyeShjb250ZXN0SWQsIGVudHJ5SWQsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzKVxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB0aGUgZW50cnkgd2Ugd2FudCB0byBsb2FkIGRhdGEgZm9yIHJlc2lkZXMgdW5kZXJcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGVudHJ5SWQ6IFRoZSBJRCBvZiB0aGUgY29udGVzdCBlbnRyeSB0aGF0IHdlIHdhbnQgdG8gbG9hZCBkYXRhIGZvclxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgb2YgdGhlIHJlcXVpcmVkIGRhdGFcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gcHJvcGVydGllcyo6IEEgbGlzdCBvZiBhbGwgdGhlIHByb3BlcnRpZXMgdGhhdCB5b3Ugd2FudCB0byBsb2FkIGZyb20gdGhpcyBjb250ZXN0IGVudHJ5XG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3RFbnRyeTogZnVuY3Rpb24oY29udGVzdElkLCBlbnRyeUlkLCBjYWxsYmFjaywgcHJvcGVydGllcykge1xuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIEZpcmViYXNlIGNoaWxkcmVuXG4gICAgICAgICAgICBsZXQgY29udGVzdENoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKS5jaGlsZChjb250ZXN0SWQpO1xuICAgICAgICAgICAgbGV0IGVudHJ5Q2hpbGQgPSBjb250ZXN0Q2hpbGQuY2hpbGQoXCJlbnRyaWVzXCIpLmNoaWxkKGVudHJ5SWQpO1xuXG4gICAgICAgICAgICBsZXQgcmVxdWlyZWRQcm9wcyA9IChwcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyBbXCJpZFwiLCBcIm5hbWVcIiwgXCJ0aHVtYlwiXSA6IHByb3BlcnRpZXMpO1xuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0ge307XG5cbiAgICAgICAgICAgIGZvciAobGV0IHByb3BJbmQgPSAwOyBwcm9wSW5kIDwgcmVxdWlyZWRQcm9wcy5sZW5ndGg7IHByb3BJbmQrKykge1xuICAgICAgICAgICAgICAgIGxldCBjdXJyUHJvcCA9IHJlcXVpcmVkUHJvcHNbcHJvcEluZF07XG5cbiAgICAgICAgICAgICAgICBlbnRyeUNoaWxkLmNoaWxkKGN1cnJQcm9wKS5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhW2N1cnJQcm9wXSA9IHNuYXBzaG90LnZhbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhjYWxsYmFja0RhdGEpLmxlbmd0aCA9PT0gcmVxdWlyZWRQcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzLnJlcG9ydEVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZldGNoQ29udGVzdChjb250ZXN0SWQsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzKVxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB5b3Ugd2FudCB0byBsb2FkIGRhdGEgZm9yXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgcmVjZWl2ZWQgdGhlIGRhdGEuXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IHByb3BlcnRpZXMqOiBBIGxpc3Qgb2YgYWxsIHRoZSBwcm9wZXJ0aWVzIHRoYXQgeW91IHdhbnQgdG8gbG9hZCBmcm9tIHRoaXMgY29udGVzdC5cbiAgICAgICAgICovXG4gICAgICAgIGZldGNoQ29udGVzdDogZnVuY3Rpb24oY29udGVzdElkLCBjYWxsYmFjaywgcHJvcGVydGllcykge1xuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIEZpcmViYXNlIGNoaWxkcmVuXG4gICAgICAgICAgICBsZXQgY29udGVzdENoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKS5jaGlsZChjb250ZXN0SWQpO1xuXG4gICAgICAgICAgICAvLyBQcm9wZXJ0aWVzIHRoYXQgd2UgbXVzdCBoYXZlIGJlZm9yZSBjYW4gaW52b2tlIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgbGV0IHJlcXVpcmVkUHJvcHMgPSAocHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gW1wiaWRcIiwgXCJuYW1lXCIsIFwiZGVzY1wiLCBcImltZ1wiLCBcImVudHJ5Q291bnRcIl0gOiBwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgLy8gVGhlIG9iamVjdCB0aGF0IHdlIHBhc3MgaW50byBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7fTtcblxuICAgICAgICAgICAgZm9yIChsZXQgcHJvcEluZCA9IDA7IHByb3BJbmQgPCByZXF1aXJlZFByb3BzLmxlbmd0aDsgcHJvcEluZCsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJQcm9wID0gcmVxdWlyZWRQcm9wc1twcm9wSW5kXTtcblxuICAgICAgICAgICAgICAgIGNvbnRlc3RDaGlsZC5jaGlsZChjdXJyUHJvcCkub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtjdXJyUHJvcF0gPSBzbmFwc2hvdC52YWwoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IHJlcXVpcmVkUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmZXRjaENvbnRlc3RzKGNhbGxiYWNrKVxuICAgICAgICAgKiBGZXRjaGVzIGFsbCBjb250ZXN0cyB0aGF0J3JlIGJlaW5nIHN0b3JlZCBpbiBGaXJlYmFzZSwgYW5kIHBhc3NlcyB0aGVtIGludG8gYSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBjYXB0dXJlZCBhbGwgdGhlIGRhdGEgdGhhdCB3ZSBuZWVkLlxuICAgICAgICAgKiBAdG9kbyAoR2lnYWJ5dGUgR2lhbnQpOiBBZGQgYmV0dGVyIGNvbW1lbnRzIVxuICAgICAgICAgKi9cbiAgICAgICAgZmV0Y2hDb250ZXN0czogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IGNvbnRlc3RLZXlzQ2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RLZXlzXCIpO1xuICAgICAgICAgICAgbGV0IGNvbnRlc3RzQ2hpbGQgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpO1xuXG4gICAgICAgICAgICAvLyBQcm9wZXJ0aWVzIHRoYXQgd2UgbXVzdCBoYXZlIGJlZm9yZSB3ZSBjYW4gaW52b2tlIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgbGV0IHJlcXVpcmVkUHJvcHMgPSBbXG4gICAgICAgICAgICAgICAgXCJpZFwiLFxuICAgICAgICAgICAgICAgIFwibmFtZVwiLFxuICAgICAgICAgICAgICAgIFwiZGVzY1wiLFxuICAgICAgICAgICAgICAgIFwiaW1nXCIsXG4gICAgICAgICAgICAgICAgXCJlbnRyeUNvdW50XCJcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIC8vIGtleXNXZUZvdW5kIGhvbGRzIGEgbGlzdCBvZiBhbGwgb2YgdGhlIGNvbnRlc3Qga2V5cyB0aGF0IHdlJ3ZlIGZvdW5kIHNvIGZhclxuICAgICAgICAgICAgdmFyIGtleXNXZUZvdW5kID0gWyBdO1xuXG4gICAgICAgICAgICAvLyBjYWxsYmFja0RhdGEgaXMgdGhlIG9iamVjdCB0aGF0IGdldHMgcGFzc2VkIGludG8gb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0geyB9O1xuXG4gICAgICAgICAgICAvLyBcIlF1ZXJ5XCIgb3VyIGNvbnRlc3RLZXlzQ2hpbGRcbiAgICAgICAgICAgIGNvbnRlc3RLZXlzQ2hpbGQub3JkZXJCeUtleSgpLm9uKFwiY2hpbGRfYWRkZWRcIiwgZnVuY3Rpb24oZmJJdGVtKSB7XG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBjdXJyZW50IGtleSB0byBvdXIgXCJrZXlzV2VGb3VuZFwiIGFycmF5XG4gICAgICAgICAgICAgICAga2V5c1dlRm91bmQucHVzaChmYkl0ZW0ua2V5KCkpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHRoaXNDb250ZXN0ID0gY29udGVzdHNDaGlsZC5jaGlsZChmYkl0ZW0ua2V5KCkpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHRoaXNDb250ZXN0RGF0YSA9IHsgfTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IHByb3BJbmQgPSAwOyBwcm9wSW5kIDwgcmVxdWlyZWRQcm9wcy5sZW5ndGg7IHByb3BJbmQrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VyclByb3BlcnR5ID0gcmVxdWlyZWRQcm9wc1twcm9wSW5kXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpc0NvbnRlc3QuY2hpbGQoY3VyclByb3BlcnR5KS5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oZmJTbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc0NvbnRlc3REYXRhW2N1cnJQcm9wZXJ0eV0gPSBmYlNuYXBzaG90LnZhbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIChHaWdhYnl0ZSBHaWFudCk6IEdldCByaWQgb2YgYWxsIHRoaXMgbmVzdGVkIFwiY3JhcFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpc0NvbnRlc3REYXRhKS5sZW5ndGggPT09IHJlcXVpcmVkUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhW2ZiSXRlbS5rZXkoKV0gPSB0aGlzQ29udGVzdERhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IGtleXNXZUZvdW5kLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmZXRjaENvbnRlc3RFbnRyaWVzKGNvbnRlc3RJZCwgY2FsbGJhY2spXG4gICAgICAgICAqXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBLaGFuIEFjYWRlbXkgc2NyYXRjaHBhZCBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHdlIHdhbnQgdG8gZmV0Y2ggZW50cmllcyBmb3IuXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIGFmdGVyIHdlJ3ZlIGZldGNoZWQgYWxsIHRoZSBkYXRhIHRoYXQgd2UgbmVlZC5cbiAgICAgICAgICogQHBhcmFtIHtJbnRlZ2VyfSBsb2FkSG93TWFueSo6IFRoZSBudW1iZXIgb2YgZW50cmllcyB0byBsb2FkLiBJZiBubyB2YWx1ZSBpcyBwYXNzZWQgdG8gdGhpcyBwYXJhbWV0ZXIsXG4gICAgICAgICAqICBmYWxsYmFjayBvbnRvIGEgZGVmYXVsdCB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIGZldGNoQ29udGVzdEVudHJpZXM6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2ssIGxvYWRIb3dNYW55ID0gREVGX05VTV9FTlRSSUVTX1RPX0xPQUQsIGluY2x1ZGVKdWRnZWQgPSB0cnVlKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdmFsaWQgY2FsbGJhY2sgZnVuY3Rpb24sIGV4aXQgdGhlIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZXMgdG8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCB0aGlzQ29udGVzdFJlZiA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKTtcbiAgICAgICAgICAgIGxldCBjb250ZXN0RW50cmllc1JlZiA9IHRoaXNDb250ZXN0UmVmLmNoaWxkKFwiZW50cmllc1wiKTtcblxuICAgICAgICAgICAgLy8gVXNlZCB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IGVudHJpZXMgd2UndmUgbG9hZGVkXG4gICAgICAgICAgICB2YXIgbnVtTG9hZGVkID0gMDtcblxuICAgICAgICAgICAgLy8gVXNlZCB0byBzdG9yZSBlYWNoIG9mIHRoZSBlbnRyaWVzIHRoYXQgd2UndmUgbG9hZGVkXG4gICAgICAgICAgICB2YXIgZW50cnlLZXlzID0gWyBdO1xuXG4gICAgICAgICAgICB2YXIgYWxyZWFkeUNoZWNrZWQgPSBbXTtcblxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBjb250ZXN0RW50cmllc1JlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oZmJTbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgIGxldCB0bXBFbnRyeUtleXMgPSBPYmplY3Qua2V5cyhmYlNuYXBzaG90LnZhbCgpKTtcblxuICAgICAgICAgICAgICAgIGlmICh0bXBFbnRyeUtleXMubGVuZ3RoIDwgbG9hZEhvd01hbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhvd01hbnkgPSB0bXBFbnRyeUtleXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdoaWxlIChudW1Mb2FkZWQgPCBsb2FkSG93TWFueSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0bXBFbnRyeUtleXMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkS2V5ID0gdG1wRW50cnlLZXlzW3JhbmRvbUluZGV4XTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnlLZXlzLmluZGV4T2Yoc2VsZWN0ZWRLZXkpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZiU25hcHNob3QudmFsKClbc2VsZWN0ZWRLZXldLmhhc093blByb3BlcnR5KFwic2NvcmVzXCIpICYmICFpbmNsdWRlSnVkZ2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFmYlNuYXBzaG90LnZhbCgpW3NlbGVjdGVkS2V5XS5zY29yZXMucnVicmljLmhhc093blByb3BlcnR5KFwianVkZ2VzV2hvVm90ZWRcIikgfHwgZmJTbmFwc2hvdC52YWwoKVtzZWxlY3RlZEtleV0uc2NvcmVzLnJ1YnJpYy5qdWRnZXNXaG9Wb3RlZC5pbmRleE9mKHNlbGYuZmV0Y2hGaXJlYmFzZUF1dGgoKS51aWQpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeUtleXMucHVzaChzZWxlY3RlZEtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bUxvYWRlZCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbHJlYWR5Q2hlY2tlZC5pbmRleE9mKHNlbGVjdGVkS2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQWxyZWFkeSBqdWRnZWQgXCIgKyBzZWxlY3RlZEtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHJlYWR5Q2hlY2tlZC5wdXNoKHNlbGVjdGVkS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRIb3dNYW55LS07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5S2V5cy5wdXNoKHNlbGVjdGVkS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1Mb2FkZWQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgY2FsbGJhY2tXYWl0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bUxvYWRlZCA9PT0gbG9hZEhvd01hbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChjYWxsYmFja1dhaXQpO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlbnRyeUtleXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogbG9hZENvbnRlc3RFbnRyeShjb250ZXN0SWQsIGVudHJ5SWQsIGNhbGxiYWNrKVxuICAgICAgICAgKiBMb2FkcyBhIGNvbnRlc3QgZW50cnkgKHdoaWNoIGlzIHNwZWNpZmllZCB2aWEgcHJvdmlkaW5nIGEgY29udGVzdCBpZCBhbmQgYW4gZW50cnkgaWQpLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgc2NyYXRjaHBhZCBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHRoaXMgZW50cnkgcmVzaWRlcyB1bmRlci5cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGVudHJ5SWQ6IFRoZSBzY3JhdGNocGFkIElEIG9mIHRoZSBlbnRyeS5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIHRoZSByZXF1aXJlZCBkYXRhLlxuICAgICAgICAgKiBAdG9kbyAoR2lnYWJ5dGUgR2lhbnQpOiBBZGQgYXV0aGVudGljYXRpb24gdG8gdGhpcyBmdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgbG9hZENvbnRlc3RFbnRyeTogZnVuY3Rpb24oY29udGVzdElkLCBlbnRyeUlkLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIHZhbGlkIGNhbGxiYWNrIGZ1bmN0aW9uLCBleGl0IHRoZSBmdW5jdGlvbi5cbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBSZWZlcmVuY2VzIHRvIEZpcmViYXNlIGNoaWxkcmVuXG4gICAgICAgICAgICBsZXQgY29udGVzdFJlZiA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKTtcbiAgICAgICAgICAgIGxldCBlbnRyaWVzUmVmID0gY29udGVzdFJlZi5jaGlsZChcImVudHJpZXNcIikuY2hpbGQoZW50cnlJZCk7XG5cbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5nZXRQZXJtTGV2ZWwoZnVuY3Rpb24ocGVybUxldmVsKSB7XG4gICAgICAgICAgICAgICAgLy8gQSB2YXJpYWJsZSBjb250YWluaW5nIGEgbGlzdCBvZiBhbGwgdGhlIHByb3BlcnRpZXMgdGhhdCB3ZSBtdXN0IGxvYWQgYmVmb3JlIHdlIGNhbiBpbnZva2Ugb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgdmFyIHJlcXVpcmVkUHJvcHMgPSBbXCJpZFwiLCBcIm5hbWVcIiwgXCJ0aHVtYlwiXTtcblxuICAgICAgICAgICAgICAgIGlmIChwZXJtTGV2ZWwgPj0gNSkge1xuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZFByb3BzLnB1c2goXCJzY29yZXNcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVGhlIEpTT04gb2JqZWN0IHRoYXQgd2UnbGwgcGFzcyBpbnRvIHRoZSBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7IH07XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlcXVpcmVkUHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb3BSZWYgPSBlbnRyaWVzUmVmLmNoaWxkKHJlcXVpcmVkUHJvcHNbaV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHByb3BSZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbcmVxdWlyZWRQcm9wc1tpXV0gPSBzbmFwc2hvdC52YWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhbGxiYWNrRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHNlbGYucmVwb3J0RXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogbG9hZFhDb250ZXN0RW50cmllcyhjb250ZXN0SWQsIGNhbGxiYWNrLCBsb2FkSG93TWFueSlcbiAgICAgICAgICogTG9hZHMgXCJ4XCIgY29udGVzdCBlbnRyaWVzLCBhbmQgcGFzc2VzIHRoZW0gaW50byBhIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgc2NyYXRjaHBhZCBJRCBvZiB0aGUgY29udGVzdCB0aGF0IHdlIHdhbnQgdG8gbG9hZCBlbnRyaWVzIGZyb20uXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgbG9hZGVkIGFsbCB0aGUgcmVxdWlyZWQgZGF0YS5cbiAgICAgICAgICogQHBhcmFtIHtJbnRlZ2VyfSBsb2FkSG93TWFueTogVGhlIG51bWJlciBvZiBlbnRyaWVzIHRoYXQgd2UnZCBsaWtlIHRvIGxvYWQuXG4gICAgICAgICAqL1xuICAgICAgICBsb2FkWENvbnRlc3RFbnRyaWVzOiBmdW5jdGlvbihjb250ZXN0SWQsIGNhbGxiYWNrLCBsb2FkSG93TWFueSwgaW5jbHVkZUp1ZGdlZCA9IHRydWUpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7fTtcblxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmZldGNoQ29udGVzdEVudHJpZXMoY29udGVzdElkLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGVJbmQgPSAwOyBlSW5kIDwgcmVzcG9uc2UubGVuZ3RoOyBlSW5kKyspIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2FkQ29udGVzdEVudHJ5KGNvbnRlc3RJZCwgcmVzcG9uc2VbZUluZF0sIGZ1bmN0aW9uKGVudHJ5RGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhW3Jlc3BvbnNlW2VJbmRdXSA9IGVudHJ5RGF0YTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSByZXNwb25zZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBsb2FkSG93TWFueSwgaW5jbHVkZUp1ZGdlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXREZWZhdWx0UnVicmljcyhjYWxsYmFjaylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIHRoZSBkZWZhdWx0IHJ1YnJpY3NcbiAgICAgICAgICovXG4gICAgICAgIGdldERlZmF1bHRSdWJyaWNzOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG4gICAgICAgICAgICBsZXQgcnVicmljc0NoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJydWJyaWNzXCIpO1xuXG4gICAgICAgICAgICBydWJyaWNzQ2hpbGQub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soc25hcHNob3QudmFsKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXRDb250ZXN0UnVicmljcyhjb250ZXN0SWQsIGNhbGxiYWNrKVxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSB3YW50IHRvIGxvYWQgdGhlIHJ1YnJpY3MgZm9yXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgbG9hZGVkIGFsbCBvZiB0aGUgcnVicmljc1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0Q29udGVzdFJ1YnJpY3M6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7fTtcblxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldERlZmF1bHRSdWJyaWNzKGZ1bmN0aW9uKGRlZmF1bHRSdWJyaWNzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhID0gZGVmYXVsdFJ1YnJpY3M7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaENvbnRlc3QoY29udGVzdElkLCBmdW5jdGlvbihjb250ZXN0UnVicmljcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VzdG9tUnVicmljcyA9IGNvbnRlc3RSdWJyaWNzLnJ1YnJpY3M7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1c3RvbVJ1YnJpY3MgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGN1c3RvbVJ1YnJpYyBpbiBjdXN0b21SdWJyaWNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjYWxsYmFja0RhdGEuaGFzT3duUHJvcGVydHkoY3VzdG9tUnVicmljKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbY3VzdG9tUnVicmljXSA9IGN1c3RvbVJ1YnJpY3NbY3VzdG9tUnVicmljXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXN0b21SdWJyaWNzLmhhc093blByb3BlcnR5KFwiT3JkZXJcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBvSW5kID0gMDsgb0luZCA8IGN1c3RvbVJ1YnJpY3MuT3JkZXIubGVuZ3RoOyBvSW5kKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBjdXJyZW50IHJ1YnJpYyBpdGVtIGlzIGFjdHVhbGx5IGEgdmFsaWQgcnVicmljIGl0ZW0sIGFuZCBtYWtlIHN1cmUgaXQncyBub3QgdGhlIFwiT3JkZXJcIiBpdGVtLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VzdG9tUnVicmljcy5oYXNPd25Qcm9wZXJ0eShjdXN0b21SdWJyaWNzLk9yZGVyW29JbmRdKSAmJiBjdXN0b21SdWJyaWNzLk9yZGVyW29JbmRdICE9PSBcIk9yZGVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0aGlzUnVicmljID0gY3VzdG9tUnVicmljcy5PcmRlcltvSW5kXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrRGF0YS5PcmRlci5pbmRleE9mKHRoaXNSdWJyaWMpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YS5PcmRlci5wdXNoKHRoaXNSdWJyaWMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXN0b21SdWJyaWNzLk9yZGVyID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgIH0sIFtcInJ1YnJpY3NcIl0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBqdWRnZUVudHJ5KGNvbnRlc3RJZCwgZW50cnlJZCwgc2NvcmVEYXRhLCBjYWxsYmFjaylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgd2UncmUganVkZ2luZyBhbiBlbnRyeSBmb3JcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGVudHJ5SWQ6IFRoZSBJRCBvZiB0aGUgZW50cnkgdGhhdCB3ZSdyZSBqdWRnaW5nXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY29yZURhdGE6IFRoZSBzY29yaW5nIGRhdGFcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2UgYWZ0ZXIgd2UndmUgdmFsaWRhdGVkIHRoZSBzY29yZXMsIGFuZCBzdWJtaXR0ZWQgdGhlbS5cbiAgICAgICAgICovXG4gICAgICAgIGp1ZGdlRW50cnk6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgZW50cnlJZCwgc2NvcmVEYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgLy8gMDogQ2hlY2sgdGhlIHVzZXJzIHBlcm0gbGV2ZWwsIGlmIHRoZWlyIHBlcm1MZXZlbCBpc24ndCA+PSA0LCBleGl0LlxuICAgICAgICAgICAgLy8gMTogRmV0Y2ggdGhlIHJ1YnJpY3MgZm9yIHRoZSBjdXJyZW50IGNvbnRlc3QsIHRvIG1ha2Ugc3VyZSB3ZSdyZSBub3QgZG9pbmcgYW55dGhpbmcgZnVua3lcbiAgICAgICAgICAgIC8vIDI6IFZhbGlkYXRlIHRoZSBkYXRhIHRoYXQgd2FzIHN1Ym1pdHRlZCB0byB0aGUgZnVuY3Rpb25cbiAgICAgICAgICAgIC8vIDM6IFN1Ym1pdCB0aGUgZGF0YSB0byBGaXJlYmFzZVxuXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0UGVybUxldmVsKGZ1bmN0aW9uKHBlcm1MZXZlbCkge1xuICAgICAgICAgICAgICAgIGlmIChwZXJtTGV2ZWwgPj0gNCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGhpc0p1ZGdlID0gc2VsZi5mZXRjaEZpcmViYXNlQXV0aCgpLnVpZDtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLmdldENvbnRlc3RSdWJyaWNzKGNvbnRlc3RJZCwgZnVuY3Rpb24oY29udGVzdFJ1YnJpY3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkID0gKGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkID09PSB1bmRlZmluZWQgPyBbXSA6IGNvbnRlc3RSdWJyaWNzLmp1ZGdlc1dob1ZvdGVkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRlc3RSdWJyaWNzLmhhc093blByb3BlcnR5KFwianVkZ2VzV2hvVm90ZWRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWQuaW5kZXhPZih0aGlzSnVkZ2UpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhFUlJPUl9NRVNTQUdFUy5FUlJfQUxSRUFEWV9WT1RFRCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc0p1ZGdlc1ZvdGUgPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgc2NvcmUgaW4gc2NvcmVEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRlc3RSdWJyaWNzLmhhc093blByb3BlcnR5KHNjb3JlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2NvcmVWYWwgPSAtMTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2NvcmVEYXRhW3Njb3JlXSA+IGNvbnRlc3RSdWJyaWNzW3Njb3JlXS5tYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlVmFsID0gY29udGVzdFJ1YnJpY3Nbc2NvcmVdLm1heDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzY29yZURhdGFbc2NvcmVdIDwgY29udGVzdFJ1YnJpY3Nbc2NvcmVdLm1pbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmVWYWwgPSBjb250ZXN0UnVicmljc1tzY29yZV0ubWluO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmVWYWwgPSBzY29yZURhdGFbc2NvcmVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc0p1ZGdlc1ZvdGVbc2NvcmVdID0gc2NvcmVWYWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzSnVkZ2VzVm90ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmV0Y2hDb250ZXN0RW50cnkoY29udGVzdElkLCBlbnRyeUlkLCBmdW5jdGlvbihleGlzdGluZ1Njb3JlRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nU2NvcmVEYXRhID0gZXhpc3RpbmdTY29yZURhdGEuc2NvcmVzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWQucHVzaCh0aGlzSnVkZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGFUb1dyaXRlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqdWRnZXNXaG9Wb3RlZDogY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nU2NvcmVEYXRhLmhhc093blByb3BlcnR5KFwicnVicmljXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleGlzdGluZ1J1YnJpY0l0ZW1TY29yZXMgPSBleGlzdGluZ1Njb3JlRGF0YS5ydWJyaWM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcnVicmljSXRlbXMgPSBjb250ZXN0UnVicmljcztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBydWJyaWNJdGVtIGluIHJ1YnJpY0l0ZW1zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpc0p1ZGdlc1ZvdGUuaGFzT3duUHJvcGVydHkocnVicmljSXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZSBpdGVtOiBcIiArIHJ1YnJpY0l0ZW0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRtcFNjb3JlT2JqID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmc6IChleGlzdGluZ1J1YnJpY0l0ZW1TY29yZXNbcnVicmljSXRlbV0gPT09IHVuZGVmaW5lZCA/IDEgOiBleGlzdGluZ1J1YnJpY0l0ZW1TY29yZXNbcnVicmljSXRlbV0uYXZnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91Z2g6IChleGlzdGluZ1J1YnJpY0l0ZW1TY29yZXNbcnVicmljSXRlbV0gPT09IHVuZGVmaW5lZCA/IDEgOiBleGlzdGluZ1J1YnJpY0l0ZW1TY29yZXNbcnVicmljSXRlbV0ucm91Z2gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhVG9Xcml0ZS5qdWRnZXNXaG9Wb3RlZC5sZW5ndGggLSAxID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcFNjb3JlT2JqLnJvdWdoID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wU2NvcmVPYmouYXZnID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXBTY29yZU9iai5yb3VnaCA9IHRtcFNjb3JlT2JqLnJvdWdoICsgdGhpc0p1ZGdlc1ZvdGVbcnVicmljSXRlbV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wU2NvcmVPYmouYXZnID0gdG1wU2NvcmVPYmoucm91Z2ggLyAoY29udGVzdFJ1YnJpY3MuanVkZ2VzV2hvVm90ZWQubGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUb1dyaXRlW3J1YnJpY0l0ZW1dID0gdG1wU2NvcmVPYmo7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhVG9Xcml0ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmJSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2hpbGQoXCJjb250ZXN0c1wiKS5jaGlsZChjb250ZXN0SWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jaGlsZChcImVudHJpZXNcIikuY2hpbGQoZW50cnlJZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNoaWxkKFwic2NvcmVzXCIpLmNoaWxkKFwicnVicmljXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmJSZWYuc2V0KGRhdGFUb1dyaXRlLCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVwb3J0RXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcInNjb3Jlc1wiXSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKEVSUk9SX01FU1NBR0VTLkVSUl9OT1RfSlVER0UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG4iLCJ2YXIgQ0pTID0gcmVxdWlyZShcIi4uL2JhY2tlbmQvY29udGVzdF9qdWRnaW5nX3N5cy5qc1wiKTtcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvaGVscGVycy5qc1wiKTtcblxubGV0IHVybFBhcmFtcyA9IGhlbHBlcnMuZ2VuZXJhbC5nZXRVcmxQYXJhbXMod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG52YXIgc2l6aW5nID0ge1xuICAgIHdpZHRoOiA0MDAsXG4gICAgaGVpZ2h0OiA0MDBcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZVJ1YnJpY1RhYigkdGFiTGlzdCwgcnVicmljLCBrSW5kKSB7XG4gICAgJHRhYkxpc3QuYXBwZW5kKFxuICAgICAgICAkKFwiPGxpPlwiKVxuICAgICAgICAgICAgLmFkZENsYXNzKFwidGFiIGNvbCBvcHRpb25zLXRhYlwiKVxuICAgICAgICAgICAgLmF0dHIoXCJkYXRhLXNjb3JlLXZhbHVlXCIsIGtJbmQpXG4gICAgICAgICAgICAuYXBwZW5kKCQoXCI8YT5cIilcbiAgICAgICAgICAgICAgICAudGV4dChydWJyaWMua2V5c1trSW5kXSlcbiAgICAgICAgICAgICAgICAuYXR0cihcImhyZWZcIiwgYHJ1YnJpYy0ke2tJbmR9YClcbiAgICAgICAgICAgICAgICAuY2xpY2soKGV2dCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgJHRoaXNFbGVtID0gJChldnQudG9FbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgJHRhYkxpc3QudGFicyhcInNlbGVjdF90YWJcIiwgYHJ1YnJpYy0ke2tJbmR9YCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCR0aGlzRWxlbS5hdHRyKFwiZGF0YS1zY29yZS12YWx1ZVwiKSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIClcbiAgICApO1xufVxuXG5sZXQgY29udHJvbEZhY3RvcmllcyA9IHtcbiAgICBrZXlzKHJ1YnJpYywgZWxlbSkge1xuICAgICAgICBsZXQgJHRhYkxpc3QgPSAkKFwiPHVsPlwiKS5hZGRDbGFzcyhcInRhYnMganVkZ2luZy1jb250cm9sIG9wdGlvbnMtY29udHJvbFwiKS5hdHRyKFwiZGF0YS1ydWJyaWMtaXRlbVwiLCBydWJyaWMucnVicmljSXRlbSk7XG4gICAgICAgIGZvciAobGV0IGtJbmQgPSAwOyBrSW5kIDwgcnVicmljLmtleXMubGVuZ3RoOyBrSW5kKyspIHtcbiAgICAgICAgICAgIGNyZWF0ZVJ1YnJpY1RhYigkdGFiTGlzdCwgcnVicmljLCBrSW5kKTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtLmFwcGVuZCgkdGFiTGlzdCk7XG4gICAgICAgICR0YWJMaXN0LnRhYnMoKTtcbiAgICB9LFxuICAgIHNsaWRlcihydWJyaWMsIGVsZW0pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJIZXkgc2xpZGVycyFcIik7XG4gICAgICAgIGVsZW0uYXBwZW5kKFxuICAgICAgICAgICAgJChcIjxwPlwiKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhcInJhbmdlLWZpZWxkXCIpXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgJChcIjxpbnB1dD5cIikuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJyYW5nZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJtaW5cIjogcnVicmljLm1pbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibWF4XCI6IHJ1YnJpYy5tYXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IHJ1YnJpYy5taW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0ZXBcIjogMVxuICAgICAgICAgICAgICAgICAgICB9KS5hZGRDbGFzcyhcImp1ZGdpbmctY29udHJvbCBzbGlkZXItY29udHJvbFwiKS5hdHRyKFwiZGF0YS1ydWJyaWMtaXRlbVwiLCBydWJyaWMucnVicmljSXRlbSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufTtcblxudmFyIGNyZWF0ZUp1ZGdpbmdDb250cm9sID0gZnVuY3Rpb24ocnVicmljLCB0eXBlKSB7XG4gICAgdmFyIGVsZW0gPSAkKFwiPGRpdj5cIilcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8aDU+XCIpLnRleHQocnVicmljLnJ1YnJpY0l0ZW0ucmVwbGFjZSgvXFxfL2csIFwiIFwiKSlcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoXCJqdWRnaW5nLWNvbnRyb2wtdGl0bGVcIilcbiAgICAgICAgKS5hZGRDbGFzcyhcImNvbCBsNiBtNiBzMTIganVkZ2luZy1jb250cm9sIGNlbnRlci1hbGlnblwiKTtcblxuICAgIGNvbnRyb2xGYWN0b3JpZXNbdHlwZV0ocnVicmljLCBlbGVtKTtcblxuICAgIHJldHVybiBlbGVtO1xufTtcblxudmFyIHNldHVwUGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIENKUy5nZXRQZXJtTGV2ZWwoZnVuY3Rpb24ocGVybUxldmVsKSB7XG4gICAgICAgIGlmICghdXJsUGFyYW1zLmhhc093blByb3BlcnR5KFwiY29udGVzdFwiKSB8fCAhdXJsUGFyYW1zLmhhc093blByb3BlcnR5KFwiZW50cnlcIikpIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiQ29udGVzdCBJRCBhbmQvb3IgRW50cnkgSUQgbm90IHNwZWNpZmllZC4gUmV0dXJuaW5nIHRvIHByZXZpb3VzIHBhZ2UuXCIpO1xuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkuYmFjaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGNvbnRlc3RJZCA9IHVybFBhcmFtcy5jb250ZXN0LnJlcGxhY2UoL1xcIy9nLCBcIlwiKTtcbiAgICAgICAgICAgIGxldCBlbnRyeUlkID0gdXJsUGFyYW1zLmVudHJ5O1xuXG4gICAgICAgICAgICBsZXQgaWZyYW1lVXJsID0gYGh0dHBzOi8vd3d3LmtoYW5hY2FkZW15Lm9yZy9jb21wdXRlci1wcm9ncmFtbWluZy9jb250ZXN0LWVudHJ5LyR7ZW50cnlJZH0vZW1iZWRkZWQ/YnV0dG9ucz1ubyZlZGl0b3I9eWVzJmF1dGhvcj1ubyZ3aWR0aD0ke3NpemluZy53aWR0aH0maGVpZ2h0PSR7c2l6aW5nLmhlaWdodH1gO1xuXG4gICAgICAgICAgICAkKFwiI3ByZXZpZXdcIikuYXBwZW5kKFxuICAgICAgICAgICAgICAgICQoXCI8aWZyYW1lPlwiKS5hdHRyKFwic3JjXCIsIGlmcmFtZVVybCkuY3NzKFwiaGVpZ2h0XCIsIChzaXppbmcuaGVpZ2h0ICsgMTApICsgXCJweFwiKS5hZGRDbGFzcyhcImVudHJ5LWZyYW1lXCIpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAocGVybUxldmVsID49IDQpIHtcbiAgICAgICAgICAgICAgICB2YXIganVkZ2luZ0NvbnRyb2xzQm94ID0gJChcIiNqdWRnaW5nQ29udHJvbHNcIik7XG5cbiAgICAgICAgICAgICAgICBsZXQgJGNvbnRyb2xSb3cgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJyb3dcIik7XG4gICAgICAgICAgICAgICAganVkZ2luZ0NvbnRyb2xzQm94LmFwcGVuZCgkY29udHJvbFJvdyk7XG5cbiAgICAgICAgICAgICAgICBDSlMuZ2V0Q29udGVzdFJ1YnJpY3MoY29udGVzdElkLCBmdW5jdGlvbihydWJyaWNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJ1YnJpY3MpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHJJbmQgPSAwOyBySW5kIDwgcnVicmljcy5PcmRlci5sZW5ndGg7IHJJbmQrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRoaXNSdWJyaWMgPSBydWJyaWNzLk9yZGVyW3JJbmRdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnVicmljVHlwZSA9IFwiXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydWJyaWNzW3RoaXNSdWJyaWNdLmhhc093blByb3BlcnR5KFwia2V5c1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1YnJpY1R5cGUgPSBcImtleXNcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVicmljVHlwZSA9IFwic2xpZGVyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1YnJpY3NbdGhpc1J1YnJpY10ucnVicmljSXRlbSA9IHRoaXNSdWJyaWM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRjb250cm9sUm93LmFwcGVuZChjcmVhdGVKdWRnaW5nQ29udHJvbChydWJyaWNzW3RoaXNSdWJyaWNdLCBydWJyaWNUeXBlKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkY29udHJvbFJvdy5jaGlsZHJlbigpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkY29udHJvbFJvdyA9ICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcInJvd1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqdWRnaW5nQ29udHJvbHNCb3guYXBwZW5kKCRjb250cm9sUm93KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKFwiLmp1ZGdlT25seVwiKS5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIENKUy5mZXRjaENvbnRlc3QodXJsUGFyYW1zLmNvbnRlc3QsIChjb250ZXN0RGF0YSkgPT4ge1xuICAgICAgICBDSlMuZmV0Y2hDb250ZXN0RW50cnkodXJsUGFyYW1zLmNvbnRlc3QsIHVybFBhcmFtcy5lbnRyeSwgKGVudHJ5RGF0YSkgPT4ge1xuICAgICAgICAgICAgJChcIi5lbnRyeS1uYW1lXCIpLnRleHQoYCR7ZW50cnlEYXRhLm5hbWV9YCk7XG4gICAgICAgICAgICAkKFwiLmNvbnRlc3QtbmFtZVwiKS50ZXh0KGBFbnRyeSBpbiAke2NvbnRlc3REYXRhLm5hbWV9YCk7XG4gICAgICAgIH0sIFtcIm5hbWVcIl0pO1xuICAgIH0sIFtcIm5hbWVcIl0pO1xufTtcblxuaGVscGVycy5hdXRoZW50aWNhdGlvbi5zZXR1cFBhZ2VBdXRoKFwiI2F1dGhCdG5cIiwgQ0pTKTtcbiQoXCIuanVkZ2UtbmV4dC1jb250cm9sXCIpLmhpZGUoKTtcbnNldHVwUGFnZSgpO1xuXG4kKFwiLnN1Ym1pdC1zY29yZS1jb250cm9sXCIpLm9uKFwiY2xpY2tcIiwgKGV2dCkgPT4ge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgbGV0IHNlbGYgPSAkKGV2dC50b0VsZW1lbnQpO1xuXG4gICAgJChzZWxmKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpLnRleHQoXCJTdWJtaXR0aW5nIHNjb3Jlcy4uLlwiKTtcbiAgICAkKFwiI2p1ZGdpbmdDb250cm9scyAqXCIpLnByb3AoXCJkaXNhYmxlZFwiLCBcInRydWVcIikuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcblxuICAgIHZhciBzY29yZURhdGEgPSB7fTtcblxuICAgICQoXCIuanVkZ2luZy1jb250cm9sXCIpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgbGV0ICRjb250cm9sRWxlbSA9ICQoaXRlbSk7XG4gICAgICAgIGxldCBydWJyaWNJdGVtID0gJGNvbnRyb2xFbGVtLmF0dHIoXCJkYXRhLXJ1YnJpYy1pdGVtXCIpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHJ1YnJpY0l0ZW0pO1xuXG4gICAgICAgIGlmIChydWJyaWNJdGVtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmICgkY29udHJvbEVsZW0uYXR0cihcImNsYXNzXCIpLmluZGV4T2YoXCJvcHRpb25zLWNvbnRyb2xcIikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgbGV0ICRzZWxlY3RlZEl0ZW0gPSAkY29udHJvbEVsZW0uZmluZChcIi5hY3RpdmVcIik7XG5cbiAgICAgICAgICAgICAgICBzY29yZURhdGFbcnVicmljSXRlbV0gPSBwYXJzZUludCgkc2VsZWN0ZWRJdGVtLnBhcmVudCgpLmF0dHIoXCJkYXRhLXNjb3JlLXZhbHVlXCIpLCAxMCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCRjb250cm9sRWxlbS5hdHRyKFwiY2xhc3NcIikuaW5kZXhPZihcInNsaWRlci1jb250cm9sXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHNjb3JlRGF0YVtydWJyaWNJdGVtXSA9IHBhcnNlSW50KCRjb250cm9sRWxlbS52YWwoKSwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBDSlMuanVkZ2VFbnRyeSh1cmxQYXJhbXMuY29udGVzdCwgdXJsUGFyYW1zLmVudHJ5LCBzY29yZURhdGEsIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgYWxlcnQoZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJChcIiNqdWRnaW5nQ29udHJvbHNcIikuY3NzKFwib3BhY2l0eVwiLCBcIjAuNFwiKTtcblxuICAgICAgICAkKHNlbGYpLnRleHQoXCJTY29yZXMgc3VibWl0dGVkIVwiKTtcblxuICAgICAgICAkKFwiLmp1ZGdlLW5leHQtY29udHJvbFwiKS5zaG93KCk7XG4gICAgfSk7XG59KTtcblxuJChcIi5yZWxvYWQtZW50cnktY29udHJvbFwiKS5vbihcImNsaWNrXCIsICgpID0+IHtcbiAgICAkKFwiLmVudHJ5LWZyYW1lXCIpLmF0dHIoXCJzcmNcIiwgJChcIi5lbnRyeS1mcmFtZVwiKS5hdHRyKFwic3JjXCIpKTtcbn0pO1xuXG4kKFwiLnNldC1kaW1lbnNpb25zLWNvbnRyb2xcIikub24oXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgc2l6aW5nLndpZHRoID0gcGFyc2VJbnQoJChcIltuYW1lPXdpZHRoXVwiKS52YWwoKSwgMTApO1xuICAgIHNpemluZy5oZWlnaHQgPSBwYXJzZUludCgkKFwiW25hbWU9aGVpZ2h0XVwiKS52YWwoKSwgMTApO1xuXG4gICAgY29uc29sZS5sb2coYGh0dHBzOi8vd3d3LmtoYW5hY2FkZW15Lm9yZy9jb21wdXRlci1wcm9ncmFtbWluZy9jb250ZXN0LWVudHJ5LyR7dXJsUGFyYW1zLmVudHJ5fS9lbWJlZGRlZD9idXR0b25zPW5vJmVkaXRvcj15ZXMmYXV0aG9yPW5vJndpZHRoPSR7c2l6aW5nLndpZHRofSZoZWlnaHQ9JHtzaXppbmcuaGVpZ2h0fWApO1xuXG4gICAgJChcIi5lbnRyeS1mcmFtZVwiKS5hdHRyKFwic3JjXCIsIGBodHRwczovL3d3dy5raGFuYWNhZGVteS5vcmcvY29tcHV0ZXItcHJvZ3JhbW1pbmcvY29udGVzdC1lbnRyeS8ke3VybFBhcmFtcy5lbnRyeX0vZW1iZWRkZWQ/YnV0dG9ucz1ubyZlZGl0b3I9eWVzJmF1dGhvcj1ubyZ3aWR0aD0ke3NpemluZy53aWR0aH0maGVpZ2h0PSR7c2l6aW5nLmhlaWdodH1gKTtcbn0pO1xuXG4kKFwiLmp1ZGdlLW5leHQtY29udHJvbFwiKS5vbihcImNsaWNrXCIsICgpID0+IHtcbiAgICBDSlMuZmV0Y2hDb250ZXN0RW50cmllcyh1cmxQYXJhbXMuY29udGVzdCwgZnVuY3Rpb24obmV4dEVudHJ5KSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYGVudHJ5Lmh0bWw/Y29udGVzdD0ke3VybFBhcmFtcy5jb250ZXN0fSZlbnRyeT0ke25leHRFbnRyeVswXX1gO1xuICAgIH0sIDEsIGZhbHNlKTtcbn0pOyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGFkZEFkbWluTGluazogZnVuY3Rpb24oc2VsZWN0b3IsIGNqc1dyYXBwZXIpIHtcbiAgICAgICAgY2pzV3JhcHBlci5nZXRQZXJtTGV2ZWwoZnVuY3Rpb24ocGVybUxldmVsKSB7XG4gICAgICAgICAgICBpZiAocGVybUxldmVsID49IDUpIHtcbiAgICAgICAgICAgICAgICAkKFwiPGxpPlwiKS5hZGRDbGFzcyhcImFjdGl2ZVwiKS5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICQoXCI8YT5cIikuYXR0cihcImhyZWZcIiwgXCIuL2FkbWluL1wiKS50ZXh0KFwiQWRtaW4gZGFzaGJvYXJkXCIpXG4gICAgICAgICAgICAgICAgKS5pbnNlcnRCZWZvcmUoJChzZWxlY3RvcikucGFyZW50KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHNldHVwT25DbGljazogZnVuY3Rpb24oc2VsZWN0b3IsIGNqc1dyYXBwZXIpIHtcbiAgICAgICAgJChzZWxlY3Rvcikub24oXCJjbGlja1wiLCAoZXZ0KSA9PiB7XG4gICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaWYgKGNqc1dyYXBwZXIuZmV0Y2hGaXJlYmFzZUF1dGgoKSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNqc1dyYXBwZXIuYXV0aGVudGljYXRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNqc1dyYXBwZXIuYXV0aGVudGljYXRlKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHNob3dXZWxjb21lOiBmdW5jdGlvbihzZWxlY3RvciwgY2pzV3JhcHBlcikge1xuICAgICAgICBpZiAoY2pzV3JhcHBlci5mZXRjaEZpcmViYXNlQXV0aCgpID09PSBudWxsKSB7XG4gICAgICAgICAgICAkKHNlbGVjdG9yKS50ZXh0KFwiSGVsbG8gZ3Vlc3QhIENsaWNrIG1lIHRvIGxvZyBpbi5cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKHNlbGVjdG9yKS50ZXh0KGBIZWxsbyAke2Nqc1dyYXBwZXIuZmV0Y2hGaXJlYmFzZUF1dGgoKS5nb29nbGUuZGlzcGxheU5hbWV9ISAoTm90IHlvdT8gQ2xpY2sgaGVyZSEpYCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNldHVwUGFnZUF1dGg6IGZ1bmN0aW9uKGF1dGhCdG5TZWxlY3RvciwgY2pzV3JhcHBlcikge1xuICAgICAgICB0aGlzLnNldHVwT25DbGljayhhdXRoQnRuU2VsZWN0b3IsIGNqc1dyYXBwZXIpO1xuICAgICAgICB0aGlzLnNob3dXZWxjb21lKGF1dGhCdG5TZWxlY3RvciwgY2pzV3JhcHBlcik7XG4gICAgICAgIC8vIHRoaXMuYWRkQWRtaW5MaW5rKGF1dGhCdG5TZWxlY3RvciwgY2pzV3JhcHBlcik7XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBnZXRDb29raWUoY29va2llTmFtZSlcbiAgICAgKiBGZXRjaGVzIHRoZSBzcGVjaWZpZWQgY29va2llIGZyb20gdGhlIGJyb3dzZXIsIGFuZCByZXR1cm5zIGl0J3MgdmFsdWUuXG4gICAgICogQGF1dGhvciB3M3NjaG9vbHNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29va2llTmFtZTogVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0aGF0IHdlIHdhbnQgdG8gZmV0Y2guXG4gICAgICogQHJldHVybnMge1N0cmluZ30gY29va2llVmFsdWU6IFRoZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIGNvb2tpZSwgb3IgYW4gZW1wdHkgc3RyaW5nLCBpZiB0aGVyZSBpcyBubyBcIm5vbi1mYWxzeVwiIHZhbHVlLlxuICAgICAqL1xuICAgIGdldENvb2tpZTogZnVuY3Rpb24oY29va2llTmFtZSkge1xuICAgICAgICAvLyBHZXQgdGhlIGNvb2tpZSB3aXRoIG5hbWUgY29va2llIChyZXR1cm4gXCJcIiBpZiBub24tZXhpc3RlbnQpXG4gICAgICAgIGNvb2tpZU5hbWUgPSBjb29raWVOYW1lICsgXCI9XCI7XG4gICAgICAgIC8vIENoZWNrIGFsbCBvZiB0aGUgY29va2llcyBhbmQgdHJ5IHRvIGZpbmQgdGhlIG9uZSBjb250YWluaW5nIG5hbWUuXG4gICAgICAgIHZhciBjb29raWVMaXN0ID0gZG9jdW1lbnQuY29va2llLnNwbGl0KFwiO1wiKTtcbiAgICAgICAgZm9yICh2YXIgY0luZCA9IDA7IGNJbmQgPCBjb29raWVMaXN0Lmxlbmd0aDsgY0luZCArKykge1xuICAgICAgICAgICAgdmFyIGN1ckNvb2tpZSA9IGNvb2tpZUxpc3RbY0luZF07XG4gICAgICAgICAgICB3aGlsZSAoY3VyQ29va2llWzBdID09PSBcIiBcIikge1xuICAgICAgICAgICAgICAgIGN1ckNvb2tpZSA9IGN1ckNvb2tpZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiB3ZSd2ZSBmb3VuZCB0aGUgcmlnaHQgY29va2llLCByZXR1cm4gaXRzIHZhbHVlLlxuICAgICAgICAgICAgaWYgKGN1ckNvb2tpZS5pbmRleE9mKGNvb2tpZU5hbWUpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1ckNvb2tpZS5zdWJzdHJpbmcoY29va2llTmFtZS5sZW5ndGgsIGN1ckNvb2tpZS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgaWYgdGhlIGNvb2tpZSBkb2Vzbid0IGV4aXN0LCByZXR1cm4gXCJcIlxuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIHNldENvb2tpZShjb29raWVOYW1lLCB2YWx1ZSlcbiAgICAgKiBDcmVhdGVzL3VwZGF0ZXMgYSBjb29raWUgd2l0aCB0aGUgZGVzaXJlZCBuYW1lLCBzZXR0aW5nIGl0J3MgdmFsdWUgdG8gXCJ2YWx1ZVwiLlxuICAgICAqIEBhdXRob3IgdzNzY2hvb2xzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvb2tpZU5hbWU6IFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdGhhdCB3ZSB3YW50IHRvIGNyZWF0ZS91cGRhdGUuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlOiBUaGUgdmFsdWUgdG8gYXNzaWduIHRvIHRoZSBjb29raWUuXG4gICAgICovXG4gICAgc2V0Q29va2llOiBmdW5jdGlvbihjb29raWVOYW1lLCB2YWx1ZSkge1xuICAgICAgICAvLyBTZXQgYSBjb29raWUgd2l0aCBuYW1lIGNvb2tpZSBhbmQgdmFsdWUgY29va2llIHRoYXQgd2lsbCBleHBpcmUgMzAgZGF5cyBmcm9tIG5vdy5cbiAgICAgICAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBkLnNldFRpbWUoZC5nZXRUaW1lKCkgKyAoMzAgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG4gICAgICAgIHZhciBleHBpcmVzID0gXCJleHBpcmVzPVwiICsgZC50b1VUQ1N0cmluZygpO1xuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWVOYW1lICsgXCI9XCIgKyB2YWx1ZSArIFwiOyBcIiArIGV4cGlyZXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBnZXRVcmxQYXJhbXMoKVxuICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybDogVGhlIFVSTCB0byBmZXRjaCBVUkwgcGFyYW1ldGVycyBmcm9tXG4gICAgICovXG4gICAgZ2V0VXJsUGFyYW1zOiBmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgdmFyIHVybFBhcmFtcyA9IHt9O1xuXG4gICAgICAgIHZhciBzcGxpdFVybCA9IHVybC5zcGxpdChcIj9cIilbMV07XG5cbiAgICAgICAgaWYgKHNwbGl0VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciB0bXBVcmxQYXJhbXMgPSBzcGxpdFVybC5zcGxpdChcIiZcIik7XG5cbiAgICAgICAgICAgIGZvciAobGV0IHVwSW5kID0gMDsgdXBJbmQgPCB0bXBVcmxQYXJhbXMubGVuZ3RoOyB1cEluZCsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJQYXJhbVN0ciA9IHRtcFVybFBhcmFtc1t1cEluZF07XG5cbiAgICAgICAgICAgICAgICB1cmxQYXJhbXNbY3VyclBhcmFtU3RyLnNwbGl0KFwiPVwiKVswXV0gPSBjdXJyUGFyYW1TdHIuc3BsaXQoXCI9XCIpWzFdXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCNcXCEvZywgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXJsUGFyYW1zO1xuICAgIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgYXV0aGVudGljYXRpb246IHJlcXVpcmUoXCIuL2F1dGhlbnRpY2F0aW9uLmpzXCIpLFxuICAgIGdlbmVyYWw6IHJlcXVpcmUoXCIuL2dlbmVyYWwuanNcIilcbn07Il19
