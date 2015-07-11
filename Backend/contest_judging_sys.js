/***
 * This file is where all the general purpose, reusable code should go!
***/

/*
 * Basic Script Injection
 * Author: Gigabyte Giant
 */
var include = function(link) {
	var scriptTag = document.createElement("script");
	scriptTag.src = link;

	document.body.appendChild(scriptTag);
};