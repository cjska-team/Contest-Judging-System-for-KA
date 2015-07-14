/***
 * This is a "wrapper" of sorts, for the Khan Academy API.
 * Anything relating to the Khan Academy API should be placed in this file.
***/
window.KA_API = (function() {
    /* jQuery is required for [most] all of these. So if it's object is not found, exit the function. */
    if (!jQuery) return;

    return {
        //Important Links:
        urls: {
            //For getting contests:
            spotlight: "https://www.khanacademy.org/api/internal/scratchpads/top?casing=camel&topic_id=xffde7c31&sort=4&limit=40000&page=0&lang=en&_=1436581332879",
            //For getting contest entries:
            spinoffs: function(programID) {
                return "https://www.khanacademy.org/api/internal/scratchpads/{PROGRAM}/top-forks?casing=camel&sort=2&limit=300000&page=0&lang=en".replace("{PROGRAM}", programID);
            }
        },
        getContestEntries: function(contestID, callback) {
            /* Let's not return anything until we're done! */
            var done = false;
            /* Any entries that we find, will be put into this object. (We'll also return this object.) */
            var entries = {};

            //Send AJAX request to spin-offs of contest with contestID
            var apiQuery = $.ajax({
                type: 'GET',
                url: this.urls.spinoffs(contestID),
                async: true,
                complete: function(apiResponse) {
                    /* Instead of having to type apiResponse.responseJSON all the time, let's create a variable to hold the response json. */
                    var jsonData = apiResponse.responseJSON;

                    //Loop through scratchpads
                    for (var i = 0; i < jsonData.scratchpads.length; i++) {
                        //Program ID for this spin-off
                        var id = jsonData.scratchpads[i].url.split("/")[5];

                        //Add JSON object for this spin-off.
                        entries[id] = {
                            id: id,
                            name: jsonData.scratchpads[i].translatedTitle,
                            scores: {
                                rubric: 0,
                                judge: 0
                            }
                        };
                    }

                    //Finally, call the callback.
                    callback(entries);
                }
            });
        },
        getContests: function(callback) {
            /* Let's not return anything until we're done! */
            var apiQueryDone = false;
            /* Any contests that we find, will be put into this array. (We'll also return this array.) */
            var contests = {};

            var apiQuery = $.ajax({
                type: 'GET',
                url: this.urls.spotlight,
                async: true,
                complete: function(apiResponse) {
                    /* Instead of having to type apiResponse.responseJSON all the time, let's create a variable to hold the response json. */
                    var jsonData = apiResponse.responseJSON;

                    /* Keep track of all the spotlight programs */
                    var allPrograms = jsonData.scratchpads;
                    
                    for (var i = 0; i < allPrograms.length; i++) {
                        //Check if entries have loaded
                        var loadedEntries = false;
                        //The current scratchpad corresponding to this contest.
                        var currentScratchpad = allPrograms[i];

                        /* For now, let's only accept contests from pamela */
                        if (currentScratchpad.authorNickname.match("pamela") !== null) {
                            /* Contest programs always have "Contest" in the title... */
                            if (currentScratchpad.translatedTitle.match("Contest") !== null) {
                                //The contest ID for this contest
                                var programID = currentScratchpad.url.split("/")[5];
                                //Add in a JSON object for this contest.
                                contests[programID] = {
                                    id: programID,
                                    name: currentScratchpad.translatedTitle
                                };

                                (function() {
                                    //This is ina  function wrapper to save programID
                                    var programIDinside = programID;
                                    //Fetch the entries and insert them into the above JSON object.
                                    KA_API.getContestEntries(contests[programIDinside].id, function(entries) {
                                        contests[programIDinside].entries = entries;
                                    });
                                })();
                            }
                        }
                    }
                    //Since we've finished this request, set apiQueryDone.
                    apiQueryDone = true;
                }
            });

            /* Check to see if we're done; if we are, invoke the callback function. (Idea from @noble-mushtak) */
            var finishTimeout = setInterval(function() {
                if (apiQueryDone) {
                    //Loop through contests and return if some contest does not have entries
                    for (var i in contests) {
                        if (!contests[i].hasOwnProperty("entries")) return;
                    }

                    //If we're done, log "All done!", clear finishTimeout, and call the callback.
                    console.log("All done!");
                    clearInterval(finishTimeout);
                    callback(contests);
                }
            }, 1000);
        }
    };
})();