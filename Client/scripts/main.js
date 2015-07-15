$(function() {
	Contest_Judging_System.getStoredContests(function(contests) {
		for (var i in contests) {
			var curr = contests[i];

			var programData = $.ajax({
				type: 'GET',
				url: 'http://www.khanacademy.org/api/labs/scratchpads/' + curr.id,
				async: false // Will change to asynchronous later on!
			}).responseJSON;

			/* http://getbootstrap.com/components/#media-default */

			var rowDiv = document.createElement("div");
			rowDiv.className = "row";

			var contestDiv = document.createElement("div");
			contestDiv.className = "contest";

			var mediaDiv = document.createElement("div");
			mediaDiv.className = "media";

			var mediaLeftDiv = document.createElement("div");
			mediaLeftDiv.className = "media-left media-middle";

			var imgLink = document.createElement("a");
			imgLink.href = "https://khanacademy.org/computer-programming/contest/" + curr.id;
			imgLink.target = "_blank";

			var mediaObject = document.createElement("img");
			mediaObject.className = "media-object";
			mediaObject.src = "https://khanacademy.org" + curr.img;

			var mediaBody = document.createElement("div");
			mediaBody.className = "media-body";

			var mediaHeading = document.createElement("h4");
			mediaHeading.className = "media-heading";
			mediaHeading.textContent = curr.name;

			var detailsDiv = document.createElement("div");
			detailsDiv.className = "details";
			detailsDiv.innerHTML = programData.description || "No description provided!";

			$(imgLink).add(mediaObject).appendTo(imgLink);
			$(mediaLeftDiv).add(imgLink).appendTo(mediaLeftDiv);

			$(mediaBody).add(mediaHeading).appendTo(mediaBody);
			$(mediaBody).add(detailsDiv).appendTo(mediaBody);

			$(mediaDiv).add(mediaLeftDiv).appendTo(mediaDiv);
			$(mediaDiv).add(mediaBody).appendTo(mediaDiv);

			$(contestDiv).add(mediaDiv).appendTo(contestDiv);

			$(rowDiv).add(contestDiv).appendTo(rowDiv);

			$("#contests").add(rowDiv).appendTo("#contests");
		}

		$("#loading").css("display", "none");

		$("a").attr("target", "_blank");
	});
});