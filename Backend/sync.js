function doesEntryExist() {
	
}

function fetchEntries(contestID) {
	var entries = { };
	var apiUrl = "https://www.khanacademy.org/api/internal/scratchpads/" + contestID + "/top-forks?casing=camel&sort=2&limit=300000&page=0&lang=en";

	var scratchpads = [];

	var query = $.ajax({
		type: 'GET',
		url: apiUrl,
		async: false,
		complete: function(apiResponse) {
			scratchpads = apiResponse.responseJSON.scratchpads;
		}
	});

	for (var i = 0; i < scratchpads.length; i++) {
		entries[scratchpads[i].url.split("/")[5]] = {id: scratchpads[i].url.split("/")[5], name: scratchpads[i].translatedTitle};
	}

	return entries;
}

window.sync = function() {
	var username = "pamela";
	var apiUrl = 'https://www.khanacademy.org/api/internal/scratchpads/top?casing=camel&topic_id=xffde7c31&sort=4&limit=40000&page=0&lang=en&_=1436581332879';

	var data;

	var apiQuery = $.ajax({
		type: 'GET',
		url: apiUrl,
		async: false,
		complete: function(apiResponse) {
			data = apiResponse;
		}
	});
	
	var allPrograms = data.responseJSON.scratchpads;

	var contestIds = [ ];
	var contests = 0;
	for (var i = 0; i < allPrograms.length; i++) {
		var currScratchpad = allPrograms[i];
		
		if (currScratchpad.authorNickname.match("pamela") !== null) {
			if (currScratchpad.translatedTitle.match("Contest") !== null) {
				//console.log(currScratchpad.url);

				contestIds.push({id:currScratchpad.url.split("/")[5], name:currScratchpad.translatedTitle, entries: fetchEntries(currScratchpad.url.split("/")[5])});
				contests++;
			}
		}
	}

	return contestIds;
};