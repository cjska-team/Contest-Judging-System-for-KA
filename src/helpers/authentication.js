module.exports = {
    setupOnClick: function(selector, cjsWrapper) {
        $(selector).on("click", (evt) => {
            evt.preventDefault();

            if (cjsWrapper.fetchFirebaseAuth() === null) {
                cjsWrapper.authenticate();
            } else {
                cjsWrapper.authenticate(true);
            }
        });
    },
    showWelcome: function(selector, cjsWrapper) {
        if (cjsWrapper.fetchFirebaseAuth() === null) {
            $(selector).text("Hello guest! Click me to log in.");
        } else {
            $(selector).text(`Hello ${cjsWrapper.fetchFirebaseAuth().google.displayName}! (Not you? Click here!)`);
        }
    },
    setupPageAuth: function(authBtnSelector, cjsWrapper) {
        this.setupOnClick(authBtnSelector, cjsWrapper);
        this.showWelcome(authBtnSelector, cjsWrapper);
    }
};