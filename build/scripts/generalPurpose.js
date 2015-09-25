'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var generalPurposeFunctions = (function () {
    return {
        /**
         * getCookie(cookieName)
         * Fetches the specified cookie from the browser, and returns it's value.
         * @author w3schools
         * @param {String} cookieName: The name of the cookie that we want to fetch.
         * @returns {String} cookieValue: The value of the specified cookie, or an empty string, if there is no "non-falsy" value.
         */
        getCookie: function getCookie(cookieName) {
            // Get the cookie with name cookie (return "" if non-existent)
            var name = cookie + "=";
            // Check all of the cookies and try to find the one containing name.
            var cookieList = document.cookie.split(';');
            for (var cInd = 0; cInd < cookieList.length; cInd++) {
                var curCookie = cookieList[cInd];
                while (curCookie[0] === ' ') {
                    curCookie = curCookie.substring(1);
                }
                // If we've found the right cookie, return its value.
                if (curCookie.indexOf(name) === 0) {
                    return curCookie.substring(name.length, curCookie.length);
                }
            }
            // Otherwise, if the cookie doesn't exist, return ""
            return "";
        },
        /**
         * setCookie(cookieName, value)
         * Creates/updates a cookie with the desired name, setting it's value to "value".
         * @author w3schools
         * @param {String} cookieName: The name of the cookie that we want to create/update.
         * @param {String} value: The value to assign to the cookie.
         */
        setCookie: function setCookie(cookieName, value) {
            // Set a cookie with name cookie and value cookie that will expire 30 days from now.
            var d = new Date();
            d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000);
            var expires = "expires=" + d.toUTCString();
            document.cookie = cookie + "=" + value + "; " + expires;
        }
    };
})();

exports['default'] = generalPurposeFunctions;
module.exports = exports['default'];