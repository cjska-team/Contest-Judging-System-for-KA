module.exports = (function() {
    if (!window.jQuery || !window.Firebase) {
        return;
    }

    // The following variable is used to store our "Firebase Key"
    let FIREBASE_KEY = "https://contest-judging-sys.firebaseio.com";

    return {
        fetchFirebaseAuth: function() {
            return (new window.Firebase(FIREBASE_KEY)).getAuth();
        }
    };
})();
