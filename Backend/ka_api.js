/***
 * This is a "wrapper" of sorts, for the Khan Academy API.
 * Anything relating to the Khan Academy API should be placed in this file.
***/
window.KA_API = (function() {
    /* Function wrapper to create KA_API */
    //jQuery is required for [most] all of these. So if it's object is not found, exit the function.
    if (!window.jQuery) {
        console.log("Needs jQuery");
        return;
    }

    //Everything from this namespace will be placed in the object that is returned.
    return {
        //Khan Academy API Urls
        urls: {
            //For getting contests:
            spotlight: "https://www.khanacademy.org/api/internal/scratchpads/top?casing=camel&topic_id=xffde7c31&sort=4&limit=40000&page=0&lang=en&_=1436581332879",
            //For getting contest entries where contest has ID of programID
            spinoffs: function(programID) {
                return "https://www.khanacademy.org/api/internal/scratchpads/{PROGRAM}/top-forks?casing=camel&sort=2&limit=300000&page=0&lang=en".replace("{PROGRAM}", programID);
            }
        },
        /* This function gets all the entries for a specific contest, and passes them into the callback. */
        getContestEntries: function(contestID, callback) {
            /* Any entries that we find, will be put into this object. (We'll also pass this object into callback.) */
            var entries = {};

            /* Send AJAX request for getting all the entries to the desired contest */
            var apiQuery = $.ajax({
                type: 'GET',
                url: this.urls.spinoffs(contestID),
                async: true,
                complete: function(apiResponse) {
                    /* When the AJAX request finishes */
                    /* allPrograms is a list of all of the contest entries */
                    var allPrograms = apiResponse.responseJSON.scratchpads

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
                            /* Program Scores */
                            scores: {
                                rubric: 0,
                                judge: 0
                            }
                        };
                    }
                    /* Finally, pass entries into callback */
                    callback(entries);
                }
            });
        },
        /* This function gets all of Pamela's contest programs from Khan Academy and passes them into the callback function. */
        getContests: function(callback) {
            /* This Bool is true iff the first AJAX request has finished. */
            var apiQueryDone = false;
            /* Any contests that we find, will be put into this object. (We'll also pass this object into callback.) */
            var contests = {};

            /* Send AJAX request to get all the contests from Khan Academy */
            var apiQuery = $.ajax({
                type: 'GET',
                url: this.urls.spotlight,
                async: true,
                complete: function(apiResponse) {
                    /* When the AJAX request finishes */
                    /* allPrograms is a list of all of the contest entries */
                    var allPrograms = apiResponse.responseJSON.scratchpads;

                    /* Loop through allPrograms */
                    for (var i = 0; i < allPrograms.length; i++) {
                        /* For now, let's only accept contests from pamela. Also, all contests must have "Contest" in their title. */
                        if (allPrograms[i].authorNickname.match("pamela") !== null && allPrograms[i].translatedTitle.match("Contest") !== null) {
                            /* The program ID for this contest */
                            var programID = allPrograms[i].url.split("/")[5];
                            /* Add in a JSON object for this contest into contests */
                            contests[programID] = {
                                /* Program ID */
                                id: programID,
                                /* Program Title */
                                name: allPrograms[i].translatedTitle,
                                /* Program Icon */
                                img: allPrograms[i].thumb
                            };

                            (function() {
                                /* This is in a function wrapper so programIDinside will be remembered in the below function. */
                                var programIDinside = programID;

                                /* Fetch the contest entries for this contest and when done, set the entries property within the above JSON object. */
                                KA_API.getContestEntries(contests[programIDinside].id, function(entries) {
                                    contests[programIDinside].entries = entries;
                                });
                            })();
                        }
                    }
                    apiQueryDone = true;
                }
            });

            /* Check to see if we're done every second; if we are, invoke the callback function. (Idea from @noble-mushtak) */
            var finishTimeout = setInterval(function() {
                if (apiQueryDone) {
                    /* If the first AJAX request has finished, make sure all of the other AJAX requests have finished. If we find a contest without the entries property, we know their AJAX request has not finished, so we return. */
                    for (var i in contests) {
                        if (!contests[i].hasOwnProperty("entries")) return;
                    }

                    /* At this point, we have made sure the request has finished, so we make a log in the console, stop looping this asynchronous function, and finally pass contests into callback. */
                    console.log("All done!");
                    /* Make sure clearTimeout() is called first. We don't know how long callback will take and if callback takes more than a second, then callback will be called multiple times. */
                    clearInterval(finishTimeout);
                    callback(contests);
                }
            }, 1000);
        }
    };
})();