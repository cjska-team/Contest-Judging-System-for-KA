/***
 * This file is where all the general purpose, reusable code should go!
***/
/* This function can be used to inject scripts into pages. It returns the created <script> element. */
/* The reason we make it a global function even though it's in the below namespace is because outside JavaScript files might need to use this function after this function loads, but before the namespace is loaded. */
window.includeFunc = function(path) {
    var scriptTag = document.createElement("script");
    scriptTag.src = path;
    document.body.appendChild(scriptTag);
    return scriptTag;
};

window.Contest_Judging_System = (function() {
    /* Function wrapper to create Contest_Judging_System */
    
    /* jQuery and Firebase are both dependencies for this project. If we don't have them, exit the function immediately. */
    /* TODO: If a project dependency doesn't exist, go ahead an inject it. */
    if (!window.jQuery || !window.Firebase || !window.KA_API) {
        console.log("[Contest_Judging_System Namespace] Needs jQuery, Firebase, and KA_API");
        return;
    }

    /* Everything from this namespace will be placed in the object that is returned. */
    return {
        /* Puts the script injection function inside of this namespace. */
        include: includeFunc,
        /* This function takes an error and logs it into the console. We pass this into Firebase calls so that no errors are silenced. */
        logError: function(error) { if (error) console.error(error); },
        /* This function gets the GET params of a URL: */
        getGETParams: function() {
            /* If there's no question mark in our URL, return {}: */
            var qIndex = window.location.href.indexOf("?");
            if (qIndex == -1) return {};
            /* Get the part of the URL with the GET params: */
            var paramURL = window.location.href.substring(qIndex+1, window.location.href.length);
            /* Get rid of the hashtag if there's a hashtag: */
            var hIndex = paramURL.indexOf("#");
            if (hIndex != -1) paramURL = paramURL.substring(0, hIndex);
            
            /* Get the different param snippets: */
            var paramSnippets = paramURL.split("&");
            /* Our GET parameters: */
            var params = {};
            /* Add a param for each paramSnippet: */
            for (var i = 0; i < paramSnippets.length; i++) {
                /* Split the paramSnippet on the equal sign: */
                var paramParts = paramSnippets[i].split("=");
                /* If there's no equal sign, let the value equal "": */
                if (paramParts.length == 1) params[paramParts[0]] = "";
                /* Otherwise, set params normally: */
                else params[paramParts[0]] = paramParts[1];
            }
            /* Finally, return params: */
            return params;
        },
        /* Cookie functions provided by w3schools */
        getCookie: function(cookie) {
            /* Get the cookie with name cookie (return "" if non-existent) */
            var name = cookie + "=";
            /* Check all of the cookies and try to find the one containing name. */
            var cookieList = document.cookie.split(';');
            for (var i = 0; i < cookieList.length; i++) {
                var curCookie = cookieList[i];
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
        setCookie: function(cookie, value) {
            /* Set a cookie with name cookie and value cookie that will expire 30 days from now. */
            var d = new Date();
            d.setTime(d.getTime() + (30*24*60*60*1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cookie + "=" + value + "; " + expires;
        },
        /* This function gets the authentication object. */
        getFirebaseAuth: function() {
            /* Connect to our Firebase app. */
            var firebaseRef = new Firebase("https://contest-judging-sys.firebaseio.com/");
            /* Return the authentication object: */
            return firebaseRef.getAuth();
        },
        /* This function gets the default rubric that we've defined in Firebase. */
        getRubrics: function(callback) {
            /* Connect to our Firebase app. */
            var firebaseRef = new Firebase("https://contest-judging-sys.firebaseio.com/");

            /* We're going to messing around with the data in our "rubrics" object. Let's go ahead and grab that "child". */
            var fbRubrics = firebaseRef.child("rubrics");

            /* This array will hold all of the Rubrics that we've defined in our array. */
            var rubrics = { };

            /* Query all the data from Firebase, and push the JSON keys into our array. */
            fbRubrics.orderByKey().on("child_added", function(responseData) {
                rubrics[responseData.key()] = responseData.val();
                /* Log errors: */
            }, Contest_Judging_System.logError);

            /* Once all our data has been loaded from Firebase, invoke our callback. */
            fbRubrics.once("value", function() {
                callback(rubrics);
                /* Log errors: */
            }, Contest_Judging_System.logError);
        },
        /* This function gets the rubrics for a specific contest: */
        getRubricsForContest: function(contestId, callback) {
            /* Get the default rubrics: */
            Contest_Judging_System.getRubrics(function(rubrics) {
                /* Now check for a custom rubrics: */
                Contest_Judging_System.loadContest(contestId, function(contestData) {
                     /* If there is a custom rubrics, merge it with rubrics: */
                     if (contestData.rubrics !== null) {
                         for (var k in contestData.rubrics) {
                             if (k !== "Order") {
                                 rubrics[k] = contestData.rubrics[k];
                             } else {
                                 /* Merge the .Order arrays: */
                                 for (var i = 0; i < contestData.rubrics.Order.length; i++) rubrics.Order.push(contestData.rubrics.Order[i]);
                             }
                         }
                     }
                     /* Pass rubrics through callback: */
                     callback(rubrics);
                });
            });
        },
        /* This function gets all the contests that we have stored on Firebase and passes them into a callback function. */
        getStoredContests: function(callback) {
            /* This is the object containing the paths to the contests within our Firebase database. */
            var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/contestKeys/");
            /* This is all of the contests: */
            var contests = new Firebase("https://contest-judging-sys.firebaseio.com/contests/");
            /* This is an object to hold all of the data from fbRef. */
            var fbRefData = [];
            /* This is the data we need to give to callback: */
            var callbackData = {};
            /* These are the property names that callbackData[CONTEST-ID] needs to have: */
            var props = ["desc", "id", "img", "name", "entryCount"];
            
            /* Get all of the contest data: */
            fbRef.orderByKey().on("child_added", function(item) {
                /* Push the data to fbRefData: */
                var key = item.key();
                fbRefData.push(key);
                /* Get the current contest: */
                var curContest = contests.child(key);
                /* The data for this contest: */
                var curContestData = {};
                /* Get data for all props: */
                for (var i = 0; i < props.length; i++) {
                    /* Save the value of i with a function wrapper. */
                    (function(i) {
                        curContest.child(props[i]).once("value", function(snapshot) {
                            curContestData[props[i]] = snapshot.val();
                            /* If we've got all the props, update callbackData. */
                            if (Object.keys(curContestData).length === props.length) {
                                callbackData[key] = curContestData;
                            }
                        }, Contest_Judging_System.logError);
                    })(i);
                }
                /* Log errors: */
            }, Contest_Judging_System.logError);
            
            /* Once we're done querying fbRef: */
            fbRef.once("value", function(data) {
                /* Don't call callback until we're done checking all curContests! */
                /* Check if we have all of the data for all curContests every second: */
                var checkDone = setInterval(function() {
                    /* If we do: */
                    if (Object.keys(callbackData).length === fbRefData.length) {
                        /* Stop checking if we're done: */
                        clearInterval(checkDone);
                        /* Call the callback with callbackData: */
                        callback(callbackData);
                    }
                }, 1000);
                /* Log errors: */
            }, Contest_Judging_System.logError);
        },
        /* Loads a specific contest from Firebase. */
        loadContest: function(contestId, callback) {
            /* Connect to our Firebase app */
            var firebaseRef = new Firebase("https://contest-judging-sys.firebaseio.com/");
            /* Since we're only going to be dealing with contests in this function, go ahead and create a reference to the "contests" "child". Then, choose the contestId child of that.*/
            var contestRef = firebaseRef.child("contests").child(contestId);
            /* This is what we're going to pass through callback: */
            var callbackData = {};
            /* These are the property names that callbackData needs to have: */
            var props = ["desc", "id", "img", "name", "entryCount", "entryKeys", "rubrics"];
            
            /* Get the data for all of the props: */
            for (var i = 0; i < props.length; i++) {
                /* Put this in a function wrapper to save the value of i: */
                (function(i) {
                    contestRef.child(props[i]).once("value", function(snapshot) {
                        /* Set the data once we've got it. */
                        callbackData[props[i]] = snapshot.val();
                        /* Log errors: */
                    }, Contest_Judging_System.logError);
                })(i);
            }

            /* Check every second if we're done: */
            var checkDone = setInterval(function() {
                /* If we're done: */
                if (Object.keys(callbackData).length === props.length) {
                    /* Stop checking if we're done: */
                    clearTimeout(checkDone);
                    /* Call the callback: */
                    callback(callbackData);
                }
            }, 1000);
        },
        /* Load a specific contest entry, based on ID */
        loadEntry: function(contestId, entryId, permLevel, callback) {
            /* Connect to Firebase: */
            var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/contests/"+contestId+"/entries/"+entryId);
            /* This is what we're going to pass through callback: */
            var callbackData = {};
            /* These are the property names that callbackData needs to have: */
            var props = ["id", "thumb", "name"];
            /* Include the scores if they can read the scores: */
            if (permLevel >= 4) {
                props.push("scores");
            }
            
            /* Get the data for all of the props: */
            for (var i = 0; i < props.length; i++) {
                /* Put this in a function wrapper to save the value of i: */
                (function(i) {
                    fbRef.child(props[i]).once("value", function(snapshot) {
                        /* Set the data once we've got it. */
                        callbackData[props[i]] = snapshot.val();
                        /* Log errors: */
                    }, Contest_Judging_System.logError);
                })(i);
            }

            /* Check every second if we're done: */
            var checkDone = setInterval(function() {
                /* If we're done: */
                if (Object.keys(callbackData).length === props.length) {
                    /* Stop checking if we're done: */
                    clearTimeout(checkDone);
                    /* Call the callback: */
                    callback(callbackData);
                }
            }, 1000);
        },
        /* Gets N random entries (where N is the number of contests to get) and passes them along with the contest data of contestId into a callback. */
        get_N_Entries: function(n, contestId, permLevel, uid, includeJudged, callback) {
            console.log(uid);
            /* This bool is true iff we're done picking the n entries. */
            var done = false;
            /* This is the contest data: */
            var contestData;
            /* This JSON object stores each of the entries we've picked out to display to the judge */
            var pickedEntries = { };

            /* This variable is used to store the number of entries for this contest. */
            var numEntries = 0;

            Contest_Judging_System.loadContest(contestId, function(contestDataLocal) {
                /* Set contestData: */
                contestData = contestDataLocal;
                /* Declare a variable to hold an array of keys for entries */
                var entriesKeys = Object.keys(contestData.entryKeys || { });
                /* These are the number of entries we will turn. We will turn either n entries or all of the entriess if there are less than n. */
                numEntries = (entriesKeys.length < n) ? entriesKeys.length : n;

                /* An array to store the keys that we've already picked */
                var pickedKeys = [ ];

                /* While we still need keys to return... */
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
                        Contest_Judging_System.loadEntry(contestId, pickedKey, permLevel, function(entryData) {
                            /* Do not include this entry if we don't want judged entries and it's already been judged: */
                            if (!includeJudged && entryData.hasOwnProperty("scores") && entryData.scores.rubric.hasOwnProperty("judgesWhoVoted") && entryData.scores.rubric.judgesWhoVoted.indexOf(uid) !== -1) {
                                console.log("This entry has already been judged.");
                                /* Decrement numEntries since we're not going to include this entry as we've already judged it: */
                                numEntries--;
                                return;
                            }
                            console.log("This entry hasn't been judged.");
                            pickedEntries[pickedKey] = entryData;
                        });
                    })(pickedKey);
                }
                    
                /* Tell the below setInterval() that we're done when we're done. */
                done = true;
            });

            /* Check if we're done every second and when we are, call the callback and stop checking if we're done. */
            var finishedInterval = setInterval(function() {
                console.log(Object.keys(pickedEntries).length, numEntries);
                if (done && Object.keys(pickedEntries).length === numEntries) {
                    clearInterval(finishedInterval);
                    callback(contestData, pickedEntries);
                }
            }, 1000);
        },
        /* Get 'n' of the top entries for the specified contest, and pass them into a callback function. */
        getTopEntries: function(howMany, contestId, callback) {
            var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/");
            var contestsRef = fbRef.child("contests");
            var chosenContest = contestsRef.child(contestId);
            var entriesRef = chosenContest.child(entries);

            /* TODO (@GigabyteGiant): Finish this function */
        },
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
            KA_API.getContests(function(response) {
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
            var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/");
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
                    for (var i in kaData) {
                        if (!fbData.hasOwnProperty(i)) {
                            // Most likely a new contest; add it to Firebase!
                            console.log("[sync] We found a new contest! Contest ID: " + i);
                            toAddToFirebase[i] = kaData[i];
                        } else {
                            // We have this contest in Firebase; so now let's see if we have all the entries
                            for (var j in kaData[i].entries) {
                                if (!fbData[i].entries.hasOwnProperty(j)) {
                                    // New entry! Add to Firebase.
                                    console.log("[sync] We found a new entry! Contest ID: " + i + ". Entry ID: " + j);
                                    /* TODO */
                                    if (!entriesToAdd.hasOwnProperty(i)) {
                                        entriesToAdd[i] = [];
                                        entriesToAdd[i].push( kaData[i].entries[j] );
                                    } else {
                                        entriesToAdd[i].push( kaData[i].entries[j] );
                                    }
                                }
                            }
                        }
                    }

                    /* Loop through all the data we recieved from Firebase; and see if it still exists on Khan Academy. */
                    for (var i in fbData) {
                        if (!kaData.hasOwnProperty(i)) {
                            // Contest removed. Delete from Firebase
                            console.log("[sync] We found a contest that no longer exists. ID: " + i);
                            toRemoveFromFirebase[i] = fbData[i];
                        } else {
                            // Contest still exists. Now let's see if any entries have been removed.
                            for (var j in fbData[i].entries) {
                                if (!kaData[i].entries.hasOwnProperty(j)) {
                                    // Entry no longer exists on Khan Academy; delete from Firebase (or mark as archived).
                                    console.log("[sync] We found an entry that doesn't exist anymore! Contest ID: " + i + ". Entry ID: " + j);
                                    /* TODO */
                                    if (!entriesToRemove.hasOwnProperty(i)) {
                                        entriesToRemove[i] = [];
                                        entriesToRemove[i].push(j);
                                    } else {
                                        entriesToRemove[i].push(j);
                                    }
                                }
                            }
                        }
                    }

                    /* Add what we don't have; and remove what Khan Academy *doesn't* have. */
                    for (var a in toAddToFirebase) {
                        // Add to Firebase!
                        contestsFBRef.child(a).set(toAddToFirebase[a]);
                        fbRef.child("contestKeys").child(a).set(true);
                        // add to contest key list
                    }
                    for (var r in toRemoveFromFirebase) {
                        // Remove from Firebase!
                        contestsFBRef.child(r).set(null);
                        // remove from contest key list
                        fbRef.child(contestKeys).child(r).set(null);
                    }
                    for (var ea in entriesToAdd) {
                        /* Add all the new entries to Firebase */
                        for (var i = 0; i < entriesToAdd[ea].length; i++) {
                            console.log("[sync] Adding " + entriesToAdd[ea][i].id + " to Firebase.");
                            contestsFBRef.child(ea).child("entries").child(entriesToAdd[ea][i].id).set(entriesToAdd[ea][i]);
                            // push to contest entry keys list
                            contestsFBRef.child(ea).child("entryKeys").child(entriesToAdd[ea][i].id).set(true);
                        }
                    }
                    for (var er in entriesToRemove) {
                        /* Remove all the old entries from Firebase */
                        for (var i = 0; i < entriesToRemove[er].length; i++) {
                            console.log("[sync] Removing " + entriesToRemove[er][i] + " from Firebase!");
                            contestsFBRef.child(er).child("entries").child(entriesToRemove[er][i]).set(null);
                            // remove from the entry keys list
                            contestsFBRef.child(er).child("entryKeys").child(entriesToRemove[er][i]).set(null);
                        }
                    }

                    console.log("[sync] Done");
                    callback(kaData);
                }
            }, 1000);
        },
        /* This function logs the user in and then calls the callback with the Firebase auth data: */
        logUserIn: function(type, callback) {
            /* Connect to Firebase: */
            var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com");
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
                    alert("An error occured. Please try again later.");
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
                        }, Contest_Judging_System.logError);
                        /* Also, log a message to the console. */
                        console.log("Added new user to Firebase. Name: " + authData.google.displayName + " Permission Level: 1");
                    }
                    /* ...log a message to the console saying that the user was logged in, and... */
                    console.log("User logged in!");
                    /* ...call the callback function, passing it the authData that we recieved. */
                    callback(authData);
                }, Contest_Judging_System.logError);
            }, { remember: "default" });
        },
        getUserData: function(userID, callback) {
            /* Get the data of the user with uid userID and then call the callback while passing the data through the callback: */
            /* Get the Firebase data */
            var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com");
            var users = fbRef.child("users");

            /* Get the user info: */
            users.once("value", function(usersSnapshot) {
                /* Make sure the user exists in Firebase. If they don't: */
                if (!usersSnapshot.hasChild(userID)) {
                    /* Get the Firebase authentication data: */
                    var fbAuth = Contest_Judging_System.getFirebaseAuth();
                    /* User doesn't exist in Firebase, which means they cannot be an admin. Therefore, set them in Firebase with lowest possible permissions. */
                    var userData = {
                        name: fbAuth.google.displayName,
                        permLevel: 1
                    };
                    /* Log errors with .logError: */
                    users.child(userID).set(userData, Contest_Judging_System.logError);
                    /* Call the callback */
                    callback(userData);
                }
                /* Otherwise, go straight to calling the callback: */
                else {
                    callback(usersSnapshot.val()[userID]);
                }
                /* Log errors: */
            }, Contest_Judging_System.logError);
        },
        logInAndGetUserData: function(type, callback) {
            /* This function combines logging in and getting the user data so it logs in the user if they're not already logged in and passes the auth data and user data to the callback: */
            /* Get the Firebase auth data: */
            var fbAuth = Contest_Judging_System.getFirebaseAuth();
            /* If they're not logged in: */
            if (fbAuth === null) {
                /* Log them in: */
                Contest_Judging_System.logUserIn(type, function(authData) {
                    /* Set fbAuth: */
                    fbAuth = authData;
                    /* Get the user data: */
                    Contest_Judging_System.getUserData(fbAuth.uid, function(userData) {
                        /* Call callback: */
                        callback(fbAuth, userData);
                    });
                });
            }
            /* Otherwise, just get the data: */
            else {
                Contest_Judging_System.getUserData(fbAuth.uid, function(userData) {
                    /* Call callback: */
                    callback(fbAuth, userData);
                });
            };
        },
        judgeEntry: function(contest, entry, scoreData, permLevel, callback) {
            /* This judges an entry entry of contest with scoreData from a judge with id as set in cookies. It then passes the new scores through callback. */

            /* Get Firebase data */
            var fbContestRef = new Firebase("https://contest-judging-sys.firebaseio.com/contests/" + contest);
            /* All entries of this contest */
            var entries = fbContestRef.child("entries");

            /* Get the rubrics from Firebase: */
            Contest_Judging_System.getRubricsForContest(contest, function(contestRubrics) {
                /* Load the Firebase data of this entry of this contest and then... */
                Contest_Judging_System.loadEntry(contest, entry, permLevel, function(entryData) {
                    /* Find the judges who voted (or an empty array if noone voted yet) */
                    var judgesWhoVoted = entryData.scores.rubric.judgesWhoVoted === undefined ? [] : entryData.scores.rubric.judgesWhoVoted;
                    /* Get the current rubric score */
                    var currentRubricScore = entryData.scores.rubric;
                    /* Get the Firebase auth data */
                    var fbAuth = Contest_Judging_System.getFirebaseAuth();

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
                        var thisEntry = new Firebase("https://contest-judging-sys.firebaseio.com/contests/" + contest + "/entries/" + entry + "/scores/");
                        /* Log errors with .logError: */
                        thisEntry.child("rubric").set(newScoreObj, Contest_Judging_System.logError);
                        /* Tell the user that it worked! */
                        alert("This entry has been judged. Hooray!");
                        /* Pass newScoreObj through callback: */
                        callback(newScoreObj);
                    }
                    /* If this judge has already judged this entry, tell them that they've already done so. */
                    else {
                        alert("You've already judged this entry!");
                    }
                });
            });
        },
        createContest: function(contestId, contestRubrics, callback) {
            /* Get Firebase refs:: */
            var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/");
            var fbContestRef = fbRef.child("contests");
            var fbContestKeysRef = fbRef.child("contestKeys");

            /* Send AJAX request to get info on contest: */
            var programQuery = $.ajax({
                type: "GET",
                url: KA_API.urls.scratchpadInfo(contestId),
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
                        for (var i in contestRubrics) {
                            if (!rubrics.hasOwnProperty(i)) {
                                rubrics[i] = contestRubrics[i];
                            }
                        }
                        /* Merge rubrics.Order and contestRubrics.Order: */
                        for (var i = 0; i < contestRubrics.Order.length; i++) if (rubrics.Order.indexOf(contestRubrics.Order[i]) == -1) rubrics.Order.push(contestRubrics.Order[i]);

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
                                if (err) Contest_Judging_System.logError(err);
                                /* When we're done, update fbContestRef: */
                                else updateFirebase();
                            });
                        }
                        /* Otherwise, go straight to updating fbContestRef: */
                        else updateFirebase();

                        function updateFirebase() {
                            /* This function updates fbContestRef: */
                            fbContestRef.child(id).update(newFbData, function(err) {
                                /* Log errors: */
                                if (err) Contest_Judging_System.logError(err);
                                /* Once we're done, call the callback with a link to the new contest judging page: */
                                else callback(window.location.href.replace("/admin/new_contest.html", "/contest.html?contest=" + contestId + "&entries=30"));
                            });
                        }
                        /* Log errors: */
                    }, Contest_Judging_System.logError);
                }
            });
        }
    };
})();
