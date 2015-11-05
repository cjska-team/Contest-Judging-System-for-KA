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
         * fetchContest(contestId, callback)
         * @author Gigabyte Giant (2015)
         * @param {String} contestId: The ID of the contest that you want to load data for
         * @param {Function} callback: The callback function to invoke once we've received the data.
         * @param {Array} properties*: A list of all the properties that you want to load from this contest.
         */
        fetchContest: function fetchContest(contestId, callback, properties) {
            var _this = this;

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

            var _loop = function (propInd) {
                var currProp = requiredProps[propInd];

                contestChild.child(currProp).once("value", function (snapshot) {
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

                var _loop2 = function (propInd) {
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
                    _loop2(propInd);
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

                var _loop3 = function (i) {
                    var propRef = entriesRef.child(requiredProps[i]);

                    propRef.once("value", function (snapshot) {
                        callbackData[requiredProps[i]] = snapshot.val();

                        if (Object.keys(callbackData).length === requiredProps.length) {
                            callback(callbackData);
                        }
                    }, self.reportError);
                };

                for (var i = 0; i < requiredProps.length; i++) {
                    _loop3(i);
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
            // "this" will eventually go out of scope (later on in this function),
            //  that's why we have this variable.
            var self = this;

            this.fetchContestEntries(contestId, function (response) {
                var callbackData = {};

                var _loop4 = function (entryId) {
                    var thisEntryId = response[entryId];

                    self.loadContestEntry(contestId, thisEntryId, function (response) {
                        callbackData[thisEntryId] = response;
                    });
                };

                for (var entryId = 0; entryId < response.length; entryId++) {
                    _loop4(entryId);
                }

                var callbackWait = setInterval(function () {
                    if (Object.keys(callbackData).length === loadHowMany) {
                        clearInterval(callbackWait);
                        callback(callbackData);
                    }
                }, 1000);
            }, loadHowMany);
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

                    for (var customRubric in customRubrics) {
                        if (!callbackData.hasOwnProperty(customRubric)) {
                            callbackData[customRubric] = customRubrics[customRubric];
                        }
                    }

                    for (var oInd = 0; oInd < customRubrics.Order.length; oInd++) {
                        var thisRubric = customRubrics.Order[oInd];

                        if (callbackData.Order.indexOf(thisRubric) === -1) {
                            callbackData.Order.push(thisRubric);
                        }
                    }

                    // callbackData = contestRubrics.rubrics;

                    // for (let defRubric in defaultRubrics) {
                    //     callbackData[defRubric] = defaultRubrics[defRubric];
                    // }

                    // callbackData.Order = defaultRubrics.Order;

                    // console.log(defaultRubrics.Order);

                    // for (let oInd = 0; oInd < contestRubrics.rubrics.Order.length; oInd++) {
                    //     let currRubric = contestRubrics.rubrics.Order[oInd];

                    //     if (callbackData.Order.indexOf(currRubric) === -1) {
                    //         callbackData.Order.push(currRubric);
                    //     }
                    // }

                    callback(callbackData);
                }, ["rubrics"]);
            });
        }
    };
})();

},{}],2:[function(require,module,exports){
"use strict";

var CJS = require("../backend/contest_judging_sys.js");
var helpers = require("../generalPurpose.js");

var fbAuth = CJS.fetchFirebaseAuth();

var createJudgingControl = function createJudgingControl(rubric, type) {
    var elem = $("<div>").append($("<h4>").text(rubric.displayText));

    switch (type) {
        case "keys":
            for (var kInd = 0; kInd < rubric.keys.length; kInd++) {
                elem.append($("<button>").addClass("btn waves-effect waves-light amber judgingBtn").attr("data-score-value", kInd).text(rubric.keys[kInd]).click(function (evt) {
                    var thisElem = evt.toElement;
                    console.log($(thisElem).attr("data-score-value"));
                }));
            }
            break;
        case "slider":
            elem.append($("<input>").attr("type", "range").attr("min", rubric.min).attr("max", rubric.max).attr("value", rubric.min).update(function (evt) {}));
            break;
    }

    return elem;
};

var setupPage = function setupPage() {
    if (fbAuth === null) {
        $("#authBtn").text("Hello, guest! Click me to login.");
    } else {
        $("#authBtn").text("Welcome, " + CJS.fetchFirebaseAuth().google.displayName + "! (Not you? Click here)");
    }

    CJS.getPermLevel(function (permLevel) {
        var urlParams = helpers.getUrlParams(window.location.href);

        console.log(urlParams);

        if (!urlParams.hasOwnProperty("contest") || !urlParams.hasOwnProperty("entry")) {
            alert("Contest ID and/or Entry ID not specified. Returning to previous page.");
            window.history.back();
        } else {
            var contestId = urlParams.contest.replace(/\#/g, "");
            var entryId = urlParams.entry;

            var sizing = {
                width: 400,
                height: 400
            };

            var iframeUrl = "https://www.khanacademy.org/computer-programming/contest-entry/" + entryId + "/embedded?buttons=no&editor=yes&author=no&width=" + sizing.width + "&height=" + sizing.height;

            $("#preview").append($("<iframe>").attr("src", iframeUrl).css("width", "100%").css("height", sizing.height + 10 + "px").css("border", "none"));

            if (permLevel >= 4) {
                var judgingControlsBox = $("#judgingControls");

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

                        rubrics[thisRubric].displayText = thisRubric.replace(/\_/g, " ");

                        judgingControlsBox.append(createJudgingControl(rubrics[thisRubric], rubricType));
                    }
                });
            }
        }
    });
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzIiwiL1VzZXJzL0JyeW5kZW4vc3BhcmsvQ29udGVzdC1KdWRnaW5nLVN5c3RlbS1mb3ItS0Evc3JjL2NsaWVudC9lbnRyeS5qcyIsIi9Vc2Vycy9CcnluZGVuL3NwYXJrL0NvbnRlc3QtSnVkZ2luZy1TeXN0ZW0tZm9yLUtBL3NyYy9nZW5lcmFsUHVycG9zZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLFlBQVc7QUFDekIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO0FBQ3BDLGVBQU87S0FDVjs7O0FBR0QsUUFBSSxZQUFZLEdBQUcsNENBQTRDLENBQUM7OztBQUdoRSxRQUFJLHVCQUF1QixHQUFHLEVBQUUsQ0FBQzs7QUFFakMsV0FBTztBQUNILG1CQUFXLEVBQUUscUJBQVMsS0FBSyxFQUFFO0FBQ3pCLG1CQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3hCO0FBQ0QseUJBQWlCLEVBQUUsNkJBQVc7QUFDMUIsbUJBQU8sQUFBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUUsT0FBTyxFQUFFLENBQUM7U0FDeEQ7QUFDRCxrQkFBVSxFQUFFLG9CQUFTLFFBQVEsRUFBRTtBQUMzQixBQUFDLGdCQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDMUU7Ozs7Ozs7O0FBUUQsb0JBQVksRUFBRSx3QkFBeUI7Z0JBQWhC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LENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQzdELE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7aUJBQzdCO2FBQ0o7O0FBRUQsbUJBQU8sU0FBUyxDQUFDO1NBQ3BCO0tBQ0osQ0FBQztDQUNMLENBQUEsRUFBRyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICAgIGlmICghd2luZG93LmpRdWVyeSB8fCAhd2luZG93LkZpcmViYXNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIHZhcmlhYmxlIGlzIHVzZWQgdG8gc3RvcmUgb3VyIFwiRmlyZWJhc2UgS2V5XCJcbiAgICBsZXQgRklSRUJBU0VfS0VZID0gXCJodHRwczovL2NvbnRlc3QtanVkZ2luZy1zeXMuZmlyZWJhc2Vpby5jb21cIjtcblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgdmFyaWFibGUgaXMgdXNlZCB0byBzcGVjaWZ5IHRoZSBkZWZhdWx0IG51bWJlciBvZiBlbnRyaWVzIHRvIGZldGNoXG4gICAgbGV0IERFRl9OVU1fRU5UUklFU19UT19MT0FEID0gMTA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXBvcnRFcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgICBmZXRjaEZpcmViYXNlQXV0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSkuZ2V0QXV0aCgpO1xuICAgICAgICB9LFxuICAgICAgICBvbmNlQXV0aGVkOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSkub25BdXRoKGNhbGxiYWNrLCB0aGlzLnJlcG9ydEVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGF1dGhlbnRpY2F0ZShsb2dvdXQpXG4gICAgICAgICAqIElmIGxvZ291dCBpcyBmYWxzZSAob3IgdW5kZWZpbmVkKSwgd2UgcmVkaXJlY3QgdG8gYSBnb29nbGUgbG9naW4gcGFnZS5cbiAgICAgICAgICogSWYgbG9nb3V0IGlzIHRydWUsIHdlIGludm9rZSBGaXJlYmFzZSdzIHVuYXV0aCBtZXRob2QgKHRvIGxvZyB0aGUgdXNlciBvdXQpLCBhbmQgcmVsb2FkIHRoZSBwYWdlLlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGxvZ291dCo6IFNob3VsZCB3ZSBsb2cgdGhlIHVzZXIgb3V0PyAoRGVmYXVsdHMgdG8gZmFsc2UpXG4gICAgICAgICAqL1xuICAgICAgICBhdXRoZW50aWNhdGU6IGZ1bmN0aW9uKGxvZ291dCA9IGZhbHNlKSB7XG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgaWYgKCFsb2dvdXQpIHtcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVJlZi5hdXRoV2l0aE9BdXRoUmVkaXJlY3QoXCJnb29nbGVcIiwgdGhpcy5yZXBvcnRFcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcmViYXNlUmVmLnVuYXV0aCgpO1xuXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0UGVybUxldmVsKClcbiAgICAgICAgICogR2V0cyB0aGUgcGVybSBsZXZlbCBvZiB0aGUgdXNlciB0aGF0IGlzIGN1cnJlbnRseSBsb2dnZWQgaW4uXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgcmVjaWV2ZWQgdGhlIGRhdGEuXG4gICAgICAgICAqL1xuICAgICAgICBnZXRQZXJtTGV2ZWw6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBsZXQgYXV0aERhdGEgPSB0aGlzLmZldGNoRmlyZWJhc2VBdXRoKCk7XG5cbiAgICAgICAgICAgIGlmIChhdXRoRGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuICAgICAgICAgICAgICAgIGxldCB0aGlzVXNlckNoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJ1c2Vyc1wiKS5jaGlsZChhdXRoRGF0YS51aWQpO1xuXG4gICAgICAgICAgICAgICAgdGhpc1VzZXJDaGlsZC5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc25hcHNob3QudmFsKCkucGVybUxldmVsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmZXRjaENvbnRlc3QoY29udGVzdElkLCBjYWxsYmFjaylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlc3RJZDogVGhlIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgeW91IHdhbnQgdG8gbG9hZCBkYXRhIGZvclxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIHJlY2VpdmVkIHRoZSBkYXRhLlxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBwcm9wZXJ0aWVzKjogQSBsaXN0IG9mIGFsbCB0aGUgcHJvcGVydGllcyB0aGF0IHlvdSB3YW50IHRvIGxvYWQgZnJvbSB0aGlzIGNvbnRlc3QuXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3Q6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2ssIHByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgfHwgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlZCB0byByZWZlcmVuY2UgRmlyZWJhc2VcbiAgICAgICAgICAgIGxldCBmaXJlYmFzZVJlZiA9IChuZXcgd2luZG93LkZpcmViYXNlKEZJUkVCQVNFX0tFWSkpO1xuXG4gICAgICAgICAgICAvLyBGaXJlYmFzZSBjaGlsZHJlblxuICAgICAgICAgICAgbGV0IGNvbnRlc3RDaGlsZCA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKTtcblxuICAgICAgICAgICAgLy8gUHJvcGVydGllcyB0aGF0IHdlIG11c3QgaGF2ZSBiZWZvcmUgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIGxldCByZXF1aXJlZFByb3BzID0gKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IFtcImlkXCIsIFwibmFtZVwiLCBcImRlc2NcIiwgXCJpbWdcIiwgXCJlbnRyeUNvdW50XCJdIDogcHJvcGVydGllcyk7XG5cbiAgICAgICAgICAgIC8vIFRoZSBvYmplY3QgdGhhdCB3ZSBwYXNzIGludG8gb3VyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0ge307XG5cbiAgICAgICAgICAgIGZvciAobGV0IHByb3BJbmQgPSAwOyBwcm9wSW5kIDwgcmVxdWlyZWRQcm9wcy5sZW5ndGg7IHByb3BJbmQrKykge1xuICAgICAgICAgICAgICAgIGxldCBjdXJyUHJvcCA9IHJlcXVpcmVkUHJvcHNbcHJvcEluZF07XG5cbiAgICAgICAgICAgICAgICBjb250ZXN0Q2hpbGQuY2hpbGQoY3VyclByb3ApLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbY3VyclByb3BdID0gc25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0cyhjYWxsYmFjaylcbiAgICAgICAgICogRmV0Y2hlcyBhbGwgY29udGVzdHMgdGhhdCdyZSBiZWluZyBzdG9yZWQgaW4gRmlyZWJhc2UsIGFuZCBwYXNzZXMgdGhlbSBpbnRvIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgY2FwdHVyZWQgYWxsIHRoZSBkYXRhIHRoYXQgd2UgbmVlZC5cbiAgICAgICAgICogQHRvZG8gKEdpZ2FieXRlIEdpYW50KTogQWRkIGJldHRlciBjb21tZW50cyFcbiAgICAgICAgICovXG4gICAgICAgIGZldGNoQ29udGVzdHM6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8ICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVzZWQgdG8gcmVmZXJlbmNlIEZpcmViYXNlXG4gICAgICAgICAgICBsZXQgZmlyZWJhc2VSZWYgPSAobmV3IHdpbmRvdy5GaXJlYmFzZShGSVJFQkFTRV9LRVkpKTtcblxuICAgICAgICAgICAgLy8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0S2V5c0NoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0S2V5c1wiKTtcbiAgICAgICAgICAgIGxldCBjb250ZXN0c0NoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKTtcblxuICAgICAgICAgICAgLy8gUHJvcGVydGllcyB0aGF0IHdlIG11c3QgaGF2ZSBiZWZvcmUgd2UgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIGxldCByZXF1aXJlZFByb3BzID0gW1xuICAgICAgICAgICAgICAgIFwiaWRcIixcbiAgICAgICAgICAgICAgICBcIm5hbWVcIixcbiAgICAgICAgICAgICAgICBcImRlc2NcIixcbiAgICAgICAgICAgICAgICBcImltZ1wiLFxuICAgICAgICAgICAgICAgIFwiZW50cnlDb3VudFwiXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAvLyBrZXlzV2VGb3VuZCBob2xkcyBhIGxpc3Qgb2YgYWxsIG9mIHRoZSBjb250ZXN0IGtleXMgdGhhdCB3ZSd2ZSBmb3VuZCBzbyBmYXJcbiAgICAgICAgICAgIHZhciBrZXlzV2VGb3VuZCA9IFsgXTtcblxuICAgICAgICAgICAgLy8gY2FsbGJhY2tEYXRhIGlzIHRoZSBvYmplY3QgdGhhdCBnZXRzIHBhc3NlZCBpbnRvIG91ciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHsgfTtcblxuICAgICAgICAgICAgLy8gXCJRdWVyeVwiIG91ciBjb250ZXN0S2V5c0NoaWxkXG4gICAgICAgICAgICBjb250ZXN0S2V5c0NoaWxkLm9yZGVyQnlLZXkoKS5vbihcImNoaWxkX2FkZGVkXCIsIGZ1bmN0aW9uKGZiSXRlbSkge1xuICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgY3VycmVudCBrZXkgdG8gb3VyIFwia2V5c1dlRm91bmRcIiBhcnJheVxuICAgICAgICAgICAgICAgIGtleXNXZUZvdW5kLnB1c2goZmJJdGVtLmtleSgpKTtcblxuICAgICAgICAgICAgICAgIGxldCB0aGlzQ29udGVzdCA9IGNvbnRlc3RzQ2hpbGQuY2hpbGQoZmJJdGVtLmtleSgpKTtcblxuICAgICAgICAgICAgICAgIHZhciB0aGlzQ29udGVzdERhdGEgPSB7IH07XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwcm9wSW5kID0gMDsgcHJvcEluZCA8IHJlcXVpcmVkUHJvcHMubGVuZ3RoOyBwcm9wSW5kKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJQcm9wZXJ0eSA9IHJlcXVpcmVkUHJvcHNbcHJvcEluZF07XG4gICAgICAgICAgICAgICAgICAgIHRoaXNDb250ZXN0LmNoaWxkKGN1cnJQcm9wZXJ0eSkub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKGZiU25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNDb250ZXN0RGF0YVtjdXJyUHJvcGVydHldID0gZmJTbmFwc2hvdC52YWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyAoR2lnYWJ5dGUgR2lhbnQpOiBHZXQgcmlkIG9mIGFsbCB0aGlzIG5lc3RlZCBcImNyYXBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXNDb250ZXN0RGF0YSkubGVuZ3RoID09PSByZXF1aXJlZFByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtmYkl0ZW0ua2V5KCldID0gdGhpc0NvbnRlc3REYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNhbGxiYWNrRGF0YSkubGVuZ3RoID09PSBrZXlzV2VGb3VuZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMucmVwb3J0RXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZmV0Y2hDb250ZXN0RW50cmllcyhjb250ZXN0SWQsIGNhbGxiYWNrKVxuICAgICAgICAgKlxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgS2hhbiBBY2FkZW15IHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSB3YW50IHRvIGZldGNoIGVudHJpZXMgZm9yLlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBhZnRlciB3ZSd2ZSBmZXRjaGVkIGFsbCB0aGUgZGF0YSB0aGF0IHdlIG5lZWQuXG4gICAgICAgICAqIEBwYXJhbSB7SW50ZWdlcn0gbG9hZEhvd01hbnkqOiBUaGUgbnVtYmVyIG9mIGVudHJpZXMgdG8gbG9hZC4gSWYgbm8gdmFsdWUgaXMgcGFzc2VkIHRvIHRoaXMgcGFyYW1ldGVyLFxuICAgICAgICAgKiAgZmFsbGJhY2sgb250byBhIGRlZmF1bHQgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICBmZXRjaENvbnRlc3RFbnRyaWVzOiBmdW5jdGlvbihjb250ZXN0SWQsIGNhbGxiYWNrLCBsb2FkSG93TWFueSA9IERFRl9OVU1fRU5UUklFU19UT19MT0FEKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdmFsaWQgY2FsbGJhY2sgZnVuY3Rpb24sIGV4aXQgdGhlIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZXMgdG8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCB0aGlzQ29udGVzdFJlZiA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY29udGVzdElkKTtcbiAgICAgICAgICAgIGxldCBjb250ZXN0RW50cmllc1JlZiA9IHRoaXNDb250ZXN0UmVmLmNoaWxkKFwiZW50cnlLZXlzXCIpO1xuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgZW50cmllcyB3ZSd2ZSBsb2FkZWRcbiAgICAgICAgICAgIHZhciBudW1Mb2FkZWQgPSAwO1xuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHN0b3JlIGVhY2ggb2YgdGhlIGVudHJpZXMgdGhhdCB3ZSd2ZSBsb2FkZWRcbiAgICAgICAgICAgIHZhciBlbnRyeUtleXMgPSBbIF07XG5cbiAgICAgICAgICAgIGNvbnRlc3RFbnRyaWVzUmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihmYlNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgbGV0IHRtcEVudHJ5S2V5cyA9IGZiU25hcHNob3QudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmVuJ3QgYXQgbGVhc3QgXCJuXCIgZW50cmllcyBmb3IgdGhpcyBjb250ZXN0LCBsb2FkIGFsbCBvZiB0aGVtLlxuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0bXBFbnRyeUtleXMpLmxlbmd0aCA8IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIb3dNYW55ID0gT2JqZWN0LmtleXModG1wRW50cnlLZXlzKS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKG51bUxvYWRlZCA8IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE9iamVjdC5rZXlzKHRtcEVudHJ5S2V5cykubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkS2V5ID0gT2JqZWN0LmtleXModG1wRW50cnlLZXlzKVtyYW5kb21JbmRleF07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJ5S2V5cy5pbmRleE9mKHNlbGVjdGVkS2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5S2V5cy5wdXNoKHNlbGVjdGVkS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bUxvYWRlZCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcy5yZXBvcnRFcnJvcik7XG5cbiAgICAgICAgICAgIGxldCBjYWxsYmFja1dhaXQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVtTG9hZGVkID09PSBsb2FkSG93TWFueSkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhbGxiYWNrV2FpdCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVudHJ5S2V5cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsb2FkQ29udGVzdEVudHJ5KGNvbnRlc3RJZCwgZW50cnlJZCwgY2FsbGJhY2spXG4gICAgICAgICAqIExvYWRzIGEgY29udGVzdCBlbnRyeSAod2hpY2ggaXMgc3BlY2lmaWVkIHZpYSBwcm92aWRpbmcgYSBjb250ZXN0IGlkIGFuZCBhbiBlbnRyeSBpZCkuXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgdGhpcyBlbnRyeSByZXNpZGVzIHVuZGVyLlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZW50cnlJZDogVGhlIHNjcmF0Y2hwYWQgSUQgb2YgdGhlIGVudHJ5LlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjazogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBvbmNlIHdlJ3ZlIGxvYWRlZCBhbGwgdGhlIHJlcXVpcmVkIGRhdGEuXG4gICAgICAgICAqIEB0b2RvIChHaWdhYnl0ZSBHaWFudCk6IEFkZCBhdXRoZW50aWNhdGlvbiB0byB0aGlzIGZ1bmN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBsb2FkQ29udGVzdEVudHJ5OiBmdW5jdGlvbihjb250ZXN0SWQsIGVudHJ5SWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdmFsaWQgY2FsbGJhY2sgZnVuY3Rpb24sIGV4aXQgdGhlIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayB8fCAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2VkIHRvIHJlZmVyZW5jZSBGaXJlYmFzZVxuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG5cbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZXMgdG8gRmlyZWJhc2UgY2hpbGRyZW5cbiAgICAgICAgICAgIGxldCBjb250ZXN0UmVmID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0c1wiKS5jaGlsZChjb250ZXN0SWQpO1xuICAgICAgICAgICAgbGV0IGVudHJpZXNSZWYgPSBjb250ZXN0UmVmLmNoaWxkKFwiZW50cmllc1wiKS5jaGlsZChlbnRyeUlkKTtcblxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldFBlcm1MZXZlbChmdW5jdGlvbihwZXJtTGV2ZWwpIHtcbiAgICAgICAgICAgICAgICAvLyBBIHZhcmlhYmxlIGNvbnRhaW5pbmcgYSBsaXN0IG9mIGFsbCB0aGUgcHJvcGVydGllcyB0aGF0IHdlIG11c3QgbG9hZCBiZWZvcmUgd2UgY2FuIGludm9rZSBvdXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICB2YXIgcmVxdWlyZWRQcm9wcyA9IFtcImlkXCIsIFwibmFtZVwiLCBcInRodW1iXCJdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBlcm1MZXZlbCA+PSA1KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkUHJvcHMucHVzaChcInNjb3Jlc1wiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUaGUgSlNPTiBvYmplY3QgdGhhdCB3ZSdsbCBwYXNzIGludG8gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgdmFyIGNhbGxiYWNrRGF0YSA9IHsgfTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVxdWlyZWRQcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcFJlZiA9IGVudHJpZXNSZWYuY2hpbGQocmVxdWlyZWRQcm9wc1tpXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcHJvcFJlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVtyZXF1aXJlZFByb3BzW2ldXSA9IHNuYXBzaG90LnZhbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IHJlcXVpcmVkUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgc2VsZi5yZXBvcnRFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsb2FkWENvbnRlc3RFbnRyaWVzKGNvbnRlc3RJZCwgY2FsbGJhY2ssIGxvYWRIb3dNYW55KVxuICAgICAgICAgKiBMb2FkcyBcInhcIiBjb250ZXN0IGVudHJpZXMsIGFuZCBwYXNzZXMgdGhlbSBpbnRvIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZXN0SWQ6IFRoZSBzY3JhdGNocGFkIElEIG9mIHRoZSBjb250ZXN0IHRoYXQgd2Ugd2FudCB0byBsb2FkIGVudHJpZXMgZnJvbS5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIHRoZSByZXF1aXJlZCBkYXRhLlxuICAgICAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IGxvYWRIb3dNYW55OiBUaGUgbnVtYmVyIG9mIGVudHJpZXMgdGhhdCB3ZSdkIGxpa2UgdG8gbG9hZC5cbiAgICAgICAgICovXG4gICAgICAgIGxvYWRYQ29udGVzdEVudHJpZXM6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2ssIGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAvLyBcInRoaXNcIiB3aWxsIGV2ZW50dWFsbHkgZ28gb3V0IG9mIHNjb3BlIChsYXRlciBvbiBpbiB0aGlzIGZ1bmN0aW9uKSxcbiAgICAgICAgICAgIC8vICB0aGF0J3Mgd2h5IHdlIGhhdmUgdGhpcyB2YXJpYWJsZS5cbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5mZXRjaENvbnRlc3RFbnRyaWVzKGNvbnRlc3RJZCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2tEYXRhID0geyB9O1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZW50cnlJZCA9IDA7IGVudHJ5SWQgPCByZXNwb25zZS5sZW5ndGg7IGVudHJ5SWQrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGhpc0VudHJ5SWQgPSByZXNwb25zZVtlbnRyeUlkXTtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLmxvYWRDb250ZXN0RW50cnkoY29udGVzdElkLCB0aGlzRW50cnlJZCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRGF0YVt0aGlzRW50cnlJZF0gPSByZXNwb25zZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGNhbGxiYWNrV2FpdCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2FsbGJhY2tEYXRhKS5sZW5ndGggPT09IGxvYWRIb3dNYW55KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhbGxiYWNrV2FpdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICB9LCBsb2FkSG93TWFueSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXREZWZhdWx0UnVicmljcyhjYWxsYmFjaylcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb25jZSB3ZSd2ZSBsb2FkZWQgYWxsIHRoZSBkZWZhdWx0IHJ1YnJpY3NcbiAgICAgICAgICovXG4gICAgICAgIGdldERlZmF1bHRSdWJyaWNzOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgbGV0IGZpcmViYXNlUmVmID0gKG5ldyB3aW5kb3cuRmlyZWJhc2UoRklSRUJBU0VfS0VZKSk7XG4gICAgICAgICAgICBsZXQgcnVicmljc0NoaWxkID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJydWJyaWNzXCIpO1xuXG4gICAgICAgICAgICBydWJyaWNzQ2hpbGQub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soc25hcHNob3QudmFsKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXRDb250ZXN0UnVicmljcyhjb250ZXN0SWQsIGNhbGxiYWNrKVxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVzdElkOiBUaGUgSUQgb2YgdGhlIGNvbnRlc3QgdGhhdCB3ZSB3YW50IHRvIGxvYWQgdGhlIHJ1YnJpY3MgZm9yXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uY2Ugd2UndmUgbG9hZGVkIGFsbCBvZiB0aGUgcnVicmljc1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0Q29udGVzdFJ1YnJpY3M6IGZ1bmN0aW9uKGNvbnRlc3RJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFja0RhdGEgPSB7fTtcblxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldERlZmF1bHRSdWJyaWNzKGZ1bmN0aW9uKGRlZmF1bHRSdWJyaWNzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhID0gZGVmYXVsdFJ1YnJpY3M7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaENvbnRlc3QoY29udGVzdElkLCBmdW5jdGlvbihjb250ZXN0UnVicmljcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VzdG9tUnVicmljcyA9IGNvbnRlc3RSdWJyaWNzLnJ1YnJpY3M7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY3VzdG9tUnVicmljIGluIGN1c3RvbVJ1YnJpY3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2FsbGJhY2tEYXRhLmhhc093blByb3BlcnR5KGN1c3RvbVJ1YnJpYykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0RhdGFbY3VzdG9tUnVicmljXSA9IGN1c3RvbVJ1YnJpY3NbY3VzdG9tUnVicmljXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG9JbmQgPSAwOyBvSW5kIDwgY3VzdG9tUnVicmljcy5PcmRlci5sZW5ndGg7IG9JbmQrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRoaXNSdWJyaWMgPSBjdXN0b21SdWJyaWNzLk9yZGVyW29JbmRdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2tEYXRhLk9yZGVyLmluZGV4T2YodGhpc1J1YnJpYykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tEYXRhLk9yZGVyLnB1c2godGhpc1J1YnJpYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBjYWxsYmFja0RhdGEgPSBjb250ZXN0UnVicmljcy5ydWJyaWNzO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciAobGV0IGRlZlJ1YnJpYyBpbiBkZWZhdWx0UnVicmljcykge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgY2FsbGJhY2tEYXRhW2RlZlJ1YnJpY10gPSBkZWZhdWx0UnVicmljc1tkZWZSdWJyaWNdO1xuICAgICAgICAgICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2FsbGJhY2tEYXRhLk9yZGVyID0gZGVmYXVsdFJ1YnJpY3MuT3JkZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZGVmYXVsdFJ1YnJpY3MuT3JkZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciAobGV0IG9JbmQgPSAwOyBvSW5kIDwgY29udGVzdFJ1YnJpY3MucnVicmljcy5PcmRlci5sZW5ndGg7IG9JbmQrKykge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgbGV0IGN1cnJSdWJyaWMgPSBjb250ZXN0UnVicmljcy5ydWJyaWNzLk9yZGVyW29JbmRdO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBpZiAoY2FsbGJhY2tEYXRhLk9yZGVyLmluZGV4T2YoY3VyclJ1YnJpYykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgY2FsbGJhY2tEYXRhLk9yZGVyLnB1c2goY3VyclJ1YnJpYyk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjYWxsYmFja0RhdGEpO1xuICAgICAgICAgICAgICAgIH0sIFtcInJ1YnJpY3NcIl0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcbiIsInZhciBDSlMgPSByZXF1aXJlKFwiLi4vYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzXCIpO1xudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vZ2VuZXJhbFB1cnBvc2UuanNcIik7XG5cbmxldCBmYkF1dGggPSBDSlMuZmV0Y2hGaXJlYmFzZUF1dGgoKTtcblxudmFyIGNyZWF0ZUp1ZGdpbmdDb250cm9sID0gZnVuY3Rpb24ocnVicmljLCB0eXBlKSB7XG4gICAgdmFyIGVsZW0gPSAkKFwiPGRpdj5cIilcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICQoXCI8aDQ+XCIpLnRleHQocnVicmljLmRpc3BsYXlUZXh0KVxuICAgICAgICApO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgXCJrZXlzXCI6XG4gICAgICAgICAgICBmb3IgKGxldCBrSW5kID0gMDsga0luZCA8IHJ1YnJpYy5rZXlzLmxlbmd0aDsga0luZCsrKSB7XG4gICAgICAgICAgICAgICAgZWxlbS5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICQoXCI8YnV0dG9uPlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKFwiYnRuIHdhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBhbWJlciBqdWRnaW5nQnRuXCIpLmF0dHIoXCJkYXRhLXNjb3JlLXZhbHVlXCIsIGtJbmQpLnRleHQocnVicmljLmtleXNba0luZF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2xpY2soKGV2dCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0aGlzRWxlbSA9IGV2dC50b0VsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJCh0aGlzRWxlbSkuYXR0cihcImRhdGEtc2NvcmUtdmFsdWVcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJzbGlkZXJcIjpcbiAgICAgICAgICAgIGVsZW0uYXBwZW5kKFxuICAgICAgICAgICAgICAgICQoXCI8aW5wdXQ+XCIpLmF0dHIoXCJ0eXBlXCIsIFwicmFuZ2VcIikuYXR0cihcIm1pblwiLCBydWJyaWMubWluKS5hdHRyKFwibWF4XCIsIHJ1YnJpYy5tYXgpLmF0dHIoXCJ2YWx1ZVwiLCBydWJyaWMubWluKVxuICAgICAgICAgICAgICAgICAgICAudXBkYXRlKChldnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBlbGVtO1xufTtcblxudmFyIHNldHVwUGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChmYkF1dGggPT09IG51bGwpIHtcbiAgICAgICAgJChcIiNhdXRoQnRuXCIpLnRleHQoXCJIZWxsbywgZ3Vlc3QhIENsaWNrIG1lIHRvIGxvZ2luLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkKFwiI2F1dGhCdG5cIikudGV4dChgV2VsY29tZSwgJHtDSlMuZmV0Y2hGaXJlYmFzZUF1dGgoKS5nb29nbGUuZGlzcGxheU5hbWV9ISAoTm90IHlvdT8gQ2xpY2sgaGVyZSlgKTtcbiAgICB9XG5cbiAgICBDSlMuZ2V0UGVybUxldmVsKGZ1bmN0aW9uKHBlcm1MZXZlbCkge1xuICAgICAgICBsZXQgdXJsUGFyYW1zID0gaGVscGVycy5nZXRVcmxQYXJhbXMod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHVybFBhcmFtcyk7XG5cbiAgICAgICAgaWYgKCF1cmxQYXJhbXMuaGFzT3duUHJvcGVydHkoXCJjb250ZXN0XCIpIHx8ICF1cmxQYXJhbXMuaGFzT3duUHJvcGVydHkoXCJlbnRyeVwiKSkge1xuICAgICAgICAgICAgYWxlcnQoXCJDb250ZXN0IElEIGFuZC9vciBFbnRyeSBJRCBub3Qgc3BlY2lmaWVkLiBSZXR1cm5pbmcgdG8gcHJldmlvdXMgcGFnZS5cIik7XG4gICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5iYWNrKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgY29udGVzdElkID0gdXJsUGFyYW1zLmNvbnRlc3QucmVwbGFjZSgvXFwjL2csIFwiXCIpO1xuICAgICAgICAgICAgbGV0IGVudHJ5SWQgPSB1cmxQYXJhbXMuZW50cnk7XG5cbiAgICAgICAgICAgIHZhciBzaXppbmcgPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDQwMCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDQwMFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGV0IGlmcmFtZVVybCA9IGBodHRwczovL3d3dy5raGFuYWNhZGVteS5vcmcvY29tcHV0ZXItcHJvZ3JhbW1pbmcvY29udGVzdC1lbnRyeS8ke2VudHJ5SWR9L2VtYmVkZGVkP2J1dHRvbnM9bm8mZWRpdG9yPXllcyZhdXRob3I9bm8md2lkdGg9JHtzaXppbmcud2lkdGh9JmhlaWdodD0ke3NpemluZy5oZWlnaHR9YDtcblxuICAgICAgICAgICAgJChcIiNwcmV2aWV3XCIpLmFwcGVuZChcbiAgICAgICAgICAgICAgICAkKFwiPGlmcmFtZT5cIikuYXR0cihcInNyY1wiLCBpZnJhbWVVcmwpLmNzcyhcIndpZHRoXCIsIFwiMTAwJVwiKS5jc3MoXCJoZWlnaHRcIiwgKHNpemluZy5oZWlnaHQgKyAxMCkgKyBcInB4XCIpLmNzcyhcImJvcmRlclwiLCBcIm5vbmVcIilcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChwZXJtTGV2ZWwgPj0gNCkge1xuICAgICAgICAgICAgICAgIHZhciBqdWRnaW5nQ29udHJvbHNCb3ggPSAkKFwiI2p1ZGdpbmdDb250cm9sc1wiKTtcblxuICAgICAgICAgICAgICAgIENKUy5nZXRDb250ZXN0UnVicmljcyhjb250ZXN0SWQsIGZ1bmN0aW9uKHJ1YnJpY3MpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocnVicmljcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgckluZCA9IDA7IHJJbmQgPCBydWJyaWNzLk9yZGVyLmxlbmd0aDsgckluZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGhpc1J1YnJpYyA9IHJ1YnJpY3MuT3JkZXJbckluZF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydWJyaWNUeXBlID0gXCJcIjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1YnJpY3NbdGhpc1J1YnJpY10uaGFzT3duUHJvcGVydHkoXCJrZXlzXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVicmljVHlwZSA9IFwia2V5c1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWJyaWNUeXBlID0gXCJzbGlkZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcnVicmljc1t0aGlzUnVicmljXS5kaXNwbGF5VGV4dCA9IHRoaXNSdWJyaWMucmVwbGFjZSgvXFxfL2csIFwiIFwiKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAganVkZ2luZ0NvbnRyb2xzQm94LmFwcGVuZChjcmVhdGVKdWRnaW5nQ29udHJvbChydWJyaWNzW3RoaXNSdWJyaWNdLCBydWJyaWNUeXBlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5zZXR1cFBhZ2UoKTtcblxuJChcIiNhdXRoQnRuXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZ0KSB7XG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBpZiAoZmJBdXRoID09PSBudWxsKSB7XG4gICAgICAgIENKUy5hdXRoZW50aWNhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBDSlMuYXV0aGVudGljYXRlKHRydWUpO1xuICAgIH1cbn0pOyIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXRDb29raWUoY29va2llTmFtZSlcbiAgICAgICAgICogRmV0Y2hlcyB0aGUgc3BlY2lmaWVkIGNvb2tpZSBmcm9tIHRoZSBicm93c2VyLCBhbmQgcmV0dXJucyBpdCdzIHZhbHVlLlxuICAgICAgICAgKiBAYXV0aG9yIHczc2Nob29sc1xuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29va2llTmFtZTogVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0aGF0IHdlIHdhbnQgdG8gZmV0Y2guXG4gICAgICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IGNvb2tpZVZhbHVlOiBUaGUgdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBjb29raWUsIG9yIGFuIGVtcHR5IHN0cmluZywgaWYgdGhlcmUgaXMgbm8gXCJub24tZmFsc3lcIiB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIGdldENvb2tpZTogZnVuY3Rpb24oY29va2llTmFtZSkge1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBjb29raWUgd2l0aCBuYW1lIGNvb2tpZSAocmV0dXJuIFwiXCIgaWYgbm9uLWV4aXN0ZW50KVxuICAgICAgICAgICAgY29va2llTmFtZSA9IGNvb2tpZU5hbWUgKyBcIj1cIjtcbiAgICAgICAgICAgIC8vIENoZWNrIGFsbCBvZiB0aGUgY29va2llcyBhbmQgdHJ5IHRvIGZpbmQgdGhlIG9uZSBjb250YWluaW5nIG5hbWUuXG4gICAgICAgICAgICB2YXIgY29va2llTGlzdCA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdChcIjtcIik7XG4gICAgICAgICAgICBmb3IgKHZhciBjSW5kID0gMDsgY0luZCA8IGNvb2tpZUxpc3QubGVuZ3RoOyBjSW5kICsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1ckNvb2tpZSA9IGNvb2tpZUxpc3RbY0luZF07XG4gICAgICAgICAgICAgICAgd2hpbGUgKGN1ckNvb2tpZVswXSA9PT0gXCIgXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VyQ29va2llID0gY3VyQ29va2llLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UndmUgZm91bmQgdGhlIHJpZ2h0IGNvb2tpZSwgcmV0dXJuIGl0cyB2YWx1ZS5cbiAgICAgICAgICAgICAgICBpZiAoY3VyQ29va2llLmluZGV4T2YoY29va2llTmFtZSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1ckNvb2tpZS5zdWJzdHJpbmcoY29va2llTmFtZS5sZW5ndGgsIGN1ckNvb2tpZS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgaWYgdGhlIGNvb2tpZSBkb2Vzbid0IGV4aXN0LCByZXR1cm4gXCJcIlxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBzZXRDb29raWUoY29va2llTmFtZSwgdmFsdWUpXG4gICAgICAgICAqIENyZWF0ZXMvdXBkYXRlcyBhIGNvb2tpZSB3aXRoIHRoZSBkZXNpcmVkIG5hbWUsIHNldHRpbmcgaXQncyB2YWx1ZSB0byBcInZhbHVlXCIuXG4gICAgICAgICAqIEBhdXRob3IgdzNzY2hvb2xzXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb29raWVOYW1lOiBUaGUgbmFtZSBvZiB0aGUgY29va2llIHRoYXQgd2Ugd2FudCB0byBjcmVhdGUvdXBkYXRlLlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWU6IFRoZSB2YWx1ZSB0byBhc3NpZ24gdG8gdGhlIGNvb2tpZS5cbiAgICAgICAgICovXG4gICAgICAgIHNldENvb2tpZTogZnVuY3Rpb24oY29va2llTmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIFNldCBhIGNvb2tpZSB3aXRoIG5hbWUgY29va2llIGFuZCB2YWx1ZSBjb29raWUgdGhhdCB3aWxsIGV4cGlyZSAzMCBkYXlzIGZyb20gbm93LlxuICAgICAgICAgICAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgKDMwICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuICAgICAgICAgICAgdmFyIGV4cGlyZXMgPSBcImV4cGlyZXM9XCIgKyBkLnRvVVRDU3RyaW5nKCk7XG4gICAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWVOYW1lICsgXCI9XCIgKyB2YWx1ZSArIFwiOyBcIiArIGV4cGlyZXM7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXRVcmxQYXJhbXMoKVxuICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsOiBUaGUgVVJMIHRvIGZldGNoIFVSTCBwYXJhbWV0ZXJzIGZyb21cbiAgICAgICAgICovXG4gICAgICAgIGdldFVybFBhcmFtczogZnVuY3Rpb24odXJsKSB7XG4gICAgICAgICAgICB2YXIgdXJsUGFyYW1zID0ge307XG5cbiAgICAgICAgICAgIHZhciBzcGxpdFVybCA9IHVybC5zcGxpdChcIj9cIilbMV07XG5cbiAgICAgICAgICAgIGlmIChzcGxpdFVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRtcFVybFBhcmFtcyA9IHNwbGl0VXJsLnNwbGl0KFwiJlwiKTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IHVwSW5kID0gMDsgdXBJbmQgPCB0bXBVcmxQYXJhbXMubGVuZ3RoOyB1cEluZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyUGFyYW1TdHIgPSB0bXBVcmxQYXJhbXNbdXBJbmRdO1xuXG4gICAgICAgICAgICAgICAgICAgIHVybFBhcmFtc1tjdXJyUGFyYW1TdHIuc3BsaXQoXCI9XCIpWzBdXSA9IGN1cnJQYXJhbVN0ci5zcGxpdChcIj1cIilbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCNcXCEvZywgXCJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdXJsUGFyYW1zO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG4iXX0=
