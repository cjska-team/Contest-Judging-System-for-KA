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
        logError: function(error) { console.error(error); },
        /* This function gets the authentication object. */
        getFirebaseAuth: function() {
            /* Connect to our Firebase app. */
            var firebaseRef = new Firebase("https://contest-judging-sys.firebaseio.com/");
            /* Return the authentication object: */
            return firebaseRef.getAuth();
        },
        /* This function gets all the "Rubrics" that we've defined in Firebase. */
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
                            for (j = 0; j < props.length; j++) if (!curContestData.hasOwnProperty(props[j])) break;
                            /* If we've got all the props, update callbackData. */
                            if (j == props.length) callbackData[key] = curContestData;
                        }, Contest_Judging_System.logError);
                    })(i);
                }
                /* Log errors: */
            }, Contest_Judging_System.logError);
            
            /* Once we're done querying fbRef: */
            fbRef.once("value", function(data) {
                /* Don't call callback until we're done checking all curContests! */
                /* Check if we have all of the data for all curContests every second: */
                var checkDone = setTimeout(function() {
                    for (var i = 0; i < fbRefData.length; i++) if (!callbackData.hasOwnProperty(fbRefData[i])) break;
                    /* If we do: */
                    if (i == fbRefData.length) {
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
            var props = ["desc", "id", "img", "name", "entryCount", "entryKeys"];
            
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
            var checkDone = setTimeout(function() {
                for (var i = 0; i < props.length; i++) if (!callbackData.hasOwnProperty(props[i])) break;
                /* If we're done: */
                if (i == props.length) {
                    /* Stop checking if we're done: */
                    clearTimeout(checkDone);
                    /* Call the callback: */
                    callback(callbackData);
                }
            }, 1000);
        },
        /* Load a specific contest entry, based on ID */
        loadEntry: function(contestId, entryId, callback) {
            /* Connect to Firebase: */
            var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/contests/"+contestId+"/entries/"+entryId);           
            /* This is what we're going to pass through callback: */
            var callbackData = {};
            /* These are the property names that callbackData needs to have: */
            var props = ["id", "thumb", "name", "scores"];
            
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
            var checkDone = setTimeout(function() {
                for (var i = 0; i < props.length; i++) if (!callbackData.hasOwnProperty(props[i])) break;
                /* If we're done: */
                if (i == props.length) {
                    /* Stop checking if we're done: */
                    clearTimeout(checkDone);
                    /* Call the callback: */
                    console.log(callbackData, entryId);
                    callback(callbackData);
                }
            }, 1000);
        },
        /* Gets N random entries (where N is the number of contests to get) and passes them into a callback. */
        get_N_Entries: function(n, contestId, callback) {
            /* This bool is true iff we're done picking the n entries. */
            var done = false;
            /* This JSON object stores each of the entries we've picked out to display to the judge */
            var pickedEntries = { };

            /* This variable is used to store the number of entries for this contest. */
            var numEntries = 0;

            Contest_Judging_System.loadContest(contestId, function(contestData) {

                /* Declare a variable to hold an array of keys for entries */
                var entriesKeys = Object.keys(contestData.entryKeys);
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

                    /* If we haven't already picked that key... */
                    if (pickedKeys.indexOf(pickedKey) === -1) {
                        /* ...pick it. */
                        pickedKeys.push(pickedKey);
                        /* Function wrapper to save pickedKey: */
                        (function(pickedKey) {
                            /* Set pickedEntries[pickedKey] to the entry data: */
                            Contest_Judging_System.loadEntry(contestId, pickedKey, function(entryData) {
                                pickedEntries[pickedKey] = entryData;
                            });
                        })(pickedKey);
                    }
                }
                    
                /* Tell the below setInterval() that we're done when we're done. */
                done = true;
            });

            /* Check if we're done every second and when we are, call the callback and stop checking if we're done. */
            var finishedInterval = setInterval(function() {
                if (done && Object.keys(pickedEntries).length == numEntries) {
                    clearInterval(finishedInterval);
                    callback(pickedEntries);
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
        logUserIn: function(callback) {
            /* Connect to Firebase: */
            var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com");

            /* Try to log the user in: */
            fbRef.authWithOAuthPopup("google", function(error, authData) {
                /* Error Handling: */
                if (error) {
                    alert("An error occured. Please try again later.");
                    console.log(error);
                } else {
                    /* Access the users child */
                    var usersRef = fbRef.child("users");
                    usersRef.once("value", function(snapshot) {
                        /* Add this user into Firebase if they're not already there. */
                        if (!snapshot.hasChild(authData.uid)) {
                            usersRef.child(authData.uid).set({
                                name: authData.google.displayName,
                                permLevel: 1
                            });
                            console.log("Added new user in Firebase!");
                        }
                        console.log("Logged user in!");
                        /* When we're done, call the callback. */
                        callback(authData)
                    /* This logs errors to the console so no errors pass silently. */
                    }, Contest_Judging_System.logError);
                }
                /* This makes Firebase remember the login for 30 days (which has been set as the default in Firebase). */
            }, {remember: "default"});
        },
        /* Cookie functions provided by w3schools */
        getCookie: function(cookie) {
            /* Get the cookie with name cookie (return "" if non-existent) */
            var name = cookie + "=";
            /* Check all of the cookies and try to find the one containing name. */
            var cookieList = document.cookie.split(';');
            for (var i = 0; i < cookieList.length; i++) {
                var curCookie = cookieList[i];
                while (curCookie[0] == ' ') curCookie = curCookie.substring(1);
                /* If we've found the right cookie, return its value. */
                if (curCookie.indexOf(name) == 0) return curCookie.substring(name.length, curCookie.length);
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
        getUserData: function(userID, callback) {
            /* Get the perm level of the user with uid UID and then call the callback while passing the data through the callback: */
            /* Get the Firebase data */
            var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com");
            var users = fbRef.child("users");

            /* Get the user info: */
            users.once("value", function(usersSnapshot) {
                /* Make sure the user exists in Firebase. If they don't: */
                if (!usersSnapshot.hasChild(userID)) {
                    /* User doesn't exist in Firebase, which means they cannot be an admin. Therefore, set them in Firebase with lowest possible permissions. */
                    var userData = {
                        name: fbAuth.google.displayName,
                        permLevel: 1
                    };
                    fbRef.child(userID).set(userData);
                    /* Call the callback */
                    callback(userData);
                }
                /* Otherwise, go straight to calling the callback: */
                else callback(usersSnapshot.val()[userID]);
                /* Log errors: */
            }, Contest_Judging_System.logError);
        },
        judgeEntry: function(contest, entry, scoreData, authToken, callback) {
            /* This judges an entry entry of contest with scoreData from a judge with id as set in cookies. */
            /* TODO: Figure out what to do with authToken. */
            /* TODO: Figure out what to do with callback. */

            /* Get Firebase data */
            var fbContestRef = new Firebase("https://contest-judging-sys.firebaseio.com/contests/" + contest);
            /* All entries of this contest */
            var entries = fbContestRef.child("entries");

            /* Load the Firebase data of this entry of this contest and then... */
            Contest_Judging_System.loadEntry(contest, entry, function(entryData) {
                /* Get all of the rubrics from Firebase */
                /* TODO: Figure out if we need .getRubrics() here. */
                //Contest_Judging_System.getRubrics(function(allRubrics) {
                    /* Get the current rubric score */
                    var currentRubricScore = entryData.scores.rubric;
                    /* Find the judges who voted (or an empty array if noone voted yet) */
                    var judgesWhoVoted = entryData.scores.rubric.judgesWhoVoted === undefined ? [] : entryData.scores.rubric.judgesWhoVoted;
                    /* Get the Firebase auth data */
                    var fbAuth = Contest_Judging_System.getFirebaseAuth();

                    /* If this judge hasn't voted on this entry yet... */
                    if (judgesWhoVoted.indexOf(fbAuth.uid) === -1) {
                        /* Push the uid of this judge into judgesWhoVoted */
                        judgesWhoVoted.push(fbAuth.uid);
                        var numJudges = judgesWhoVoted.length
                        
                        /* Create a new object for storing scores */
                        var newScoreObj = {
                            "Level": {
                                "rough": entryData.scores.rubric.Level.rough + scoreData.Level,
                                "avg": Math.round((parseInt(entryData.scores.rubric.Level.rough, 10) + scoreData.Level) / numJudges)
                            },
                            "Clean_Code": {
                                "rough": entryData.scores.rubric.Clean_Code.rough + scoreData.Clean_Code,
                                "avg": (parseInt(entryData.scores.rubric.Clean_Code.rough, 10) + scoreData.Clean_Code) / numJudges
                            },
                            "Creativity": {
                                "rough": entryData.scores.rubric.Creativity.rough + scoreData.Creativity,
                                "avg": (parseInt(entryData.scores.rubric.Creativity.rough, 10) + scoreData.Creativity) / numJudges
                            },
                            "Overall": {
                                "rough": entryData.scores.rubric.Overall.rough + scoreData.Overall,
                                "avg": (parseInt(entryData.scores.rubric.Overall.rough, 10) + scoreData.Overall) / numJudges
                            },
                            "judgesWhoVoted": judgesWhoVoted
                        };

                        /* Set the new scores to newScoreObj */
                        var thisEntry = new Firebase("https://contest-judging-sys.firebaseio.com/contests/" + contest + "/entries/" + entry + "/scores/");
                        thisEntry.child("rubric").set(newScoreObj);
                        /* Tell the user that it worked! */
                        alert("This entry has been judged. Hooray!");
                    }
                    /* If this judge has already judged this entry, tell them that they've already done so. */
                    else {
                        alert("You've already judged this entry!");
                    }
                //});
            });
        }
    };
})();
