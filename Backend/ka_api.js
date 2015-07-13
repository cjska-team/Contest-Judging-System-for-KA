/***
 * This is a "wrapper" of sorts, for the Khan Academy API.
 * Anything relating to the Khan Academy API should be placed in this file.
***/
window.KA_API = (function() {
    /* jQuery is required for [most] all of these. So if it's object is not found, exit the function. */
    if (!jQuery) return;

    return {
        //Important URLs
        urls: {
            //All contests
            spotlight: "https://www.khanacademy.org/api/internal/scratchpads/top?casing=camel&topic_id=xffde7c31&sort=4&limit=40000&page=0&lang=en&_=1436581332879",
            //Function that returns URL containing entry data
            spinoffs: function(programID) {
                return "https://www.khanacademy.org/api/internal/scratchpads/{PROGRAM}/top-forks?casing=camel&sort=2&limit=300000&page=0&lang=en".replace("{PROGRAM}", programID);
            }
        },
        //Get all of the contests
        getContests: function(callback) {
            /* Any contests that we find, will be put into this array. (We'll also return this array.) */
            var contests = [];
            /* This is true iff the first AJAX request has finished */
            var apiQueryDone = false;

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
                        var currentScratchpad = allPrograms[i];
                        
                        /* For now, let's only accept contests from pamela */
                        if (currentScratchpad.authorNickname.match("pamela") !== null) {
                            /* Contest programs always have "Contest" in the title... */
                            if (currentScratchpad.translatedTitle.match("Contest") !== null) {
                                //The program ID of the below contest
                                var programID = currentScratchpad.url.split("/")[5];
                                //Make a new JSON object in contests
                                contests[programID] = {
                                    id: programID,
                                    name: currentScratchpad.translatedTitle,
                                    thumb: "https://www.khanacademy.org"+currentScratchpad.thumb
                                };
                                //This is in a function wrapper so we don't lose programID
                                (function() {
                                    //The program ID of the above contest.
                                    var programIDinside = programID;
                                    //Get the contest entries and set it to the entries prop of the above JSON object
                                    KA_API.getContestEntries(contests[programIDinside].id, function(entries) {
                                        contests[programIDinside].entries = entries;
                                    });
                                })();
                            }
                        }
                    }
                    //Now that the request has finished, set apiQueryDone to true
                    apiQueryDone = true;
                }
            });

            /* Check to see if we're done; if we are, invoke the callback function. (Idea from @noble-mushtak) */
            var finishTimeout = setInterval(function() {
                var done = apiQueryDone;
                //Loop through contests and make sure they all have their entries
                if (done) for (var id in contests) if (!contests[id].hasOwnProperty("entries")) {
                    done = false;
                    break;
                }
                if (done) {
                    clearInterval(finishTimeout);
                    callback(contests);
                }
            }, 1000);
        },
        //Get all of the entries for a contest
        getContestEntries: function(contestID, callback) {
            /* Let's not return anything until we're done! */
            var done = false;
            /* Any entries that we find, will be put into this object. (We'll also return this object.) */
            var entries = {};

            var apiQuery = $.ajax({
                type: 'GET',
                url: this.urls.spinoffs(contestID),
                async: true,
                complete: function(apiResponse) {
                    /* Instead of having to type apiResponse.responseJSON all the time, let's create a variable to hold the response json. */
                    var jsonData = apiResponse.responseJSON;

                    //Loop through jsonData.scratchpads and add a JSON object for each entry
                    for (var i = 0; i < jsonData.scratchpads.length; i++) {
                        var id = jsonData.scratchpads[i].url.split("/")[5];

                        entries[id] = {
                            id: id,
                            name: jsonData.scratchpads[i].translatedTitle,
                            url: jsonData.scratchpads[i].url,
                            //Image link
                            thumb: "https://www.khanacademy.org"+jsonData.scratchpads[i].thumb,
                            votes: jsonData.scratchpads[i].sumVotesIncremented
                        };
                    }

                    //Pass entries into callback
                    callback(entries);
                }
            });
        }
    };
})();