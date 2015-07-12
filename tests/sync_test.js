//syncBtn is the "Sync Me!" button and contestIds is the <div> element at the bottom of the screen.
var syncBtn = document.getElementById("syncBtn"), contestIds = document.getElementById("contestIds");

//When syncBtn is clicked...
var clickHandler = function() {
    //Alert the user to wait for it.
    syncBtn.textContent = "Wait for it...";
    //Make sure that the user can not click the button while we're waiting for sync().
    syncBtn.removeEventListener("click", clickHandler);
    
    sync(function(contests) {
        //This is in a try/finally loop so the finally loop will run regardless of errors.
        try {
            //Sort contests by id
            contests.sort(function(a, b) { return a.id - b.id; });
            //Tell the user the number of contests found.
            //Noble Mushtak: I don't understand why this is contests.length+1. Shouldn't it just be contests.length because this is a measure of the different contests found through sync()? Where's the extra contest come from?
            syncBtn.textContent = (contests.length + 1) + " challenges found!";
            //For checking contests in the JavaScript console:
            window.testContests = contests;

            //Noble Mushtak: In auth_test.html, you say not to but the Firebase ID anywhere, but you put it in sync_test.html, so I got rid of it here.
            var firebaseID = "";

            //Noble Mushtak: Is there anyway we can stop Firebase from making requests when we have the wrong firebaseID? I said the same thing in auth_test.html, too.
            for (var i = 0; i < contests.length; i++) {
                //Set all of these contests in the Firebase database.
                var ref = new Firebase("https://"+firebaseID+".firebaseio.com/contests/" + contests[i].id);
                ref.set({ id: contests[i].id, name: contests[i].name });

                //Make <p> elements and append them to contestIds
                var pElem = document.createElement("p");
                pElem.textContent = contests[i].id + " - " + contests[i].name;
                contestIds.appendChild(pElem);
            }

            //An array of Firebase snapshot keys
            var fromFirebase = [ ];
            var ref = new Firebase("https://"+firebaseID+".firebaseio.com/contests/");
            //Push the contests into fromFirebase in order by key
            ref.orderByKey().on("child_added", function(snapshot) {
                fromFirebase.push(snapshot.key());
            });

            ref.once("value", function(snapshot) {
                //Make sure all of these items exist on KA.
                for (var i = 0; i < fromFirebase.length; i++) {
                    if (contests.indexOf(fromFirebase[i]) !== -1) {
                        console.log("Item removed.");
                    } else {
                        console.log("Exists on Khan Academy!");
                    }
                }

                //Make sure that all of these contests exist in Firebase and if not, set them in the Firebase database.
                for (var j = 0; j < contests.length; j++) {
                    var newRef = new Firebase("https://"+firebaseID+".firebaseio.com/contests/" + contests[j].id);
                    if (fromFirebase.indexOf(contests[j].id) === -1) {
                        console.log("We need to add this one!");
                        newRef.set(contests[j]);
                    } else {
                        console.log("Exists in Firebase!");
                    }
                }
            });
        } finally {
            //Allow the user to click the button again
            syncBtn.addEventListener("click", clickHandler);
        }
    });
};
//Bind clickHandler to syncBtn
syncBtn.addEventListener("click", clickHandler);