$(document).ready(function() {
	/*var allowNotificationUpdates = true;
	chrome.storage.sync.get("allowNU", function(data){
		allowNotificationUpdates = data; //Must Fix
	});*/
	$.getScript(chrome.extension.getURL("scripts/inject/notifications.js"));
});