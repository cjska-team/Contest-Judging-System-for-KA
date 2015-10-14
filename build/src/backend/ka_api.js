(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = (function () {
    // This requires module requests jQuery; if jQuery isn't found...
    if (!window.jQuery) {
        // ...exit the function.
        return;
    }

    return {
        // The "misc" property contains any miscellaneous properties that we might need throughout this module.
        misc: {
            // The "allData" property is used when we want to make requests to the API, and want to return "all" of the possible data.
            allData: 400000
        },
        // The "urls" property contains all of the API urls that are used throughout this module.
        urls: {
            // The spotlight section on Khan Academy, is where we get all of the contests from.
            spotlight: "https://www.khanacademy.org/api/internal/scratchpads/top?casing=camel&topic_id=xffde7c31&sort=4&limit=40000&page=0&lang=en&_=1436581332879",
            /**
             * KA_API.urls.spinoffs(sid)
             * Builds up, and returns an API URL that can be used to fetch the spinoffs for a scratchpad.
             * @author Gigabyte Giant (2015)
             * @param {String} scratchpadID: The Khan Academy scratchpad ID of the program that we want to load the spinoffs from.
             * @returns {String} apiUrl: The API URL that can be used to fetch the spinoffs for the desired scratchpad.
             */
            spinoffs: function spinoffs(scratchpadID) {
                return "https://www.khanacademy.org/api/internal/scratchpads/{PROGRAM}/top-forks?casing=camel&sort=2&limit=300000&page=0&lang=en".replace("{PROGRAM}", scratchpadID);
            },
            /**
             * KA_API.urls.scratchpadInfo(sid)
             * Builds up, and returns an API URL that can be used to fetch the data from a scratchpad.
             * @author Gigabyte Giant (2015)
             * @param {String} scratchpadID: The Khan Academy scratchpad ID of the program that we want to load the scratchpad data from.
             * @returns {String} apiUrl: The API URL that can be used to fetch the scratchpad data for the desired program.
             */
            scratchpadInfo: function scratchpadInfo(scratchpadID) {
                return "https://www.khanacademy.org/api/labs/scratchpads/{SCRATCHPAD}".replace("{SCRATCHPAD}", scratchpadID);
            }
        },
        /**
         * getScratchpadInfo(scratchpadId, callback)
         * Makes a call to the Khan Academy CS API to fetch the data for a scratchpad.
         * @author Gigabyte Giant (2015)
         * @param {String} scratchpadId: The Scratchpad ID of the scratchpad that we'd like to retrieve data from.
         * @param {Function} callback*: The callback function to invoke after the data has been retrieved.
         * @returns {JSON}: The JSON data retrieved from the API
         * @NOTE: If a callback function is not passed into this function,
         *  we'll make an synchronous request to the Khan Academy CS API, and then return a JSON object.
         * If a callback function is passed in, we'lll make an asynchronous request to the Khan Academy CS API,
         *  and return nothing, and invoke the callback function that was passed in.
         */
        getScratchpadInfo: function getScratchpadInfo(scratchpadId, callback) {
            // Declare a boolean variable that'll be used to determine whether
            //  or not we're going to make an async request.
            var useAsync = false;

            // If a callback function has been passed in, set "useAsync" to true.
            if (callback !== undefined && typeof callback === "function") {
                useAsync = true;
            }

            // Declare a string variable that'll hold the API URL that we'll
            //  use to fetch the information for the scratchpad that was
            //  specified.
            var apiUrl = this.urls.scratchpadInfo(scratchpadId);

            // Declare an object variable that'll be returned if we're not
            //  performing an async request.
            var apiRequest = $.ajax({
                type: "GET",
                url: apiUrl,
                async: useAsync,
                complete: useAsync === true ? function (apiResponse) {
                    callback(apiResponse.responseJSON);
                } : undefined
            });

            // If we're not making an async request, return the "responseJSON"
            //  property from our "apiRequest" variable.
            return useAsync === false ? apiRequest.responseJSON : undefined;
        },
        /**
         * getSpinoffsFromScratchpad(scratchpadId, callback)
         * Makes a call to the Khan Academy CS API to fetch the spinoffs for a scratchpad.
         * @author Gigabyte Giant (2015)
         * @param {String} scratchpadId: The Scratchpad ID of the scratchpad that we'd like to retrieve spinoffs from.
         * @param {Function} callback*: The callback function to invoke after the data has been retrieved.
         * @returns {JSON}: The JSON data retrieved from the API
         * @NOTE: If a callback function is not passed into this function,
         *  we'll make an synchronous request to the Khan Academy CS API, and then return a JSON object.
         * If a callback function is passed in, we'lll make an asynchronous request to the Khan Academy CS API,
         *  and return nothing, and invoke the callback function that was passed in.
         */
        getSpinoffsFromScratchpad: function getSpinoffsFromScratchpad(scratchpadId, callback) {
            // Declare a boolean variable that'll be used to determine whether
            //  or not we're going to make an async request.
            var useAsync = false;

            // If a callback function has been passed in, set "useAsync" to true.
            if (callback !== undefined && typeof callback === "function") {
                useAsync = true;
            }

            // Declare a string variable that'll hold the API URL that we'll
            //  use to fetch the information for the scratchpad that was
            //  specified.
            var apiUrl = this.urls.spinoffs(scratchpadId);

            // Declare an object variable that'll be returned if we're not
            //  performing an async request.
            var apiRequest = $.ajax({
                type: "GET",
                url: apiUrl,
                async: useAsync,
                complete: useAsync === true ? function (apiResponse) {
                    callback(apiResponse.responseJSON);
                } : undefined
            });

            // If we're not making an async request, return the "responseJSON"
            //  property from our "apiRequest" variable.
            return useAsync === false ? apiRequest.responseJSON : undefined;
        }
    };
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvYmFja2VuZC9rYV9hcGkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxZQUFXOztBQUV6QixRQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTs7QUFFaEIsZUFBTztLQUNWOztBQUVELFdBQU87O0FBRUgsWUFBSSxFQUFFOztBQUVGLG1CQUFPLEVBQUUsTUFBTTtTQUNsQjs7QUFFRCxZQUFJLEVBQUU7O0FBRUYscUJBQVMsRUFBRSw0SUFBNEk7Ozs7Ozs7O0FBUXZKLG9CQUFRLEVBQUUsa0JBQVMsWUFBWSxFQUFFO0FBQzdCLHVCQUFPLDBIQUEwSCxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDeEs7Ozs7Ozs7O0FBUUQsMEJBQWMsRUFBRSx3QkFBUyxZQUFZLEVBQUU7QUFDbkMsdUJBQU8sK0RBQStELENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUNoSDtTQUNKOzs7Ozs7Ozs7Ozs7O0FBYUQseUJBQWlCLEVBQUUsMkJBQVMsWUFBWSxFQUFFLFFBQVEsRUFBRTs7O0FBR2hELGdCQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7OztBQUdyQixnQkFBSSxRQUFRLEtBQUssU0FBUyxJQUFLLE9BQU8sUUFBUSxLQUFLLFVBQVUsQUFBQyxFQUFFO0FBQzVELHdCQUFRLEdBQUcsSUFBSSxDQUFDO2FBQ25COzs7OztBQUtELGdCQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7OztBQUlwRCxnQkFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNwQixvQkFBSSxFQUFFLEtBQUs7QUFDWCxtQkFBRyxFQUFFLE1BQU07QUFDWCxxQkFBSyxFQUFFLFFBQVE7QUFDZix3QkFBUSxFQUFHLFFBQVEsS0FBSyxJQUFJLEdBQUcsVUFBUyxXQUFXLEVBQUU7QUFDakQsNEJBQVEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ3RDLEdBQUcsU0FBUyxBQUFDO2FBQ2pCLENBQUMsQ0FBQzs7OztBQUlILG1CQUFRLFFBQVEsS0FBSyxLQUFLLEdBQUcsVUFBVSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUU7U0FDckU7Ozs7Ozs7Ozs7Ozs7QUFhRCxpQ0FBeUIsRUFBRSxtQ0FBUyxZQUFZLEVBQUUsUUFBUSxFQUFFOzs7QUFHeEQsZ0JBQUksUUFBUSxHQUFHLEtBQUssQ0FBQzs7O0FBR3JCLGdCQUFJLFFBQVEsS0FBSyxTQUFTLElBQUssT0FBTyxRQUFRLEtBQUssVUFBVSxBQUFDLEVBQUU7QUFDNUQsd0JBQVEsR0FBRyxJQUFJLENBQUM7YUFDbkI7Ozs7O0FBS0QsZ0JBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDOzs7O0FBSTlDLGdCQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3BCLG9CQUFJLEVBQUUsS0FBSztBQUNYLG1CQUFHLEVBQUUsTUFBTTtBQUNYLHFCQUFLLEVBQUUsUUFBUTtBQUNmLHdCQUFRLEVBQUcsUUFBUSxLQUFLLElBQUksR0FBRyxVQUFTLFdBQVcsRUFBRTtBQUNqRCw0QkFBUSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDdEMsR0FBRyxTQUFTLEFBQUM7YUFDakIsQ0FBQyxDQUFDOzs7O0FBSUgsbUJBQVEsUUFBUSxLQUFLLEtBQUssR0FBRyxVQUFVLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBRTtTQUNyRTtLQUNKLENBQUM7Q0FDTCxDQUFBLEVBQUcsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgICAvLyBUaGlzIHJlcXVpcmVzIG1vZHVsZSByZXF1ZXN0cyBqUXVlcnk7IGlmIGpRdWVyeSBpc24ndCBmb3VuZC4uLlxuICAgIGlmICghd2luZG93LmpRdWVyeSkge1xuICAgICAgICAvLyAuLi5leGl0IHRoZSBmdW5jdGlvbi5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIC8vIFRoZSBcIm1pc2NcIiBwcm9wZXJ0eSBjb250YWlucyBhbnkgbWlzY2VsbGFuZW91cyBwcm9wZXJ0aWVzIHRoYXQgd2UgbWlnaHQgbmVlZCB0aHJvdWdob3V0IHRoaXMgbW9kdWxlLlxuICAgICAgICBtaXNjOiB7XG4gICAgICAgICAgICAvLyBUaGUgXCJhbGxEYXRhXCIgcHJvcGVydHkgaXMgdXNlZCB3aGVuIHdlIHdhbnQgdG8gbWFrZSByZXF1ZXN0cyB0byB0aGUgQVBJLCBhbmQgd2FudCB0byByZXR1cm4gXCJhbGxcIiBvZiB0aGUgcG9zc2libGUgZGF0YS5cbiAgICAgICAgICAgIGFsbERhdGE6IDQwMDAwMFxuICAgICAgICB9LFxuICAgICAgICAvLyBUaGUgXCJ1cmxzXCIgcHJvcGVydHkgY29udGFpbnMgYWxsIG9mIHRoZSBBUEkgdXJscyB0aGF0IGFyZSB1c2VkIHRocm91Z2hvdXQgdGhpcyBtb2R1bGUuXG4gICAgICAgIHVybHM6IHtcbiAgICAgICAgICAgIC8vIFRoZSBzcG90bGlnaHQgc2VjdGlvbiBvbiBLaGFuIEFjYWRlbXksIGlzIHdoZXJlIHdlIGdldCBhbGwgb2YgdGhlIGNvbnRlc3RzIGZyb20uXG4gICAgICAgICAgICBzcG90bGlnaHQ6IFwiaHR0cHM6Ly93d3cua2hhbmFjYWRlbXkub3JnL2FwaS9pbnRlcm5hbC9zY3JhdGNocGFkcy90b3A/Y2FzaW5nPWNhbWVsJnRvcGljX2lkPXhmZmRlN2MzMSZzb3J0PTQmbGltaXQ9NDAwMDAmcGFnZT0wJmxhbmc9ZW4mXz0xNDM2NTgxMzMyODc5XCIsXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEtBX0FQSS51cmxzLnNwaW5vZmZzKHNpZClcbiAgICAgICAgICAgICAqIEJ1aWxkcyB1cCwgYW5kIHJldHVybnMgYW4gQVBJIFVSTCB0aGF0IGNhbiBiZSB1c2VkIHRvIGZldGNoIHRoZSBzcGlub2ZmcyBmb3IgYSBzY3JhdGNocGFkLlxuICAgICAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzY3JhdGNocGFkSUQ6IFRoZSBLaGFuIEFjYWRlbXkgc2NyYXRjaHBhZCBJRCBvZiB0aGUgcHJvZ3JhbSB0aGF0IHdlIHdhbnQgdG8gbG9hZCB0aGUgc3Bpbm9mZnMgZnJvbS5cbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IGFwaVVybDogVGhlIEFQSSBVUkwgdGhhdCBjYW4gYmUgdXNlZCB0byBmZXRjaCB0aGUgc3Bpbm9mZnMgZm9yIHRoZSBkZXNpcmVkIHNjcmF0Y2hwYWQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNwaW5vZmZzOiBmdW5jdGlvbihzY3JhdGNocGFkSUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJodHRwczovL3d3dy5raGFuYWNhZGVteS5vcmcvYXBpL2ludGVybmFsL3NjcmF0Y2hwYWRzL3tQUk9HUkFNfS90b3AtZm9ya3M/Y2FzaW5nPWNhbWVsJnNvcnQ9MiZsaW1pdD0zMDAwMDAmcGFnZT0wJmxhbmc9ZW5cIi5yZXBsYWNlKFwie1BST0dSQU19XCIsIHNjcmF0Y2hwYWRJRCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBLQV9BUEkudXJscy5zY3JhdGNocGFkSW5mbyhzaWQpXG4gICAgICAgICAgICAgKiBCdWlsZHMgdXAsIGFuZCByZXR1cm5zIGFuIEFQSSBVUkwgdGhhdCBjYW4gYmUgdXNlZCB0byBmZXRjaCB0aGUgZGF0YSBmcm9tIGEgc2NyYXRjaHBhZC5cbiAgICAgICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gc2NyYXRjaHBhZElEOiBUaGUgS2hhbiBBY2FkZW15IHNjcmF0Y2hwYWQgSUQgb2YgdGhlIHByb2dyYW0gdGhhdCB3ZSB3YW50IHRvIGxvYWQgdGhlIHNjcmF0Y2hwYWQgZGF0YSBmcm9tLlxuICAgICAgICAgICAgICogQHJldHVybnMge1N0cmluZ30gYXBpVXJsOiBUaGUgQVBJIFVSTCB0aGF0IGNhbiBiZSB1c2VkIHRvIGZldGNoIHRoZSBzY3JhdGNocGFkIGRhdGEgZm9yIHRoZSBkZXNpcmVkIHByb2dyYW0uXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNjcmF0Y2hwYWRJbmZvOiBmdW5jdGlvbihzY3JhdGNocGFkSUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJodHRwczovL3d3dy5raGFuYWNhZGVteS5vcmcvYXBpL2xhYnMvc2NyYXRjaHBhZHMve1NDUkFUQ0hQQUR9XCIucmVwbGFjZShcIntTQ1JBVENIUEFEfVwiLCBzY3JhdGNocGFkSUQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0U2NyYXRjaHBhZEluZm8oc2NyYXRjaHBhZElkLCBjYWxsYmFjaylcbiAgICAgICAgICogTWFrZXMgYSBjYWxsIHRvIHRoZSBLaGFuIEFjYWRlbXkgQ1MgQVBJIHRvIGZldGNoIHRoZSBkYXRhIGZvciBhIHNjcmF0Y2hwYWQuXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzY3JhdGNocGFkSWQ6IFRoZSBTY3JhdGNocGFkIElEIG9mIHRoZSBzY3JhdGNocGFkIHRoYXQgd2UnZCBsaWtlIHRvIHJldHJpZXZlIGRhdGEgZnJvbS5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sqOiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIGFmdGVyIHRoZSBkYXRhIGhhcyBiZWVuIHJldHJpZXZlZC5cbiAgICAgICAgICogQHJldHVybnMge0pTT059OiBUaGUgSlNPTiBkYXRhIHJldHJpZXZlZCBmcm9tIHRoZSBBUElcbiAgICAgICAgICogQE5PVEU6IElmIGEgY2FsbGJhY2sgZnVuY3Rpb24gaXMgbm90IHBhc3NlZCBpbnRvIHRoaXMgZnVuY3Rpb24sXG4gICAgICAgICAqICB3ZSdsbCBtYWtlIGFuIHN5bmNocm9ub3VzIHJlcXVlc3QgdG8gdGhlIEtoYW4gQWNhZGVteSBDUyBBUEksIGFuZCB0aGVuIHJldHVybiBhIEpTT04gb2JqZWN0LlxuICAgICAgICAgKiBJZiBhIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIHBhc3NlZCBpbiwgd2UnbGxsIG1ha2UgYW4gYXN5bmNocm9ub3VzIHJlcXVlc3QgdG8gdGhlIEtoYW4gQWNhZGVteSBDUyBBUEksXG4gICAgICAgICAqICBhbmQgcmV0dXJuIG5vdGhpbmcsIGFuZCBpbnZva2UgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgd2FzIHBhc3NlZCBpbi5cbiAgICAgICAgICovXG4gICAgICAgIGdldFNjcmF0Y2hwYWRJbmZvOiBmdW5jdGlvbihzY3JhdGNocGFkSWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBEZWNsYXJlIGEgYm9vbGVhbiB2YXJpYWJsZSB0aGF0J2xsIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXJcbiAgICAgICAgICAgIC8vICBvciBub3Qgd2UncmUgZ29pbmcgdG8gbWFrZSBhbiBhc3luYyByZXF1ZXN0LlxuICAgICAgICAgICAgdmFyIHVzZUFzeW5jID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vIElmIGEgY2FsbGJhY2sgZnVuY3Rpb24gaGFzIGJlZW4gcGFzc2VkIGluLCBzZXQgXCJ1c2VBc3luY1wiIHRvIHRydWUuXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT09IHVuZGVmaW5lZCAmJiAodHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgdXNlQXN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEZWNsYXJlIGEgc3RyaW5nIHZhcmlhYmxlIHRoYXQnbGwgaG9sZCB0aGUgQVBJIFVSTCB0aGF0IHdlJ2xsXG4gICAgICAgICAgICAvLyAgdXNlIHRvIGZldGNoIHRoZSBpbmZvcm1hdGlvbiBmb3IgdGhlIHNjcmF0Y2hwYWQgdGhhdCB3YXNcbiAgICAgICAgICAgIC8vICBzcGVjaWZpZWQuXG4gICAgICAgICAgICB2YXIgYXBpVXJsID0gdGhpcy51cmxzLnNjcmF0Y2hwYWRJbmZvKHNjcmF0Y2hwYWRJZCk7XG5cbiAgICAgICAgICAgIC8vIERlY2xhcmUgYW4gb2JqZWN0IHZhcmlhYmxlIHRoYXQnbGwgYmUgcmV0dXJuZWQgaWYgd2UncmUgbm90XG4gICAgICAgICAgICAvLyAgcGVyZm9ybWluZyBhbiBhc3luYyByZXF1ZXN0LlxuICAgICAgICAgICAgdmFyIGFwaVJlcXVlc3QgPSAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBhcGlVcmwsXG4gICAgICAgICAgICAgICAgYXN5bmM6IHVzZUFzeW5jLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiAodXNlQXN5bmMgPT09IHRydWUgPyBmdW5jdGlvbihhcGlSZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhhcGlSZXNwb25zZS5yZXNwb25zZUpTT04pO1xuICAgICAgICAgICAgICAgIH0gOiB1bmRlZmluZWQpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gSWYgd2UncmUgbm90IG1ha2luZyBhbiBhc3luYyByZXF1ZXN0LCByZXR1cm4gdGhlIFwicmVzcG9uc2VKU09OXCJcbiAgICAgICAgICAgIC8vICBwcm9wZXJ0eSBmcm9tIG91ciBcImFwaVJlcXVlc3RcIiB2YXJpYWJsZS5cbiAgICAgICAgICAgIHJldHVybiAodXNlQXN5bmMgPT09IGZhbHNlID8gYXBpUmVxdWVzdC5yZXNwb25zZUpTT04gOiB1bmRlZmluZWQpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0U3Bpbm9mZnNGcm9tU2NyYXRjaHBhZChzY3JhdGNocGFkSWQsIGNhbGxiYWNrKVxuICAgICAgICAgKiBNYWtlcyBhIGNhbGwgdG8gdGhlIEtoYW4gQWNhZGVteSBDUyBBUEkgdG8gZmV0Y2ggdGhlIHNwaW5vZmZzIGZvciBhIHNjcmF0Y2hwYWQuXG4gICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzY3JhdGNocGFkSWQ6IFRoZSBTY3JhdGNocGFkIElEIG9mIHRoZSBzY3JhdGNocGFkIHRoYXQgd2UnZCBsaWtlIHRvIHJldHJpZXZlIHNwaW5vZmZzIGZyb20uXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrKjogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSBhZnRlciB0aGUgZGF0YSBoYXMgYmVlbiByZXRyaWV2ZWQuXG4gICAgICAgICAqIEByZXR1cm5zIHtKU09OfTogVGhlIEpTT04gZGF0YSByZXRyaWV2ZWQgZnJvbSB0aGUgQVBJXG4gICAgICAgICAqIEBOT1RFOiBJZiBhIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIG5vdCBwYXNzZWQgaW50byB0aGlzIGZ1bmN0aW9uLFxuICAgICAgICAgKiAgd2UnbGwgbWFrZSBhbiBzeW5jaHJvbm91cyByZXF1ZXN0IHRvIHRoZSBLaGFuIEFjYWRlbXkgQ1MgQVBJLCBhbmQgdGhlbiByZXR1cm4gYSBKU09OIG9iamVjdC5cbiAgICAgICAgICogSWYgYSBjYWxsYmFjayBmdW5jdGlvbiBpcyBwYXNzZWQgaW4sIHdlJ2xsbCBtYWtlIGFuIGFzeW5jaHJvbm91cyByZXF1ZXN0IHRvIHRoZSBLaGFuIEFjYWRlbXkgQ1MgQVBJLFxuICAgICAgICAgKiAgYW5kIHJldHVybiBub3RoaW5nLCBhbmQgaW52b2tlIHRoZSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IHdhcyBwYXNzZWQgaW4uXG4gICAgICAgICAqL1xuICAgICAgICBnZXRTcGlub2Zmc0Zyb21TY3JhdGNocGFkOiBmdW5jdGlvbihzY3JhdGNocGFkSWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBEZWNsYXJlIGEgYm9vbGVhbiB2YXJpYWJsZSB0aGF0J2xsIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXJcbiAgICAgICAgICAgIC8vICBvciBub3Qgd2UncmUgZ29pbmcgdG8gbWFrZSBhbiBhc3luYyByZXF1ZXN0LlxuICAgICAgICAgICAgdmFyIHVzZUFzeW5jID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vIElmIGEgY2FsbGJhY2sgZnVuY3Rpb24gaGFzIGJlZW4gcGFzc2VkIGluLCBzZXQgXCJ1c2VBc3luY1wiIHRvIHRydWUuXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT09IHVuZGVmaW5lZCAmJiAodHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgdXNlQXN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEZWNsYXJlIGEgc3RyaW5nIHZhcmlhYmxlIHRoYXQnbGwgaG9sZCB0aGUgQVBJIFVSTCB0aGF0IHdlJ2xsXG4gICAgICAgICAgICAvLyAgdXNlIHRvIGZldGNoIHRoZSBpbmZvcm1hdGlvbiBmb3IgdGhlIHNjcmF0Y2hwYWQgdGhhdCB3YXNcbiAgICAgICAgICAgIC8vICBzcGVjaWZpZWQuXG4gICAgICAgICAgICB2YXIgYXBpVXJsID0gdGhpcy51cmxzLnNwaW5vZmZzKHNjcmF0Y2hwYWRJZCk7XG5cbiAgICAgICAgICAgIC8vIERlY2xhcmUgYW4gb2JqZWN0IHZhcmlhYmxlIHRoYXQnbGwgYmUgcmV0dXJuZWQgaWYgd2UncmUgbm90XG4gICAgICAgICAgICAvLyAgcGVyZm9ybWluZyBhbiBhc3luYyByZXF1ZXN0LlxuICAgICAgICAgICAgdmFyIGFwaVJlcXVlc3QgPSAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBhcGlVcmwsXG4gICAgICAgICAgICAgICAgYXN5bmM6IHVzZUFzeW5jLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiAodXNlQXN5bmMgPT09IHRydWUgPyBmdW5jdGlvbihhcGlSZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhhcGlSZXNwb25zZS5yZXNwb25zZUpTT04pO1xuICAgICAgICAgICAgICAgIH0gOiB1bmRlZmluZWQpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gSWYgd2UncmUgbm90IG1ha2luZyBhbiBhc3luYyByZXF1ZXN0LCByZXR1cm4gdGhlIFwicmVzcG9uc2VKU09OXCJcbiAgICAgICAgICAgIC8vICBwcm9wZXJ0eSBmcm9tIG91ciBcImFwaVJlcXVlc3RcIiB2YXJpYWJsZS5cbiAgICAgICAgICAgIHJldHVybiAodXNlQXN5bmMgPT09IGZhbHNlID8gYXBpUmVxdWVzdC5yZXNwb25zZUpTT04gOiB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG4iXX0=
