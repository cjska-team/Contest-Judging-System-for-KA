/***
 * This file is where all the general purpose, reusable code should go!
***/
/* This function can be used to inject scripts into pages. It returns the created <script> element. */
/* The reason we make it a global function even though it's in the below namespace is because outside JavaScript files might need to use this function after this function loads, but before the namespace is loaded. */
window.includeFunc = function(path) {
    /* Create a script tag */
    var scriptTag = document.createElement("script");

    /* Set the new script tag's src attribute to the location of the script that we want to include */
    scriptTag.src = path;

    /* Append the new script tag to the page. */
    document.body.appendChild(scriptTag);

    /* Return the new script tag. */
    return scriptTag;
};

/* Function wrapper to create this.*/
window.Contest_Judging_System = (function() {

    /* jQuery and Firebase are both dependencies for this project. If we don't have them, exit the function immediately. */
    /* TODO: If a project dependency doesn't exist, go ahead an inject it. */
    if (!window.jQuery || !window.Firebase || !window.KA_API) {
        console.log("[this.Namespace] Needs jQuery, Firebase, and KA_API");
        return;
    }

    /* Return an object containing everything that we want in this namespace. */
    return {
        Firebase: window.Firebase,
        include: window.includeFunc,
        /***
         * logError()
         * Logs errors to the Javascript console.
         * @author Noble Mushtak (2015)
         * @param {Any} error: The error to log to the Javascript console.
        ***/
        logError: function(error) {
            console.error(error);
        },
        /***
         * getGETParams()
         * Extracts the GET params from the URL.
         * @author Noble Mushtak (2015)
         * @returns {Object} params: An object containing all the GET parameters and their values.
        ***/
        getGETParams: function() {
            /* If there's no question mark in our URL, return {}: */
            var qIndex = window.location.href.indexOf("?");
            if (qIndex === -1) {
                return {};
            }
            /* Get the part of the URL with the GET params: */
            var paramURL = window.location.href.substring(qIndex+1, window.location.href.length);
            /* Get rid of the hashtag if there's a hashtag: */
            var hIndex = paramURL.indexOf("#");
            if (hIndex !== -1) {
                paramURL = paramURL.substring(0, hIndex);
            }

            /* Get the different param snippets: */
            var paramSnippets = paramURL.split("&");
            /* Our GET parameters: */
            var params = {};
            /* Add a param for each paramSnippet: */
            for (var pInd = 0; pInd < paramSnippets.length; pInd++) {
                /* Split the paramSnippet on the equal sign: */
                var paramParts = paramSnippets[pInd].split("=");
                /* If there's no equal sign, let the value equal "": */
                if (paramParts.length === 1) {
                    params[paramParts[0]] = "";
                }
                /* Otherwise, set params normally: */
                else {
                    params[paramParts[0]] = paramParts[1];
                }
            }
            /* Finally, return params: */
            return params;
        },
        /***
         * getCookie()
         * Fetches the specified cookie from the browser, and returns it's value.
         * @author w3schools
         * @param {String} cookie: The name of the cookie that we want to load.
        ***/
        getCookie: function(cookie) {
            /* Get the cookie with name cookie (return "" if non-existent) */
            var name = cookie + "=";
            /* Check all of the cookies and try to find the one containing name. */
            var cookieList = document.cookie.split(';');
            for (var cInd = 0; cInd < cookieList.length; cInd++) {
                var curCookie = cookieList[cInd];
                while (curCookie[0] === ' ') {
                    curCookie = curCookie.substring(1);
                }
                /* If we've found the right cookie, return its value. */
                if (curCookie.indexOf(name) === 0) {
                    return curCookie.substring(name.length, curCookie.length);
                }
            }
            /* Otherwise, if the cookie doesn't exist, return "" */
            return "";
        },
        /***
         * setCookie()
         * Creates/updates a cookie with the desired name and value.
         * @author w3schools
         * @param {String} cookie: The name of the cookie to create/update
         * @param {String} value: The value to set the cooke to.
        ***/
        setCookie: function(cookie, value) {
            /* Set a cookie with name cookie and value cookie that will expire 30 days from now. */
            var d = new Date();
            d.setTime(d.getTime() + (30*24*60*60*1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cookie + "=" + value + "; " + expires;
        },
        /***
         * getFirebaseAuth()
         * Fetches the authentication object from Firebase (if any), and returns it.
         * @author Gigabyte Giant, Noble Mushtak (2015)
         * @returns {Object} Firebase Authentication object (or null, if one doesn't exist)
        ***/
        getFirebaseAuth: function() {
            /* Declare a new instance of the Firebase object, used to reference our Firebase instance. */
            var firebaseRef = new this.Firebase("https://contest-judging-sys.firebaseio.com/");

            /* Fetch, and return, the authentication object (or null, if there isn't one). */
            return firebaseRef.getAuth();
        },
        /***
         * getRubrics()
         * Fetches all the default rubric items from Firebase.
         * @author Gigabyte Giant, Noble Mushtak (2015)
         * @param {Function} callback(rubrics): The callback function to invoke once the query is done.
        ***/
        getRubrics: function(callback) {
            /* Declare a new instance of the Firebase object, used to reference our Firebase instance. */
            var firebaseRef = new this.Firebase("https://contest-judging-sys.firebaseio.com/");

            /* Declare a new variable, and store the "rubrics" child in it. */
            var fbRubrics = firebaseRef.child("rubrics");

            /* Declare a new JSON object, that will be used to store all of our rubric items. */
            var rubrics = { };

            /* Query all the data from Firebase, and push the JSON keys into our object. */
            fbRubrics.orderByKey().on("child_added", function(responseData) {
                rubrics[responseData.key()] = responseData.val();
            }, this.logError);

            /* After all of the data has been recieved... */
            fbRubrics.once("value", function() {
                /* ...invoke our callback. */
                callback(rubrics);
            }, this.logError);
        },
        /***
         * getRubricsForContest()
         * Fetches all the rubric items for the specified contest.
         * @author Gigabyte Giant, Noble Mushtak (2015)
         * @param {String} contestId: The Khan Academy Scratchpad ID of the contest that we want to load rubric items for.
         * @param {Function} callback(rubrics): The callback function to invoke once the query is done.
        ***/
        getRubricsForContest: function(contestId, callback) {
            /* Fetch the default rubric items */
            this.getRubrics(function(rubrics) {
                /* Fetch the custom rubric items */
                window.Contest_Judging_System.loadContest(contestId, function(contestData) {
                    /* If custom rubric items exist, add them to the rubrics object. */
                    if (contestData.rubrics !== null) {
                        for (var crInd in contestData.rubrics) {
                            /* Wrap the body of a for-in loop with an if-statement, to filter unwanted properties. */
                            /* More info: https://jslinterrors.com/the-body-of-a-for-in-should-be-wrapped-in-an-if-statement */
                            if (contestData.rubrics.hasOwnProperty(crInd)) {
                                /* If the current rubric item isn't our "Order" rubric, add it to the rubric object. */
                                if (crInd !== "Order") {
                                    rubrics[crInd] = contestData.rubrics[crInd];
                                } else {
                                    /* Loop through our "Order" rubric item, so we can specify the order in which we want to show the rubric items */
                                    for (var croInd = 0; croInd < contestData.rubrics.Order.length; croInd++) {
                                        rubrics.Order.push(contestData.rubrics.Order[croInd]);
                                    }
                                }
                            }
                        }
                    }

                    /* Invoke the callback, and pass the "rubrics" object into it. */
                    callback(rubrics);
                });
            });
        },
        /***
         * getStoredContests()
         * Fetches all the contests that we have stored on Firebase, and passes them into a callback function.
         * @author Gigabyte Giant, Noble Mushtak (2015)
         * @param {Function} callback(contests): The callback function to invoke once the query is done.
        ***/
        getStoredContests: function(callback) {
            /* Declare a new instance of the Firebase object, used to reference our Firebase instance. */
            var fbRef = new this.Firebase("https://contest-judging-sys.firebaseio.com/");

            /* Declare a new variable to hold the "contestKeys" child */
            var contestKeys = fbRef.child("contestKeys");

            /* Declare a new variable to hold the "contests" child */
            var contests = fbRef.child("contests");

            /* Declare an empty array, that'll be used to store all of the contest keys that we find */
            var foundContestKeys = [];

            /* Declare an empty object, that'll be used to store all of the data that we want to pass into our callback */
            var callbackData = {};

            /* Declare an array that contains all of the properties that *must be loaded* before we invoke our callback  */
            var props = ["desc", "id", "img", "name", "entryCount"];

            /* Query the "contestKeys" child */
            contestKeys.orderByKey().on("child_added", function(item) {
                /* Insert the current key, into our "foundContestKeys" array. */
                var key = item.key();
                foundContestKeys.push(key);

                /* Fetch the current contest from Firebase. */
                var curContest = contests.child(key);

                /* Declare an empty object that'll hold all the data for the current contest */
                var curContestData = {};

                /* Any local functions that we'll need to use to help prevent Javascript "gotchas" from surfacing */
                var getStoredContestsFunctions = {
                    "fetchContestProperties": function(propInd) {
                        curContest.child(props[propInd]).once("value", function(snapshot) {
                            curContestData[props[propInd]] = snapshot.val();
                            /* If we have all the required properties, add this contest to our "callbackData" object. */
                            if (Object.keys(curContestData).length === props.length) {
                                callbackData[key] = curContestData;
                            }
                        }, window.Contest_Judging_System.logError);
                    }
                };

                /* Fetch the data for all of the required properties */
                for (var ckpropInd = 0; ckpropInd < props.length; ckpropInd++) {
                    /* Invoke our "fetchContestProperties" function, this prevents JSLint from yelling at us, and it prevents function closure errors. */
                    getStoredContestsFunctions.fetchContestProperties(ckpropInd);

                    /* Make sure we don't lose "i"s value. */
                    // (function(i) {
                    //     curContest.child(props[i]).once("value", function(snapshot) {
                    //         curContestData[props[i]] = snapshot.val();
                    //         /* If we have all the required properties, add this contest to our "callbackData" object. */
                    //         if (Object.keys(curContestData).length === props.length) {
                    //             callbackData[key] = curContestData;
                    //         }
                    //     }, this.logError);
                    // })(ckpropInd);
                }
            }, this.logError);

            /* Once the "contestKeys" query is done, check to make sure we have all the data, and invoke our callback. */
            contestKeys.once("value", function() {
                var checkDone = setTimeout(function() {
                    if (Object.keys(callbackData).length === foundContestKeys.length) {
                        clearInterval(checkDone);
                        callback(callbackData);
                    }
                }, 1000);
            }, this.logError);
        },
        /***
         * loadContest()
         * Fetches the desired contest from Firebase, and passes it into a callback function.
         * @author Gigabyte Giant, Noble Mushtak (2015)
         * @param {String} contestId: The Khan Academy Scratchpad ID of the contest that we want to load.
         * @param {Function} callback(contest): The callback function to invoke once the query is done.
        ***/
        loadContest: function(contestId, callback) {
            /* Declare a new instance of the Firebase object, used to reference our Firebase instance. */
            var firebaseRef = new this.Firebase("https://contest-judging-sys.firebaseio.com/");

            /* Declare a new variable, and use it to store the "contests/<contestId>" child (where "<contestId>" is the ID of the contest that we want to load) from Firebase. */
            var contestRef = firebaseRef.child("contests").child(contestId);

            /* Declare an empty object that'll be used to hold all the data that we want to pass into our callback function. */
            var callbackData = {};

            /* Declare an array that contains all of the properties that *must be loaded* before we invoke our callback  */
            var props = ["desc", "id", "img", "name", "entryCount", "entryKeys", "rubrics"];

            /* Any local functions that we'll need to use to help prevent Javascript "gotchas" from surfacing */
            var loadContestFunctions = {
                "fetchContestProperties": function(propInd) {
                    /* Once this property has been loaded from Firebase, add it to our "callbackData" object. */
                    contestRef.child(props[propInd]).once("value", function(snapshot) {
                        callbackData[props[propInd]] = snapshot.val();
                    }, this.logError);
                }
            };

            /* Fetch each of the required properties for this contest, from Firebase. */
            for (var cpropInd = 0; cpropInd < props.length; cpropInd++) {
                /* Invoke our "fetchContestProperties" function, this prevents JSLint from yelling at us, and it prevents function closure errors. */
                loadContestFunctions.fetchContestProperties(cpropInd);

                /* Make sure we don't lose "i"s value. */
                // (function(i) {
                //     /* Once this property has been loaded from Firebase, add it to our "callbackData" object. */
                //     contestRef.child(props[i]).once("value", function(snapshot) {
                //         callbackData[props[i]] = snapshot.val();
                //     }, this.logError);
                // })(cpropInd);
            }

            /* Every second, run a check to see if we have all the data that we need, if we do, invoke our callback. */
            var checkDone = setTimeout(function() {
                if (Object.keys(callbackData).length === props.length) {
                    /* Stop checking if we're done: */
                    clearTimeout(checkDone);
                    /* Invoke our callback function, and pass our "callbackData" object into it. */
                    callback(callbackData);
                }
            }, 1000);
        },
        /***
         * loadEntry()
         * Loads a specific entry to a specific contest, and passes it into a callback function.
         * @author Gigabyte Giant, Noble Mushtak (2015)
         * @param {String} contestId: The Khan Academy Scratchpad ID of the contest that we want to load an entry for.
         * @param {String} entryId: The Khan Academy Scratchpad ID of the entry that we want to load.
         * @param {Int} permLevel: The permissions level of the currently logged in user.
         * @param {Function} callback(entry): The callback function to invoke once the query is done.
        ***/
        loadEntry: function(contestId, entryId, permLevel, callback) {
            /* Declare a new instance of the Firebase object, used to reference our Firebase instance. */
            var fbRef = new this.Firebase("https://contest-judging-sys.firebaseio.com/contests/" + contestId + "/entries/" + entryId.replace("#", ""));

            /* Declare an empty object that'll be used to hold all the data that we want to pass into our callback */
            var callbackData = {};

            /* Declare an array that contains all of the properties that *must be loaded* before we invoke our callback  */
            var props = ["id", "thumb", "name"];

            /* If the currently logged in user has a "permLevel" that is allowed to read scores, add "scores" to our property list. */
            if (permLevel >= 5) {
                props.push("scores");
            }

            /* Any local functions that we'll need to use to help prevent Javascript "gotchas" from surfacing */
            var loadEntryFunctions = {
                "fetchEntryProperties": function(propInd) {
                    /* Once the current property has been loaded from Firebase, add it to our "callbackData" object */
                    fbRef.child(props[propInd]).once("value", function(snapshot) {
                        callbackData[props[propInd]] = snapshot.val();
                    }, this.logError);
                }
            };

            /* Load the data for each of the required properties */
            for (var epropInd = 0; epropInd < props.length; epropInd++) {
                /* Invoke our "fetchEntryProperties" function, this prevents JSLint from yelling at us, and it prevents function closure errors. */
                loadEntryFunctions.fetchEntryProperties(epropInd);

                /* Make sure we don't lose "i"s value. */
                // (function(i) {
                //     /* Once the current property has been loaded from Firebase, add it to our "callbackData" object */
                //     fbRef.child(props[i]).once("value", function(snapshot) {
                //         callbackData[props[i]] = snapshot.val();
                //     }, this.logError);
                // })(epropInd);
            }

            /* Every second, run a check to see if we have all the data that we need, if we do, invoke our callback. */
            var checkDone = setTimeout(function() {
                if (Object.keys(callbackData).length === props.length) {
                    /* Stop checking if we're done: */
                    clearTimeout(checkDone);
                    /* Invoke our callback function, and pass it our "callbackData" object */
                    callback(callbackData);
                }
            }, 1000);
        },
        /***
         * get_N_Entries()
         * Loads "n" random entries from Firebase, and passes them into a callback function.
         * @author Gigabyte Giant, Noble Mushtak (2015)
         * @param {Int} n: The number of entries we'd like to load
         * @param {String} contestId: The Khan Academy Scratchpad ID of the contest that we want to load entries from.
         * @param {Int} permLevel: The permissions level of the currently logged in user.
         * @param {Function} callback(entries): The callback function to invoke once we've loaded all the entries that we can/need.
        ***/
        get_N_Entries: function(n, contestId, permLevel, uid, includeJudged, callback) {
            /* Declare a boolean variable that'll be used to determine whether or not we've loaded all the entries that we can/need. */
            var contestData;

            /* Declare an empty JSON object that'll be used to store all of the entries that we've loaded. */
            var pickedEntries = { };

            /* Declare an integer variable that'll be used to keep track of the number of entries that we've loaded. */
            var numEntries = 0;

            /* Load the contest that has the ID of "contestId" */
            window.Contest_Judging_System.loadContest(contestId, function(contestDataLocal) {
                /* Assign the data that we recieved from "Contest_Judging_System.loadContest", to our "contestData" object */
                contestData = contestDataLocal;

                /* Declare an array of all the entry keys for this contest. */
                var entriesKeys = Object.keys(contestData.entryKeys || { });

                /* Determine how many entries we're going to load. We'll load "n", if there's enough, otherwise, we'll load all entries if there isn't at least "n" entries. */
                numEntries = (entriesKeys.length < n) ? entriesKeys.length : n;

                /* Declare an empty array that'll be used to store the keys of each entry that we've already picked. */
                var pickedKeys = [ ];

                /* If we still don't have enough entries, try and load more. */
                while (pickedKeys.length < numEntries) {
                    /* Pick a random index */
                    var randIndex = Math.floor( Math.random() * entriesKeys.length );
                    /* Get the key from the index that we picked */
                    var pickedKey = entriesKeys[randIndex];

                    /* ...pick it. */
                    pickedKeys.push(pickedKey);
                    /* Get rid of it from entriesKeys: */
                    entriesKeys.splice(entriesKeys.indexOf(pickedKey), 1);
                    /* Function wrapper to save pickedKey: */
                    (function(pickedKey) {
                        /* Set pickedEntries[pickedKey] to the entry data: */
                        window.Contest_Judging_System.loadEntry(contestId, pickedKey, permLevel, function(entryData) {
                            /* Do not include this entry if we don't want judged entries and it's already been judged: */
                            if (!includeJudged && entryData.hasOwnProperty("scores") && entryData.scores.rubric.hasOwnProperty("judgesWhoVoted") && entryData.scores.rubric.judgesWhoVoted.indexOf(uid) !== -1) {
                                console.log("This entry has already been judged.");
                                /* Decrement numEntries since we're not going to include this entry as we've already judged it: */
                                numEntries--;
                                return;
                            }
                            if (!includeJudged) {
                                console.log("This entry hasn't been judged.");
                            }
                            /* Add the entry into pickedEntries: */
                            pickedEntries[pickedKey] = entryData;
                            /* If we're done, call the callback: */
                            if (Object.keys(pickedEntries).length === numEntries) {
                                callback(contestData, pickedEntries);
                            }
                        });
                    })(pickedKey);
                }
            });
        },
        /***
         * sync()
         * This function is used to make sure that Firebase has the latest data from Khan Academy.
         * @author Gigabyte Giant (2015)
         * @param {Function} callback(dataFromKA): The callback function that we want to invoke once we're done syncing the data.
        ***/
        sync: function(callback) {
            /*
             * sync() just fetches the latest data from Khan Academy and Firebase, and compares it. It is not run in the client, but in a secret bot on http://gigabytegiant.com, but not in this Git repo.
             * We have two objects; kaData and fbData. We get the data using the KA_API and the above getStoredContests() method.
             * Once both requests have finished, we set fbData to kaData using the Firebase set() method.
             * Originally authored by Gigabyte Giant
             */
            /* These two Booleans check whether or not both requests have been completed. */
            var completed = {
                firebase: false,
                khanacademy: false
            };

            /* Our two objects of data */
            var kaData;
            var fbData;

            /* Get all of the contests from Khan Academy */
            window.KA_API.getContests(function(response) {
                /* When done, set kaData to the contests and set completed.khanacademy to true. */
                kaData = response;
                completed.khanacademy = true;
            });
            /* Get all of the known contests from Firebase */
            this.getStoredContests(function(response) {
                /* When done, set fbData to our stored contests and set completed.firebase to true. */
                fbData = response;
                completed.firebase = true;
            });

            /* Create a new reference to Firebase to use later on when pushing contests to Firebase. */
            var fbRef = new this.Firebase("https://contest-judging-sys.firebaseio.com/");
            var contestsFBRef = fbRef.child("contests");

            /* Every second, we check if both requests have been completed and if they have, we stop checking if both requests have been completed and set fbRef to kaData using the Firebase set() method. */
            var recievedData = setInterval(function() {
                if (completed.firebase && completed.khanacademy) {
                    clearInterval(recievedData);

                    /* The following objects are used for our "diff" checking */
                    var toAddToFirebase = { };
                    var toRemoveFromFirebase = { };
                    var entriesToAdd = { };
                    var entriesToRemove = { };

                    /* Loop through all the data we recieved from Khan Academy; and see if we already have it in Firebase. */
                    for (var kdInd in kaData) {
                        /* Wrap the body of a for-in loop with an if-statement, to filter unwanted properties. */
                        /* More info: https://jslinterrors.com/the-body-of-a-for-in-should-be-wrapped-in-an-if-statement */
                        if (kaData.hasOwnProperty(kdInd)) {
                            if (!fbData.hasOwnProperty(kdInd)) {
                                // Most likely a new contest; add it to Firebase!
                                console.log("[sync] We found a new contest! Contest ID: " + kdInd);
                                toAddToFirebase[kdInd] = kaData[kdInd];
                            } else {
                                // We have this contest in Firebase; so now let's see if we have all the entries
                                for (var kdentInd in kaData[kdInd].entries) {
                                    /* Wrap the body of a for-in loop with an if-statement, to filter unwanted properties. */
                                    /* More info: https://jslinterrors.com/the-body-of-a-for-in-should-be-wrapped-in-an-if-statement */
                                    if (kaData[kdInd].entries.hasOwnProperty(kdentInd)) {
                                        if (!fbData[kdInd].entries.hasOwnProperty(kdentInd)) {
                                            // New entry! Add to Firebase.
                                            console.log("[sync] We found a new entry! Contest ID: " + kdInd + ". Entry ID: " + kdentInd);
                                            /* TODO */
                                            if (!entriesToAdd.hasOwnProperty(kdInd)) {
                                                entriesToAdd[kdInd] = [];
                                                entriesToAdd[kdInd].push( kaData[kdInd].entries[kdentInd] );
                                            } else {
                                                entriesToAdd[kdInd].push( kaData[kdInd].entries[kdentInd] );
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    /* Loop through all the data we recieved from Firebase; and see if it still exists on Khan Academy. */
                    for (var fbInd in fbData) {
                        /* Wrap the body of a for-in loop with an if-statement, to filter unwanted properties. */
                        /* More info: https://jslinterrors.com/the-body-of-a-for-in-should-be-wrapped-in-an-if-statement */
                        if (fbData.hasOwnProperty(fbInd)) {
                            if (!kaData.hasOwnProperty(fbInd)) {
                                // Contest removed. Delete from Firebase
                                console.log("[sync] We found a contest that no longer exists. ID: " + fbInd);
                                toRemoveFromFirebase[fbInd] = fbData[fbInd];
                            } else {
                                // Contest still exists. Now let's see if any entries have been removed.
                                for (var fbentInd in fbData[fbInd].entries) {
                                    /* Wrap the body of a for-in loop with an if-statement, to filter unwanted properties. */
                                    /* More info: https://jslinterrors.com/the-body-of-a-for-in-should-be-wrapped-in-an-if-statement */
                                    if (fbData[fbInd].entries.hasOwnProperty(fbentInd)) {
                                        if (!kaData[fbInd].entries.hasOwnProperty(fbentInd)) {
                                            // Entry no longer exists on Khan Academy; delete from Firebase (or mark as archived).
                                            console.log("[sync] We found an entry that doesn't exist anymore! Contest ID: " + fbInd + ". Entry ID: " + fbentInd);
                                            /* TODO */
                                            if (!entriesToRemove.hasOwnProperty(fbInd)) {
                                                entriesToRemove[fbInd] = [];
                                                entriesToRemove[fbInd].push(fbentInd);
                                            } else {
                                                entriesToRemove[fbInd].push(fbentInd);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    /* Add what we don't have; and remove what Khan Academy *doesn't* have. */
                    for (var cta in toAddToFirebase) {
                        /* Wrap the body of a for-in loop with an if-statement, to filter unwanted properties. */
                        /* More info: https://jslinterrors.com/the-body-of-a-for-in-should-be-wrapped-in-an-if-statement */
                        if (toAddToFirebase.hasOwnProperty(cta)) {
                            /* Add to Firebase! */
                            contestsFBRef.child(cta).set(toAddToFirebase[cta]);
                            fbRef.child("contestKeys").child(cta).set(true);
                        }
                    }
                    for (var ctr in toRemoveFromFirebase) {
                        /* Wrap the body of a for-in loop with an if-statement, to filter unwanted properties. */
                        /* More info: https://jslinterrors.com/the-body-of-a-for-in-should-be-wrapped-in-an-if-statement */
                        if (toRemoveFromFirebase.hasOwnProperty(ctr)) {
                            // Remove from Firebase!
                            contestsFBRef.child(ctr).set(null);
                            // remove from contest key list
                            fbRef.child("contestKeys").child(ctr).set(null);
                        }
                    }
                    for (var eta in entriesToAdd) {
                        /* Wrap the body of a for-in loop with an if-statement, to filter unwanted properties. */
                        /* More info: https://jslinterrors.com/the-body-of-a-for-in-should-be-wrapped-in-an-if-statement */
                        if (entriesToAdd.hasOwnProperty(eta)) {
                            /* Add all the new entries to Firebase */
                            for (var eaInd = 0; eaInd < entriesToAdd[eta].length; eaInd++) {
                                console.log("[sync] Adding " + entriesToAdd[eta][eaInd].id + " to Firebase.");
                                contestsFBRef.child(eta).child("entries").child(entriesToAdd[eta][eaInd].id).set(entriesToAdd[eta][eaInd]);
                                // push to contest entry keys list
                                contestsFBRef.child(eta).child("entryKeys").child(entriesToAdd[eta][eaInd].id).set(true);
                            }
                        }
                    }
                    for (var etr in entriesToRemove) {
                        /* Wrap the body of a for-in loop with an if-statement, to filter unwanted properties. */
                        /* More info: https://jslinterrors.com/the-body-of-a-for-in-should-be-wrapped-in-an-if-statement */
                        if (entriesToRemove.hasOwnProperty(etr)) {
                            /* Remove all the old entries from Firebase */
                            for (var erInd = 0; erInd < entriesToRemove[etr].length; erInd++) {
                                console.log("[sync] Removing " + entriesToRemove[etr][erInd] + " from Firebase!");
                                contestsFBRef.child(etr).child("entries").child(entriesToRemove[etr][erInd]).set(null);
                                // remove from the entry keys list
                                contestsFBRef.child(etr).child("entryKeys").child(entriesToRemove[etr][erInd]).set(null);
                            }
                        }
                    }

                    console.log("[sync] Done");
                    callback(kaData);
                }
            }, 1000);
        },
        /***
         * logUserIn()
         * [Attempts to] log a user in, and then invokes a callback function with the authentication data provided by Firebase.
         * @author Gigabyte Giant, Noble Mushtak (2015)
         * @param {String} type: The type of authentication method that we want to use. (Either "popup" or "redirect")
         * @param {Function} callback(authData): The callback function to invoke once the user has been logged in.
        ***/
        logUserIn: function(type, callback) {
            /* Connect to Firebase: */
            var fbRef = new this.Firebase("https://contest-judging-sys.firebaseio.com");
            /* The login method: */
            var loginMethod = {
                "popup": "authWithOAuthPopup",
                "redirect": "authWithOAuthRedirect"
            }[type];
            /* Try to log the user in: */

            fbRef[loginMethod]("google", function(error, authData) {
                /* If a Firebase error occurs... */
                if (error) {
                    /* ...alert the user, and... */
                    window.alert("An error occured. Please try again later.");
                    /* ...log the error to the console, and... */
                    console.error(error);
                    /* ...exit the function. */
                    return;
                }

                /* Create a reference to the "users" child on Firebase */
                var usersRef = fbRef.child("users");
                /* Whenever the query to Firebase is done, and we've retrieved the data we need... */
                usersRef.once("value", function(snapshot) {
                    /* ...check to see if this Auth UID exists, if it doesn't... */
                    if (!snapshot.hasChild(authData.uid)) {
                        /* ...add it to Firebase, and give it the default permLevel of "1". */
                        usersRef.child(authData.uid).set({
                            name: authData.google.displayName,
                            permLevel: 1
                            /* Log errors: */
                        }, this.logError);
                        /* Also, log a message to the console. */
                        console.log("Added new user to Firebase. Name: " + authData.google.displayName + " Permission Level: 1");
                    }
                    /* ...log a message to the console saying that the user was logged in, and... */
                    console.log("User logged in!");
                    /* ...call the callback function, passing it the authData that we recieved. */
                    callback(authData);
                }, this.logError);
            }, { remember: "default" });
        },
        /***
         * getUserData()
         * Fetches a users data from Firebase, and passes it into a callback function.
         * @author Noble Mushtak (2015)
         * @param {String} userID: The Google UID of the user to fetch data for
         * @param {Function} callback(userData): The callback function to invoke once we've loaded the user's data.
        ***/
        getUserData: function(userID, callback) {
            /* Get the data of the user with uid userID and then call the callback while passing the data through the callback: */
            /* Get the Firebase data */
            var fbRef = new this.Firebase("https://contest-judging-sys.firebaseio.com");
            var users = fbRef.child("users");

            /* Get the user info: */
            users.once("value", function(usersSnapshot) {
                /* Make sure the user exists in Firebase. If they don't: */
                if (!usersSnapshot.hasChild(userID)) {
                    /* Get the Firebase authentication data: */
                    var fbAuth = this.getFirebaseAuth();
                    /* User doesn't exist in Firebase, which means they cannot be an admin. Therefore, set them in Firebase with lowest possible permissions. */
                    var userData = {
                        name: fbAuth.google.displayName,
                        permLevel: 1
                    };
                    /* Log errors with .logError: */
                    users.child(userID).set(userData, this.logError);
                    /* Call the callback */
                    callback(userData);
                }
                /* Otherwise, go straight to calling the callback: */
                else {
                    callback(usersSnapshot.val()[userID]);
                }
                /* Log errors: */
            }, this.logError);
        },
        /***
         * logInAndGetUserData()
         * Invokes two of our functions; one to log the user in, and the other to fetch the user's data.
         * @author Noble Mushtak, Gigabyte Giant (2015)
         * @param {String} type: The type of authentication method that we want to use. (Either "popup" or "redirect")
         * @param {Function} callback: The callback function to invoke once we've logged the user in, and have recieved their data from Firebase.
        ***/
        logInAndGetUserData: function(type, callback) {
            /* This function combines logging in and getting the user data so it logs in the user if they're not already logged in and passes the auth data and user data to the callback: */
            /* Get the Firebase auth data: */
            var fbAuth = this.getFirebaseAuth();
            /* If they're not logged in: */
            if (fbAuth === null) {
                /* Log them in: */
                this.logUserIn(type, function(authData) {
                    /* Set fbAuth: */
                    fbAuth = authData;
                    /* Get the user data: */
                    this.getUserData(fbAuth.uid, function(userData) {
                        /* Call callback: */
                        callback(fbAuth, userData);
                    });
                });
            }
            /* Otherwise, just get the data: */
            else {
                this.getUserData(fbAuth.uid, function(userData) {
                    /* Call callback: */
                    callback(fbAuth, userData);
                });
            }
        },
        /***
         * judgeEntry()
         * Judges the specified entry for a certain contest, which will update that entries score in Firebase.
         * @author Gigabyte Giant (2015)
         * @param {String} contest: The Khan Academy Scratchpad ID of the contest that we want to judge an entry from.
         * @param {String} entry: The Khan Academy Scratchpad ID of the entry that we're going to judge.
         * @param {Object} scoreData: A JSON object containing the scores submitted by this judge.
         * @param {Int} permLevel: The permissions level of the currently logged in user.
         * @param {Function} callback(newScoreObj): The callback function to invoke once the new scores have been submitted to Firebase.
        ***/
        judgeEntry: function(contest, entry, scoreData, permLevel, callback) {
            /* Get the rubrics from Firebase: */
            this.getRubricsForContest(contest, function(contestRubrics) {
                /* Load the Firebase data of this entry of this contest and then... */
                this.loadEntry(contest, entry, permLevel, function(entryData) {
                    /* Find the judges who voted (or an empty array if noone voted yet) */
                    var judgesWhoVoted = entryData.scores.rubric.judgesWhoVoted === undefined ? [] : entryData.scores.rubric.judgesWhoVoted;
                    /* Get the current rubric score */
                    var currentRubricScore = entryData.scores.rubric;
                    /* Get the Firebase auth data */
                    var fbAuth = this.getFirebaseAuth();

                    /* If this judge hasn't voted on this entry yet... */
                    if (judgesWhoVoted.indexOf(fbAuth.uid) === -1) {
                        /* Push the uid of this judge into judgesWhoVoted */
                        judgesWhoVoted.push(fbAuth.uid);
                        var numJudges = judgesWhoVoted.length;

                        /* Create a new object for storing scores */
                        var newScoreObj = {judgesWhoVoted: judgesWhoVoted};
                        /* Loop through the rubric: */
                        for (var _i = 0; _i < contestRubrics.Order.length; _i++) {
                            /* Get the rubric item: */
                            var k = contestRubrics.Order[_i];
                            /* If this property is not in currentRubricScore yet, add it in: */
                            if (!currentRubricScore.hasOwnProperty(k)) {
                                currentRubricScore[k] = {rough: 0, avg: 0};
                            }
                            /* Otherwise,  this is the first judge to vote, make sure we're starting off from 0: */
                            else if (judgesWhoVoted.length === 1) {
                                currentRubricScore[k].rough = 0;
                            }
                            console.log(currentRubricScore[k].rough, scoreData[k], numJudges);
                            newScoreObj[k] = {
                                rough: currentRubricScore[k].rough+scoreData[k],
                                avg: Math.round((parseInt(currentRubricScore[k].rough, 10)+scoreData[k])/numJudges)
                            };
                        }

                        /* Set the new scores to newScoreObj */
                        var thisEntry = new this.Firebase("https://contest-judging-sys.firebaseio.com/contests/" + contest + "/entries/" + entry + "/scores/");
                        /* Log errors with .logError: */
                        thisEntry.child("rubric").set(newScoreObj, this.logError);
                        /* Tell the user that it worked! */
                        window.alert("This entry has been judged. Hooray!");
                        /* Pass newScoreObj through callback: */
                        callback(newScoreObj);
                    }
                    /* If this judge has already judged this entry, tell them that they've already done so. */
                    else {
                        window.alert("You've already judged this entry!");
                    }
                });
            });
        },
        /***
         * createContest()
         * Creates a new contest, and adds it to Firebase.
         * @author Gigabyte Giant (2015)
         * @param {String} contestId: The Khan Academy Scratchpad ID of the program that'll be used as the root for a contest.
         * @param {Object} contestRubrics: All of the custom rubric items for this contest.
         * @param {Function} callback: The callback function to invoke once we've added the new contest to Firebase.
        ***/
        createContest: function(contestId, contestRubrics, callback) {
            /* Get Firebase refs:: */
            var fbRef = new this.Firebase("https://contest-judging-sys.firebaseio.com/");
            var fbContestRef = fbRef.child("contests");
            var fbContestKeysRef = fbRef.child("contestKeys");

            /* Send AJAX request to get info on contest: */
            $.ajax({
                type: "GET",
                url: window.KA_API.urls.scratchpadInfo(contestId),
                async: true,
                complete: function(response) {
                    var programData = response.responseJSON;

                    /* Connect to Firebase: */
                    fbContestRef.once("value", function(snapshot) {
                        /* Get the program info: */
                        var id = contestId;
                        var name = programData.translatedTitle;
                        var img = programData.imagePath;
                        var description = programData.description;
                        var rubrics = snapshot.child(id).hasChild("rubrics") ? snapshot.child(id).child("rubrics").val() : {};

                        /* Merge rubrics and contestRubrics: */
                        for (var cR in contestRubrics) {
                            /* Wrap the body of a for-in loop with an if-statement, to filter unwanted properties. */
                            /* More info: https://jslinterrors.com/the-body-of-a-for-in-should-be-wrapped-in-an-if-statement */
                            if (contestRubrics.hasOwnProperty(cR)) {
                                if (!rubrics.hasOwnProperty(cR)) {
                                    rubrics[cR] = contestRubrics[cR];
                                }
                            }
                        }
                        /* Merge rubrics.Order and contestRubrics.Order: */
                        for (var ccroInd = 0; ccroInd < contestRubrics.Order.length; ccroInd++) {
                            if (rubrics.Order.indexOf(contestRubrics.Order[ccroInd]) === -1) {
                                rubrics.Order.push(contestRubrics.Order[ccroInd]);
                            }
                        }

                        /* Get the new Firebase data: */
                        var newFbData = {
                            id: id,
                            name: name,
                            img: img,
                            desc: description,
                            rubrics: rubrics
                        };

                        /* Check if the contest exists  */
                        var contestExists = snapshot.hasChild(id);
                        /* If the contest doesn't exist: */
                        if (!contestExists) {
                            /* If it doesn't exist, add it to fbContestKeys and set .cannotDestroy to true: */
                            newFbData.cannotDestroy = true;
                            fbContestKeysRef.child(id).set(true, function(err) {
                                /* Log errors: */
                                if (err) { this.logError(err); }
                                /* When we're done, update fbContestRef: */
                                else { updateFirebase(); }
                            });
                        }
                        /* Otherwise, go straight to updating fbContestRef: */
                        else { updateFirebase(); }

                        function updateFirebase() {
                            /* This function updates fbContestRef: */
                            fbContestRef.child(id).update(newFbData, function(err) {
                                /* Log errors: */
                                if (err) { this.logError(err); }
                                /* Once we're done, call the callback with a link to the new contest judging page: */
                                else { callback(window.location.href.replace("/admin/new_contest.html", "/contest.html?contest=" + contestId + "&entries=30")); }
                            });
                        }
                        /* Log errors: */
                    }, this.logError);
                }
            });
        }
    };
})();
