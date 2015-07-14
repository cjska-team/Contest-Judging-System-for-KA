/***
 * This is a "wrapper" of sorts, for the Khan Academy API.
 * Anything relating to the Khan Academy API should be placed in this file.
***/
window.KA_API = (function() {
	/* jQuery is required for [most] all of these. So if it's object is not found, exit the function. */
	if (!jQuery) return;

	return {
		urls: {
			spotlight: "https://www.khanacademy.org/api/internal/scratchpads/top?casing=camel&topic_id=xffde7c31&sort=4&limit=40000&page=0&lang=en&_=1436581332879",
			spinoffs: function(programID) {
				return "https://www.khanacademy.org/api/internal/scratchpads/{PROGRAM}/top-forks?casing=camel&sort=2&limit=300000&page=0&lang=en".replace("{PROGRAM}", programID);
			}
		},
		getContestEntries: function(contestID, callback) {
			/* Let's not return anything until we're done! */
			var done = false;
			/* Any entries that we find, will be put into this object. (We'll also return this object.) */
			var entries = {};

			var finishTimeout = setInterval(function() {
					clearInterval(finishTimeout);
					callback(entries);
			}, 1000);

			var apiQuery = $.ajax({
				type: 'GET',
				url: this.urls.spinoffs(contestID),
				async: true,
				complete: function(apiResponse) {
					/* Instead of having to type apiResponse.responseJSON all the time, let's create a variable to hold the response json. */
					var jsonData = apiResponse.responseJSON;

					for (var i = 0; i < jsonData.scratchpads.length; i++) {
						var id = jsonData.scratchpads[i].url.split("/")[5];

						entries[id] = {
							id: id,
							name: jsonData.scratchpads[i].translatedTitle
						};
					}

					clearInterval(finishTimeout);
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
						var loadedEntries = false;
						var currentScratchpad = allPrograms[i];

						var allEntries = {};

						/* For now, let's only accept contests from pamela */
						if (currentScratchpad.authorNickname.match("pamela") !== null) {
							/* Contest programs always have "Contest" in the title... */
							if (currentScratchpad.translatedTitle.match("Contest") !== null) {
								var programID = currentScratchpad.url.split("/")[5];

								contests[programID] = {
									id: programID,
									name: currentScratchpad.translatedTitle
								};

								(function() {
									var programIDinside = programID;

									KA_API.getContestEntries(contests[programIDinside].id, function(entries) {
										contests[programIDinside].entries = entries;
									});
								})();
							}
						}
					}
					apiQueryDone = true;
				}
			});

			/* Check to see if we're done; if we are, invoke the callback function. (Idea from @noble-mushtak) */
			var finishTimeout = setInterval(function() {
				var done = apiQueryDone;

				if (done) {
					for (var i in contests) {
						if (contests[i].entries === undefined) {
							done = false;
							return;
						}
					}

					console.log("All done!");
					callback(contests);
					clearInterval(finishTimeout);
				}
			}, 1000);
		}
	};
})();