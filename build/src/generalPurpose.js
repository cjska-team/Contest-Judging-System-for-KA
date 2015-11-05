(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = (function () {
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
            cookieName = cookieName + "=";
            // Check all of the cookies and try to find the one containing name.
            var cookieList = document.cookie.split(";");
            for (var cInd = 0; cInd < cookieList.length; cInd++) {
                var curCookie = cookieList[cInd];
                while (curCookie[0] === " ") {
                    curCookie = curCookie.substring(1);
                }
                // If we've found the right cookie, return its value.
                if (curCookie.indexOf(cookieName) === 0) {
                    return curCookie.substring(cookieName.length, curCookie.length);
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
            document.cookie = cookieName + "=" + value + "; " + expires;
        },
        /**
         * getUrlParams()
         * @author Gigabyte Giant (2015)
         * @param {String} url: The URL to fetch URL parameters from
         */
        getUrlParams: function getUrlParams(url) {
            var urlParams = {};

            var splitUrl = url.split("?")[1];

            if (splitUrl !== undefined) {
                var tmpUrlParams = splitUrl.split("&");

                for (var upInd = 0; upInd < tmpUrlParams.length; upInd++) {
                    var currParamStr = tmpUrlParams[upInd];

                    urlParams[currParamStr.split("=")[0]] = currParamStr.split("=")[1].replace(/\#\!/g, "");
                }
            }

            return urlParams;
        }
    };
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvZ2VuZXJhbFB1cnBvc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxZQUFXO0FBQ3pCLFdBQU87Ozs7Ozs7O0FBUUgsaUJBQVMsRUFBRSxtQkFBUyxVQUFVLEVBQUU7O0FBRTVCLHNCQUFVLEdBQUcsVUFBVSxHQUFHLEdBQUcsQ0FBQzs7QUFFOUIsZ0JBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLGlCQUFLLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUcsRUFBRTtBQUNsRCxvQkFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLHVCQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7QUFDekIsNkJBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN0Qzs7QUFFRCxvQkFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNyQywyQkFBTyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNuRTthQUNKOztBQUVELG1CQUFPLEVBQUUsQ0FBQztTQUNiOzs7Ozs7OztBQVFELGlCQUFTLEVBQUUsbUJBQVMsVUFBVSxFQUFFLEtBQUssRUFBRTs7QUFFbkMsZ0JBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDbkIsYUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQUFBQyxDQUFDLENBQUM7QUFDcEQsZ0JBQUksT0FBTyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDM0Msb0JBQVEsQ0FBQyxNQUFNLEdBQUcsVUFBVSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLE9BQU8sQ0FBQztTQUMvRDs7Ozs7O0FBTUQsb0JBQVksRUFBRSxzQkFBUyxHQUFHLEVBQUU7QUFDeEIsZ0JBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQzs7QUFFbkIsZ0JBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWpDLGdCQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7QUFDeEIsb0JBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRXZDLHFCQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUN0RCx3QkFBSSxZQUFZLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV2Qyw2QkFBUyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUM3RCxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUM3QjthQUNKOztBQUVELG1CQUFPLFNBQVMsQ0FBQztTQUNwQjtLQUNKLENBQUM7Q0FDTCxDQUFBLEVBQUcsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0Q29va2llKGNvb2tpZU5hbWUpXG4gICAgICAgICAqIEZldGNoZXMgdGhlIHNwZWNpZmllZCBjb29raWUgZnJvbSB0aGUgYnJvd3NlciwgYW5kIHJldHVybnMgaXQncyB2YWx1ZS5cbiAgICAgICAgICogQGF1dGhvciB3M3NjaG9vbHNcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNvb2tpZU5hbWU6IFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdGhhdCB3ZSB3YW50IHRvIGZldGNoLlxuICAgICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBjb29raWVWYWx1ZTogVGhlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgY29va2llLCBvciBhbiBlbXB0eSBzdHJpbmcsIGlmIHRoZXJlIGlzIG5vIFwibm9uLWZhbHN5XCIgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICBnZXRDb29raWU6IGZ1bmN0aW9uKGNvb2tpZU5hbWUpIHtcbiAgICAgICAgICAgIC8vIEdldCB0aGUgY29va2llIHdpdGggbmFtZSBjb29raWUgKHJldHVybiBcIlwiIGlmIG5vbi1leGlzdGVudClcbiAgICAgICAgICAgIGNvb2tpZU5hbWUgPSBjb29raWVOYW1lICsgXCI9XCI7XG4gICAgICAgICAgICAvLyBDaGVjayBhbGwgb2YgdGhlIGNvb2tpZXMgYW5kIHRyeSB0byBmaW5kIHRoZSBvbmUgY29udGFpbmluZyBuYW1lLlxuICAgICAgICAgICAgdmFyIGNvb2tpZUxpc3QgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoXCI7XCIpO1xuICAgICAgICAgICAgZm9yICh2YXIgY0luZCA9IDA7IGNJbmQgPCBjb29raWVMaXN0Lmxlbmd0aDsgY0luZCArKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJDb29raWUgPSBjb29raWVMaXN0W2NJbmRdO1xuICAgICAgICAgICAgICAgIHdoaWxlIChjdXJDb29raWVbMF0gPT09IFwiIFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1ckNvb2tpZSA9IGN1ckNvb2tpZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIElmIHdlJ3ZlIGZvdW5kIHRoZSByaWdodCBjb29raWUsIHJldHVybiBpdHMgdmFsdWUuXG4gICAgICAgICAgICAgICAgaWYgKGN1ckNvb2tpZS5pbmRleE9mKGNvb2tpZU5hbWUpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJDb29raWUuc3Vic3RyaW5nKGNvb2tpZU5hbWUubGVuZ3RoLCBjdXJDb29raWUubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBPdGhlcndpc2UsIGlmIHRoZSBjb29raWUgZG9lc24ndCBleGlzdCwgcmV0dXJuIFwiXCJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogc2V0Q29va2llKGNvb2tpZU5hbWUsIHZhbHVlKVxuICAgICAgICAgKiBDcmVhdGVzL3VwZGF0ZXMgYSBjb29raWUgd2l0aCB0aGUgZGVzaXJlZCBuYW1lLCBzZXR0aW5nIGl0J3MgdmFsdWUgdG8gXCJ2YWx1ZVwiLlxuICAgICAgICAgKiBAYXV0aG9yIHczc2Nob29sc1xuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29va2llTmFtZTogVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0aGF0IHdlIHdhbnQgdG8gY3JlYXRlL3VwZGF0ZS5cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlOiBUaGUgdmFsdWUgdG8gYXNzaWduIHRvIHRoZSBjb29raWUuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRDb29raWU6IGZ1bmN0aW9uKGNvb2tpZU5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBTZXQgYSBjb29raWUgd2l0aCBuYW1lIGNvb2tpZSBhbmQgdmFsdWUgY29va2llIHRoYXQgd2lsbCBleHBpcmUgMzAgZGF5cyBmcm9tIG5vdy5cbiAgICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGQuc2V0VGltZShkLmdldFRpbWUoKSArICgzMCAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcbiAgICAgICAgICAgIHZhciBleHBpcmVzID0gXCJleHBpcmVzPVwiICsgZC50b1VUQ1N0cmluZygpO1xuICAgICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llTmFtZSArIFwiPVwiICsgdmFsdWUgKyBcIjsgXCIgKyBleHBpcmVzO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0VXJsUGFyYW1zKClcbiAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHVybDogVGhlIFVSTCB0byBmZXRjaCBVUkwgcGFyYW1ldGVycyBmcm9tXG4gICAgICAgICAqL1xuICAgICAgICBnZXRVcmxQYXJhbXM6IGZ1bmN0aW9uKHVybCkge1xuICAgICAgICAgICAgdmFyIHVybFBhcmFtcyA9IHt9O1xuXG4gICAgICAgICAgICB2YXIgc3BsaXRVcmwgPSB1cmwuc3BsaXQoXCI/XCIpWzFdO1xuXG4gICAgICAgICAgICBpZiAoc3BsaXRVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHZhciB0bXBVcmxQYXJhbXMgPSBzcGxpdFVybC5zcGxpdChcIiZcIik7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCB1cEluZCA9IDA7IHVwSW5kIDwgdG1wVXJsUGFyYW1zLmxlbmd0aDsgdXBJbmQrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VyclBhcmFtU3RyID0gdG1wVXJsUGFyYW1zW3VwSW5kXTtcblxuICAgICAgICAgICAgICAgICAgICB1cmxQYXJhbXNbY3VyclBhcmFtU3RyLnNwbGl0KFwiPVwiKVswXV0gPSBjdXJyUGFyYW1TdHIuc3BsaXQoXCI9XCIpWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwjXFwhL2csIFwiXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHVybFBhcmFtcztcbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuIl19
