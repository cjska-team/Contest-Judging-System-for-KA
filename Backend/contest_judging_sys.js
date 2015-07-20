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
        /* This function gets all the "Rubrics" that we've defined in Firebase. */
        getRubrics: function(callback) {
            /* Connect to our Firebase app. */
            var firebaseRef = new Firebase("https://contest-judging-sys.firebaseio.com/");

            /* We're going to messing around with the data in our "rubrics" object. Let's go ahead and grab that "child". */
            var fbRubrics = firebaseRef.child("rubrics");

            /* This array will hold all of the Rubrics that we've defined in our array. */
            var rubrics = [ ];

            /* Query all the data from Firebase, and push the JSON keys into our array. */
            fbRubrics.orderByKey().on("child_added", function(responseData) {
                rubrics[responseData.key()] = responseData.val();
            });

            /* Once all our data has been loaded from Firebase, invoke our callback. */
            fbRubrics.once("value", function() {
                callback(rubrics);
            });
        },
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
        /* Load a specific contest entry, based on ID */
        loadEntry: function(contestId, entryId, callback) {
            var firebaseRef = new Firebase("https://contest-judging-sys.firebaseio.com/contests/" + contestId + "/entries/");

            firebaseRef.orderByKey().equalTo(entryId).on("child_added", function(entryData) {
                callback(entryData.val());
            });
        },
        /* Loads a specific contest from Firebase. */
        loadContest: function(contestId, callback) {
            /* Connect to our Firebase app */
            var firebaseRef = new Firebase("https://contest-judging-sys.firebaseio.com/");
            /* Since we're only going to be dealing with contests in this function, go ahead and create a reference to the "contests" "child". */
            var contestsRef = firebaseRef.child("contests");

            contestsRef.orderByChild("id").equalTo(contestId).on("child_added", function(contestData) {
                callback(contestData.val());
            });
        },
        /* Gets N random entries (where N is the number of contests to get) and passes them into a callback. */
        get_N_Entries: function(n, contestId, callback) {
            var done = false;
            /* This JSON object stores each of the entries we've picked out to display to the judge */
            var pickedEntries = { };

            /* This variable is used to store the number of entries for this contest. */
            var numberOfEntries = 0;

            Contest_Judging_System.loadContest(contestId, function(contestData) {

                /* Declare a variable to hold an array of keys for entries */
                var entriesKeys = Object.keys(contestData.entries);

                /* An array to store the keys that we've already picked */
                var pickedKeys = [ ];

                /* While we still need keys to return... */
                while (pickedKeys.length < n) {
                    /* Pick a random index */
                    var randIndex = Math.floor( Math.random() * entriesKeys.length );

                    /* Get the key from the index that we picked */
                    var pickedKey = entriesKeys[randIndex];

                    /* If we haven't already picked that key... */
                    if (pickedKeys.indexOf(pickedKey) === -1) {
                        /* ...pick it. */
                        pickedEntries[pickedKey] = contestData.entries[pickedKey];
                        pickedKeys.push(pickedKey);
                    }
                }

                done = true;
            });

            var finishedInterval = setInterval(function() {
                if (done) {
                    clearInterval(finishedInterval);
                    callback(pickedEntries);
                }
            }, 1000);
        },
        sync: function(callback) {
            /*
             * sync() just fetches the latest data from Khan Academy and Firebase, and compares it.
             * We have two arrays of data; kaData and fbData. We get the data using the KA_API and the above getStoredContests() method.
             * Once both requests have finished, we set fbData to kaData using the Firebase set() method.
             * Originally authored by Gigabyte Giant
             * TODO: Perform added/deleted checking on contest entries.
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
                    console.log("Sync Completed");
                    callback(kaData);
                }
            }, 1000);
        }
    };
})();