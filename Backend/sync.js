function doesEntryExist() {
    //Noble Mushtak: Please add something saying what this does.    
}

function fetchEntries(contestID, func) {
    /*Fetches spin-offs of contests using contestID*/
    //The contest entries
    var entries = [];
    //The JSON API url
    var apiUrl = "https://www.khanacademy.org/api/internal/scratchpads/" + contestID + "/top-forks?casing=camel&sort=2&limit=300000&page=0&lang=en";

    //Send a GET AJAX request to apiUrl
    var query = $.ajax({
        type: 'GET',
        url: apiUrl,
        async: true,
        complete: function(apiResponse) {
            //The "scratchpads" or the JSON representation of the programs
            var scratchpads = apiResponse.responseJSON.scratchpads;
            //Set a JSON object for each entry in scratchpads by extracting certain data such as the program id, the program's name, the number of votes it has, a screensht image, and a link to the program.
            for (var i = 0; i < scratchpads.length; i++) {
                entries.push({
                    id: scratchpads[i].url.split("/")[5],
                    name: scratchpads[i].translatedTitle,
                    url: scratchpads[i].url,
                    thumb: "https://www.khanacademy.org"+scratchpads[i].thumb,
                    votes: scratchpads[i].sumVotesIncremented,
                });
            }
            //Finally, we call the function to do what ever needs to be done with entries.
            func(entries);
        }
    });
}

var sync = function(func) {
    /*This gets data of all of the contests*/
    //Noble Mushtak: I don't see the point of this variable, but I'm not deleting in case there is a purpose behind this.
    //var username = "pamela";
    //The JSON API url
    var apiUrl = 'https://www.khanacademy.org/api/internal/scratchpads/top?casing=camel&topic_id=xffde7c31&sort=4&limit=40000&page=0&lang=en&_=1436581332879';

    //Send a GET AJAX request to apiUrl
    var apiQuery = $.ajax({
        type: 'GET',
        url: apiUrl,
        async: true,
        complete: function(apiResponse) {
            //allPrograms is an array of the JSON representation of these programs
            allPrograms = apiResponse.responseJSON.scratchpads;

            //Noble Mushtak: I deleted contests since it was literally contestIds.length
            //contestIds is an array of JSON objects holding data related to each contest
            var contestIds = [];
            for (var i = 0; i < allPrograms.length; i++) {
                //The current program being examined
                var currScratchpad = allPrograms[i];

                //Check that the current program really is a contest from pamela
                if (currScratchpad.authorNickname.match("pamela") !== null) {
                    if (currScratchpad.translatedTitle.match("Contest") !== null) {
                        //console.log(currScratchpad.url);
                        //Push a JSON obj into contestIds
                        contestIds.push({
                            id: currScratchpad.url.split("/")[5],
                            name: currScratchpad.translatedTitle,
                            thumb: "https://www.khanacademy.org"+currScratchpad.thumb
                        });
                        (function() {
                            //In order to keep n the same, we put it inside this function that is instantiated only once.
                            var index = contestIds.length-1;
                            //Call fetchEntries and when done, set the JSON obj with the entries
                            fetchEntries(currScratchpad.url.split("/")[5], function(entries) {
                                contestIds[index].entries = entries;
                            });
                        })();
                    }
                }
            }

            //When all of the contest entries have been found (check for this every second), finally call func and stop checking if all of the contest entries have been found.
            var storeNum = setInterval(function() {
                var done = true;
                for (var i = 0; i < contestIds.length; i++) if (!contestIds[i].hasOwnProperty("entries")) {
                    done = false;
                    break;
                }
                if (done) {
                    clearInterval(storeNum);
                    func(contestIds);
                }
            }, 1000);
        }
    });
};