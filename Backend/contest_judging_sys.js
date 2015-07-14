/***
 * This file is where all the general purpose, reusable code should go!
***/

/*
 * Basic Script Injection
 * Author: Gigabyte Giant
 */
var include = function(link) {
    /*Append a <script> tag with src link into the <body>*/
    var scriptTag = document.createElement("script");
    scriptTag.src = link;
    document.body.appendChild(scriptTag);
};

var getApi = function(apiUrl, complete){
    /*Send a GET AJAX request to apiUrl and call complete when finished*/
    //Made by aikaikaik in https://github.com/aikaikaik/KA-Contest-Judging-System/commit/dee9bceaef6c6fc8abf8437d76882e5cfca81718
    return $.ajax({
        type: 'GET',
        url: apiUrl,
        async: true,
        complete: complete
    });
};
/*
var includeFunc = function(path) {
	var scriptTag = document.createElement("script");
	scriptTag.src = path;

	document.body.appendChild(scriptTag);

	return scriptTag;
};

window.Contest_Judging_System = (function() {
	// jQuery and Firebase are both dependencies for this project. If we don't have them, exit the function immediately.
	if (!jQuery || !Firebase || !window.KA_API) return; // TODO: If a project dependency doesn't exist, go ahead an inject it.

	return {
		include: includeFunc,
		sync: function() {
			// TODO
			KA_API.getContests(function() {});
			console.log("Sync function coming soon!");
		}
	};
})();
>>>>>>> Gigabyte-Giant/master
*/
