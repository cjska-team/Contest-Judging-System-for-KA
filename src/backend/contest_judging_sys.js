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

    /* A list of the properties that we want to get from contests */
    var contestProps = ["desc", "id", "img", "name", "entryCount", "entryKeys", "rubrics"];


    /**
     * contests(cfg)
     * Gets all contests from firebase and calls a function whenever one loads
     * @author JavascriptFTW
     * @param {Object} cfg: An object containing data for the method call
     */
    CJSystem.contests = function(cfg) {
    	var contestKeys = firebaseRef.child("contestKeys");

    	contestKeys.orderByKey().on("child_added", function(item) {
    		cfg.callback.call(item, item);
    	});
    };


    /**
     * contest(cfg)
     * Gets data about a contest from firebase
     * @author JavascriptFTW
     * @param {Object} cfg: An object containing data for the method call
     */
    CJSystem.contest = function(cfg) {
        /* Store how many contest properties we've loaded from firebase so we can tell
           when we're done loading */
    	var loadedProps = 0;

    	var contestRef = firebaseRef.child("contests").child(cfg.id);

    	var callbackData = {};

    	function getProp(prop) {
    		contestRef.child(prop).once("value", function(snapshot) {
    			callbackData[prop] = snapshot.val();

                /* We've loaded a property for this contest so increment loadedProps */
    			loadedProps += 1;

                /* If the number of loaded properties equals the number of properties
                   that we want to load... */
    			if (loadedProps === contestProps.length) {
                    /* ...we're obviously done so call the callback that the user passed */
    				cfg.callback.call(callbackData, callbackData);
    			}

    		});
    	};

    	for (var i = 0; i < contestProps.length; i ++) {
    		getProp(contestProps[i]);
    	}
    };



    return CJSystem;
})();
