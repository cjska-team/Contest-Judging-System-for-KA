module.exports = (function() {
    if (!window.jQuery || !window.Firebase) {
        return;
    }

    // Declare a new "constant" to hold our "Firebase Key".
    let FIREBASE_KEY = "https://contest-judging-sys.firebaseio.com";

    return {
        fetchFirebaseAuth: function() {
            return (new window.Firebase(FIREBASE_KEY)).getAuth();
        }
    };
})();
