module.exports = {
    addAdminLink: function(selector, cjsWrapper) {
        cjsWrapper.getPermLevel(function(permLevel) {
            if (permLevel >= 5) {
                $("<li>").append(
                    $("<a>").attr("href", "./admin/").text("Admin dashboard")
                ).insertBefore($(selector).parent());
            }
        });
    },
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
        this.addAdminLink(authBtnSelector, cjsWrapper);
    }
};