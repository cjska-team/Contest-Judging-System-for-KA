$(function() {
	Contest_Judging_System.getStoredContests(function(contests) {
		console.log(contests);
		for (var i in contests) {
			var curr = contests[i];

			var programData = $.ajax({
				type: 'GET',
				url: 'http://www.khanacademy.org/api/labs/scratchpads/' + curr.id,
				async: false // Will change to asynchronous later on!
			}).responseJSON;

			var rowDiv = document.createElement("div");
			rowDiv.className = "row";

			var contestDiv = document.createElement("div");
			contestDiv.className = "contest";

			var contestTitleHeading = document.createElement("h3");
			contestTitleHeading.textContent = curr.name;

			var contestDetailsDiv = document.createElement("div");
			contestDetailsDiv.className = "details";
			contestDetailsDiv.innerHTML = programData.description || "No description provided!";

			$(contestDiv).add(contestTitleHeading).appendTo(contestDiv);
			$(contestDiv).add(contestDetailsDiv).appendTo(contestDiv);
			$(rowDiv).add(contestDiv).appendTo(rowDiv);
			$("#contests").add(rowDiv).appendTo("#contests");
		}
	});
});