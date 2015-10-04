module.exports = (function() {
	/* An array of the keys that NEED to exist on the window object for our code to function
	   properly. Do it this way so that if there IS a missing dependency we can just open up
	   the console and instantly see what we're missing */
	var deps = ["jQuery", "Firebase"];
	var hasAllDeps = true;
    for (var i = 0; i < deps.length; i ++) {
    	if (!window[deps[i]]) {
    		console.error("Missing dependency \"" + deps[i] + "\"");
    		hasAllDeps = false;
    	}
    }
    if (!hasAllDeps) {
    	return;
    }



    var firebaseRef = new Firebase("https://contest-judging-sys.firebaseio.com");

    var CJSystem = {};



    CJSystem.contests = function(cfg) {
    	var contestKeys = firebaseRef.child("contestKeys");

    	contestKeys.orderByKey().on("child_added", function(item) {
    		cfg.callback.call(item, item);
    	});
    };



    CJSystem.contest = function(cfg) {
    	var callbackProps = ["desc", "id", "img", "name", "entryCount", "entryKeys", "rubrics"];
    	var loadedProps = 0;

    	var contestRef = firebaseRef.child("contests").child(cfg.id);

    	var callbackData = {};

    	function getProp(prop) {
    		contestRef.child(prop).once("value", function(snapshot) {
    			callbackData[prop] = snapshot.val();

    			loadedProps += 1;

    			if (loadedProps === callbackProps.length) {
    				cfg.callback.call(callbackData, callbackData);
    			}

    		});
    	}

    	for (var i = 0; i < callbackProps.length; i ++) {
    		getProp(callbackProps[i]);
    	}
    };



    return CJSystem;
})();
