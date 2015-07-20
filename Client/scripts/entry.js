/* If it doesn't look like there's a contest ID in the URL, show an alert, and go back one page. */
if (window.location.search.indexOf("?contest") === -1) {
	alert("Contest ID not found!");

	window.history.back();
}

/* If it doesn't look like there's an entry ID in the URL, show an alert, and go back one page. */
if (window.location.search.indexOf("&entry=") === -1) {
	alert("Entry ID not found!");

	window.history.back();
}

/* Locate the contest ID in the URL, and store it for later use. */
var contestId = window.location.href.split("?contest=")[1].split("&")[0];

/* Locate the entry ID in the URL, and store it for later use. */
var entryId = window.location.href.split("&entry=")[1];

var baseURL = "https://www.khanacademy.org/computer-programming/entry/{ENTRYID}/embedded?buttons=no&editor=no&author=no&embed=yes";

/* Print the contest ID that we found, to the console. */
console.log("Contest ID: " + contestId);

/* Print the entry ID that we found, to the console. */
console.log("Entry ID: " + entryId);

/* Fetch the data for this contest entry, and then use the data to build up the current page. */
Contest_Judging_System.loadEntry(contestId, entryId, function(entryData) {
	console.log(entryData);

	document.querySelector("#program-name").textContent = entryData.name;

	/* TODO: Load a program using the embed code provided by Khan Academy */
	// https://www.khanacademy.org/computer-programming/gradient-background/6041840424583168/embedded?id=1437401965968-0.06310267560184002&origin=http%3A%2F%2F127.0.0.1%3A25565&buttons=yes&embed=yes&editor=yes&author=yes
	var programIframe = document.createElement("iframe");
	programIframe.src = baseURL.replace("{ENTRYID}", entryData.id);
	programIframe.width = 940;
	programIframe.height = 400;
	programIframe.scrolling = "no";
	programIframe.frameborder = 0;

	document.querySelector(".program-preview").appendChild(programIframe);	
});

$(".toggleCode").on("click", function() {
	var currentSrc = $("iframe").attr("src");

	if (currentSrc.indexOf("editor=yes") !== -1) {
		$("iframe").attr("src", currentSrc.replace("editor=yes", "editor=no"));
	} else {
		$("iframe").attr("src", currentSrc.replace("editor=no", "editor=yes"));
	}
});