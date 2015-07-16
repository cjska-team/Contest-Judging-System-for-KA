/***
 * This file is where all the general purpose, reusable code should go!
***/
/* This function can be used to inject scripts into pages. It returns the created <script> element. */
/* The reason we make it a global function even though it's in the below namespace is because outside JavaScript files might need to use this function after this function loads, but before the namespace is loaded. */
window.includeFunc = function(path) {
    var scriptTag = document.createElement("script");
    scriptTag.src = path;
    document.body.appendChild(scriptTag);
    return scriptTag;
};

window.Contest_Judging_System = (function() {
    /* Function wrapper to create Contest_Judging_System */
    
    /* jQuery and Firebase are both dependencies for this project. If we don't have them, exit the function immediately. */
    /* TODO: If a project dependency doesn't exist, go ahead an inject it. */
    if (!window.jQuery || !window.Firebase || !window.KA_API) {
        console.log("Needs jQuery, Firebase, and KA_API");
        return;
    }

    /* Everything from this namespace will be placed in the object that is returned. */
    return {
        /* Puts the script injection function inside of this namespace. */
        include: includeFunc,
        /* This function gets all the contests that we have stored on Firebase and passes them into a callback function. */
        getStoredContests: function(callback) {
            /* This is the object for the contests within our Firebase database. */
            var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/contests/");
            /* This is an object to hold all of the data from Firebase. */
            var fromFirebase = {};
            
            /* Template fromFirebase for testing: */
            /*fromFirebase[4955067011694592] = {
                id: 4955067011694592,
                name: "Contest: Comic Strip",
                img: "/computer-programming/contest-comic-strip/4955067011694592/5724160613416960.png"
            };
            fromFirebase[5829785948389376] = {
                id: 5829785948389376,
                name: "Contest: Emoji Maker",
                img: "/computer-programming/contest-emoji-maker/5829785948389376/5668600916475904.png"
            };
            callback(fromFirebase);
            return;*/
            
            /* Insert all of the entries in our database in order by key */
            fbRef.orderByKey().on("child_added", function(item) {
                fromFirebase[item.key()] = item.val();
            });
            /* Finally, pass fromFirebase into callback. */
            fbRef.once("value", function(data) {
                callback(fromFirebase);
            });
        },
        sync: function(callback) {
            /*
             * sync() just fetches the latest data from Khan Academy and Firebase, and compares it.
             * We have two arrays of data; kaData and fbData. We get the data using the KA_API and the above getStoredContests() method.
             * Once both requests have finished, we set fbData to kaData using the Firebase set() method.
             * Originally authored by Gigabyte Giant
             * TODO: Perform added/deleted checking on contest entries.
             * TODO: Actually do something with callback
             * TODO: Actually do something with fbData
             */
            /* These two Booleans check whether or not both requests have been completed. */
            var completed = {
                firebase: false,
                khanacademy: false
            };
            /* Currently not used. Might be re-implemented in the future. */
            /* var addedContests = [];
            var removedContests = []; */
            /* Our two arrays of data */
            var kaData;
            var fbData;

            /* Get all of the contests from Khan Academy */
            KA_API.getContests(function(response) {
                /* When done, set kaData to the contests and set completed.khanacademy to true. */
                kaData = response;
                completed.khanacademy = true;
            });
            /* Get all of the known contests from Firebase */
            this.getStoredContests(function(response) {
                /* When done, set fbData to our stored contests and set completed.firebase to true. */
                fbData = response;
                completed.firebase = true;
            });

            /* Create a new reference to Firebase to use later on when pushing contests to Firebase. */
            var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/contests/");
            /* Every second, we check if both requests have been completed and if they have, we stop checking if both requests have been completed and set fbRef to kaData using the Firebase set() method. */
            var recievedData = setInterval(function() {
                if (completed.firebase && completed.khanacademy) {
                    clearInterval(recievedData);
                    fbRef.set(kaData);
                }
            }, 1000);
        }
    };
})();