/***
 * This is a "wrapper" of sorts, for the Khan Academy API.
 * Anything relating to the Khan Academy API should be placed in this file.
***/
/* Function wrapper to create KA_API */
window.KA_API = (function() {
    /* jQuery is required for [most] all of these. So if it's object is not found, exit the function. */
    if (!window.jQuery) {
        console.log("Needs jQuery");
        return;
    }

    /* Everything from this namespace will be placed in the object that is returned. */
    return {
        /* Misc data */
        misc: {
            allData: 400000
        },
        /* Khan Academy API Urls */
        urls: {
            /* For getting contests: */
            spotlight: "https://www.khanacademy.org/api/internal/scratchpads/top?casing=camel&topic_id=xffde7c31&sort=4&limit=40000&page=0&lang=en&_=1436581332879",
            /***
             * KA_API.urls.spinoffs()
             * Builds up, and returns, an API url that can be used to fetch spinoffs for a scratchpad.
             * @author Gigabyte Giant (2015)
             * @param {String} programID: The Khan Academy Scratchpad ID of the program that we want to load spinoffs from.
             * @returns {String} apiUrl: An API URL that can be used to fetch the spinoffs for a scratchpad.
            ***/
            spinoffs: function(programID) {
                return "https://www.khanacademy.org/api/internal/scratchpads/{PROGRAM}/top-forks?casing=camel&sort=2&limit=300000&page=0&lang=en".replace("{PROGRAM}", programID);
            },
            /***
             * KA_API.urls.scratchpadInfo()
             * Builds up, and returns an API url that can be used to fetch information about a scratchpad.
             * @author Gigabyte Giant (2015)
             * @param {String} scratchpadId: The Khan Academy Scratchpad ID of the program that we want to load scratchpad info from.
             * @returns {String} apiUrl: An API URL that can be used to fetch the info for a scratchpad.
            ***/
            scratchpadInfo: function(scratchpadId) {
                return "https://www.khanacademy.org/api/labs/scratchpads/{SCRATCHPAD}".replace("{SCRATCHPAD}", scratchpadId);
            }
        },
        /***
         * getContestEntries()
         * Fetches all the entries for a contest.
         * @author Gigabyte Giant, Noble Mushtak (2015)
         * @param {String} contestId: The Khan Academy Scratchpad ID of the contest that we want to load contest entries for.
         * @param {Function} callback(entries): The callback function to invoke once the contests have been loaded from Khan Academy
        ***/
        getContestEntries: function(contestID, callback) {
            /* Declare an empty object that'll be used to store all of the "entries" (spinoffs) that we find. */
            var entries = {};

            /* Send AJAX request for getting all the entries to the desired contest */
            $.ajax({
                type: 'GET',
                url: this.urls.spinoffs(contestID),
                async: true,
                complete: function(apiResponse) {
                    /* When the AJAX request finishes */
                    /* allPrograms is a list of all of the contest entries */
                    var allPrograms = apiResponse.responseJSON.scratchpads;

                    /* Loop through allPrograms */
                    for (var i = 0; i < allPrograms.length; i++) {
                        /* Program ID for this spin-off */
                        var id = allPrograms[i].url.split("/")[5];

                        /* Add JSON object for this spin-off into entries */
                        entries[id] = {
                            /* Program ID */
                            id: id,
                            /* Program Title */
                            name: allPrograms[i].translatedTitle,
                            /* Program Image */
                            thumb: allPrograms[i].thumb,
                            /* Program Scores */
                            scores: {
                                rubric: {
                                    "Level": {
                                        "rough": 1,
                                        "avg": 1
                                    },
                                    "Creativity": {
                                        "rough": 1,
                                        "avg": 1
                                    },
                                    "Clean_Code": {
                                        "rough": 1,
                                        "avg": 1
                                    },
                                    "Overall": {
                                        "rough": 1,
                                        "avg": 1
                                    },
                                    "judgesWhoVoted": [ ]
                                }
                            }
                        };
                    }
                    /* Finally, pass entries into callback */
                    callback(entries);
                }
            });
        },
        /***
         * numberOfEntriesInContest()
         * Calculates the number of entries in a contest.
         * @author Gigabyte Giant (2015)
         * @param {String} contest: The Khan Academy Scratchpad ID of the contest that we want to get the count of entries for.
         * @param {Function} callback(entryCount): The number of entries that this contest has.
        ***/
        numberOfEntriesInContest: function(contest, callback) {
            var numOfEntries = 0;

            $.ajax({
                type: 'GET',
                url: this.urls.spinoffs(contest),
                async: true,
                complete: function(apiResponse) {
                    callback(apiResponse.responseJSON.scratchpads.length);
                }
            });
        },
        /***
         * getContests()
         * Fetches all spotlight programs by Pamela, that contain "Contest" in the title. (This function is run by the KACJS-Angus bot now)
         * @author Gigabyte Giant (2015)
         * @param {Function} callback: The callback function to invoke once we've loaded all of the contest programs.
        ***/
        getContests: function(callback) {
            /* This Bool is true iff the first AJAX request has finished. */
            var apiQueryDone = false;
            /* Any contests that we find, will be put into this object. (We'll also pass this object into callback.) */
            var allContests = {};

            /* Send AJAX request to get all the contests from Khan Academy */
            $.ajax({
                type: 'GET',
                url: this.urls.spotlight,
                async: true,
                complete: function(apiResponse) {
                    /* When the AJAX request finishes */
                    /* allPrograms is a list of all of the contest entries */
                    var allPrograms = apiResponse.responseJSON.scratchpads;

                    var getContestsFunctions = {
                        "fetchContest": function(programID, scratchpad, contests) {
                            $.ajax({
                                type: 'GET',
                                url: KA_API.urls.scratchpadInfo(programID),
                                async: true,
                                complete: function(scratchpadData) {
                                    /* Add in a JSON object for this contest into contests */
                                    contests[programID] = {
                                        /* Program ID */
                                        id: programID,
                                        /* Program Title */
                                        name: scratchpad.translatedTitle,
                                        /* Program Icon */
                                        img: scratchpad.thumb,
                                        /* Contest Description */
                                        desc: scratchpadData.responseJSON.description
                                    };

                                    /* Fetch the contest entries for this contest and when done, set the entries property within the above JSON object. */
                                    window.KA_API.getContestEntries(contests[programID].id, function(entries) {
                                        contests[programID].entries = entries;
                                    });

                                    window.KA_API.numberOfEntriesInContest(contests[programID].id, function(count) {
                                        contests[programID].entryCount = count;
                                    });
                                }
                            });
                        }
                    };

                    /* Loop through allPrograms */
                    for (var i = 0; i < allPrograms.length; i++) {
                        /* For now, let's only accept contests from pamela. Also, all contests must have "Contest" in their title. */
                        if (allPrograms[i].authorNickname.match("pamela") !== null && allPrograms[i].translatedTitle.match("Contest") !== null) {
                            var programID = allPrograms[i].url.split("/")[5];
                            /* Make an empty object in allContests to alert the setTimeout() function below that such an object has yet to be set. */
                            allContests[programID] = {};

                            getContestsFunctions.fetchContest(programID, allPrograms[i], allContests);

                            /* Put this in a function wrapper so the parameters will be saved. */
                            // (function(programID, scratchpad, contests) {
                            //     $.ajax({
                            //         type: 'GET',
                            //         url: KA_API.urls.scratchpadInfo(programID),
                            //         async: true,
                            //         complete: function(scratchpadData) {
                            //             /* Add in a JSON object for this contest into contests */
                            //             contests[programID] = {
                            //                 /* Program ID */
                            //                 id: programID,
                            //                 /* Program Title */
                            //                 name: scratchpad.translatedTitle,
                            //                 /* Program Icon */
                            //                 img: scratchpad.thumb,
                            //                 /* Contest Description */
                            //                 desc: scratchpadData.responseJSON.description
                            //             };
                            //
                            //             /* Fetch the contest entries for this contest and when done, set the entries property within the above JSON object. */
                            //             window.KA_API.getContestEntries(contests[programID].id, function(entries) {
                            //                 contests[programID].entries = entries;
                            //             });
                            //
                            //             window.KA_API.numberOfEntriesInContest(contests[programID].id, function(count) {
                            //                 contests[programID].entryCount = count;
                            //             });
                            //         }
                            //     });
                            // })(programID, allPrograms[i], allContests);
                            /* Pass in the parameters to this function as above. */
                        }
                    }
                    /* Once we're done with the AJAX request, set apiQueryDone to true. */
                    apiQueryDone = true;
                }
            });

            /* Check to see if we're done every second; if we are, invoke the callback function. (Idea from @noble-mushtak) */
            var finishTimeout = setInterval(function() {
                if (apiQueryDone) {
                    /* If the first AJAX request has finished, make sure all of the other AJAX requests have finished. If we find a contest without the entries property, we know their AJAX request has not finished, so we return. */
                    for (var i in allContests) {
                        /* Wrap the body of a for-in loop with an if-statement, to filter unwanted properties. */
                        /* More info: https://jslinterrors.com/the-body-of-a-for-in-should-be-wrapped-in-an-if-statement */
                        if (allContests.hasOwnProperty(i)) {
                            if (!allContests[i].hasOwnProperty("entries") || !allContests[i].hasOwnProperty("entryCount")){
                                return;
                            }
                        }
                    }

                    /* At this point, we have made sure the request has finished, so we make a log in the console, stop looping this asynchronous function, and finally pass contests into callback. */
                    console.log("getContests() finished!");
                    /* Make sure clearTimeout() is called first. We don't know how long callback will take and if callback takes more than a second, then callback will be called multiple times. */
                    clearInterval(finishTimeout);
                    callback(allContests);
                }
            }, 1000);
        }
    };
})();
