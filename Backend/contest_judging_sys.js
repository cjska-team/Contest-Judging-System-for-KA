/***
 * This file is where all the general purpose, reusable code should go!
***/

window.Contest_Judging_System = (function() {
	/* jQuery and Firebase are both dependencies for this project. If we don't have them, exit the function immediately. */
	if (!jQuery || !Firebase) return;

	return {
		include: function(path) {
			var scriptTag = document.createElement("script");
			scriptTag.src = link;

			document.body.appendChild(scriptTag);

			return scriptTag;
		},
		sync: function() {
			// TODO
		}
	}
})();