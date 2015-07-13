/***
 * This file is where all the general purpose, reusable code should go!
***/
var includeFunc = function(path) {
	var scriptTag = document.createElement("script");
	scriptTag.src = path;

	document.body.appendChild(scriptTag);

	return scriptTag;
};

window.Contest_Judging_System = (function() {
	/* jQuery and Firebase are both dependencies for this project. If we don't have them, exit the function immediately. */
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