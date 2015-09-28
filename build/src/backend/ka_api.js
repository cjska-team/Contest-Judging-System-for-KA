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
        }
    };
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcmMvS0EtQ29udGVzdC1KdWRnaW5nLVN5c3RlbS9zcmMvYmFja2VuZC9rYV9hcGkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxZQUFXOztBQUV6QixRQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTs7QUFFaEIsZUFBTztLQUNWOztBQUVELFdBQU87O0FBRUgsWUFBSSxFQUFFOztBQUVGLG1CQUFPLEVBQUUsTUFBTTtTQUNsQjs7QUFFRCxZQUFJLEVBQUU7O0FBRUYscUJBQVMsRUFBRSw0SUFBNEk7Ozs7Ozs7O0FBUXZKLG9CQUFRLEVBQUUsa0JBQVMsWUFBWSxFQUFFO0FBQzdCLHVCQUFPLDBIQUEwSCxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDeEs7Ozs7Ozs7O0FBUUQsMEJBQWMsRUFBRSx3QkFBUyxZQUFZLEVBQUU7QUFDbkMsdUJBQU8sK0RBQStELENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUNoSDtTQUNKO0FBQ0QseUJBQWlCLEVBQUUsMkJBQVMsWUFBWSxFQUFFLFFBQVEsRUFBRTs7O0FBR2hELGdCQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7OztBQUdyQixnQkFBSSxRQUFRLEtBQUssU0FBUyxJQUFLLE9BQU8sUUFBUSxLQUFLLFVBQVUsQUFBQyxFQUFFO0FBQzVELHdCQUFRLEdBQUcsSUFBSSxDQUFDO2FBQ25COzs7OztBQUtELGdCQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7OztBQUlwRCxnQkFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNwQixvQkFBSSxFQUFFLEtBQUs7QUFDWCxtQkFBRyxFQUFFLE1BQU07QUFDWCxxQkFBSyxFQUFFLFFBQVE7QUFDZix3QkFBUSxFQUFHLFFBQVEsS0FBSyxJQUFJLEdBQUcsVUFBUyxXQUFXLEVBQUU7QUFDakQsNEJBQVEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ3RDLEdBQUcsU0FBUyxBQUFDO2FBQ2pCLENBQUMsQ0FBQzs7OztBQUlILG1CQUFRLFFBQVEsS0FBSyxLQUFLLEdBQUcsVUFBVSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUU7U0FDckU7S0FDSixDQUFDO0NBQ0wsQ0FBQSxFQUFHLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgLy8gVGhpcyByZXF1aXJlcyBtb2R1bGUgcmVxdWVzdHMgalF1ZXJ5OyBpZiBqUXVlcnkgaXNuJ3QgZm91bmQuLi5cbiAgICBpZiAoIXdpbmRvdy5qUXVlcnkpIHtcbiAgICAgICAgLy8gLi4uZXhpdCB0aGUgZnVuY3Rpb24uXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBUaGUgXCJtaXNjXCIgcHJvcGVydHkgY29udGFpbnMgYW55IG1pc2NlbGxhbmVvdXMgcHJvcGVydGllcyB0aGF0IHdlIG1pZ2h0IG5lZWQgdGhyb3VnaG91dCB0aGlzIG1vZHVsZS5cbiAgICAgICAgbWlzYzoge1xuICAgICAgICAgICAgLy8gVGhlIFwiYWxsRGF0YVwiIHByb3BlcnR5IGlzIHVzZWQgd2hlbiB3ZSB3YW50IHRvIG1ha2UgcmVxdWVzdHMgdG8gdGhlIEFQSSwgYW5kIHdhbnQgdG8gcmV0dXJuIFwiYWxsXCIgb2YgdGhlIHBvc3NpYmxlIGRhdGEuXG4gICAgICAgICAgICBhbGxEYXRhOiA0MDAwMDBcbiAgICAgICAgfSxcbiAgICAgICAgLy8gVGhlIFwidXJsc1wiIHByb3BlcnR5IGNvbnRhaW5zIGFsbCBvZiB0aGUgQVBJIHVybHMgdGhhdCBhcmUgdXNlZCB0aHJvdWdob3V0IHRoaXMgbW9kdWxlLlxuICAgICAgICB1cmxzOiB7XG4gICAgICAgICAgICAvLyBUaGUgc3BvdGxpZ2h0IHNlY3Rpb24gb24gS2hhbiBBY2FkZW15LCBpcyB3aGVyZSB3ZSBnZXQgYWxsIG9mIHRoZSBjb250ZXN0cyBmcm9tLlxuICAgICAgICAgICAgc3BvdGxpZ2h0OiBcImh0dHBzOi8vd3d3LmtoYW5hY2FkZW15Lm9yZy9hcGkvaW50ZXJuYWwvc2NyYXRjaHBhZHMvdG9wP2Nhc2luZz1jYW1lbCZ0b3BpY19pZD14ZmZkZTdjMzEmc29ydD00JmxpbWl0PTQwMDAwJnBhZ2U9MCZsYW5nPWVuJl89MTQzNjU4MTMzMjg3OVwiLFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBLQV9BUEkudXJscy5zcGlub2ZmcyhzaWQpXG4gICAgICAgICAgICAgKiBCdWlsZHMgdXAsIGFuZCByZXR1cm5zIGFuIEFQSSBVUkwgdGhhdCBjYW4gYmUgdXNlZCB0byBmZXRjaCB0aGUgc3Bpbm9mZnMgZm9yIGEgc2NyYXRjaHBhZC5cbiAgICAgICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gc2NyYXRjaHBhZElEOiBUaGUgS2hhbiBBY2FkZW15IHNjcmF0Y2hwYWQgSUQgb2YgdGhlIHByb2dyYW0gdGhhdCB3ZSB3YW50IHRvIGxvYWQgdGhlIHNwaW5vZmZzIGZyb20uXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBhcGlVcmw6IFRoZSBBUEkgVVJMIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmV0Y2ggdGhlIHNwaW5vZmZzIGZvciB0aGUgZGVzaXJlZCBzY3JhdGNocGFkLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzcGlub2ZmczogZnVuY3Rpb24oc2NyYXRjaHBhZElEKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6Ly93d3cua2hhbmFjYWRlbXkub3JnL2FwaS9pbnRlcm5hbC9zY3JhdGNocGFkcy97UFJPR1JBTX0vdG9wLWZvcmtzP2Nhc2luZz1jYW1lbCZzb3J0PTImbGltaXQ9MzAwMDAwJnBhZ2U9MCZsYW5nPWVuXCIucmVwbGFjZShcIntQUk9HUkFNfVwiLCBzY3JhdGNocGFkSUQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogS0FfQVBJLnVybHMuc2NyYXRjaHBhZEluZm8oc2lkKVxuICAgICAgICAgICAgICogQnVpbGRzIHVwLCBhbmQgcmV0dXJucyBhbiBBUEkgVVJMIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmV0Y2ggdGhlIGRhdGEgZnJvbSBhIHNjcmF0Y2hwYWQuXG4gICAgICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHNjcmF0Y2hwYWRJRDogVGhlIEtoYW4gQWNhZGVteSBzY3JhdGNocGFkIElEIG9mIHRoZSBwcm9ncmFtIHRoYXQgd2Ugd2FudCB0byBsb2FkIHRoZSBzY3JhdGNocGFkIGRhdGEgZnJvbS5cbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IGFwaVVybDogVGhlIEFQSSBVUkwgdGhhdCBjYW4gYmUgdXNlZCB0byBmZXRjaCB0aGUgc2NyYXRjaHBhZCBkYXRhIGZvciB0aGUgZGVzaXJlZCBwcm9ncmFtLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzY3JhdGNocGFkSW5mbzogZnVuY3Rpb24oc2NyYXRjaHBhZElEKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6Ly93d3cua2hhbmFjYWRlbXkub3JnL2FwaS9sYWJzL3NjcmF0Y2hwYWRzL3tTQ1JBVENIUEFEfVwiLnJlcGxhY2UoXCJ7U0NSQVRDSFBBRH1cIiwgc2NyYXRjaHBhZElEKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ2V0U2NyYXRjaHBhZEluZm86IGZ1bmN0aW9uKHNjcmF0Y2hwYWRJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIERlY2xhcmUgYSBib29sZWFuIHZhcmlhYmxlIHRoYXQnbGwgYmUgdXNlZCB0byBkZXRlcm1pbmUgd2hldGhlclxuICAgICAgICAgICAgLy8gIG9yIG5vdCB3ZSdyZSBnb2luZyB0byBtYWtlIGFuIGFzeW5jIHJlcXVlc3QuXG4gICAgICAgICAgICB2YXIgdXNlQXN5bmMgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gSWYgYSBjYWxsYmFjayBmdW5jdGlvbiBoYXMgYmVlbiBwYXNzZWQgaW4sIHNldCBcInVzZUFzeW5jXCIgdG8gdHJ1ZS5cbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPT0gdW5kZWZpbmVkICYmICh0eXBlb2YgY2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICB1c2VBc3luYyA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERlY2xhcmUgYSBzdHJpbmcgdmFyaWFibGUgdGhhdCdsbCBob2xkIHRoZSBBUEkgVVJMIHRoYXQgd2UnbGxcbiAgICAgICAgICAgIC8vICB1c2UgdG8gZmV0Y2ggdGhlIGluZm9ybWF0aW9uIGZvciB0aGUgc2NyYXRjaHBhZCB0aGF0IHdhc1xuICAgICAgICAgICAgLy8gIHNwZWNpZmllZC5cbiAgICAgICAgICAgIHZhciBhcGlVcmwgPSB0aGlzLnVybHMuc2NyYXRjaHBhZEluZm8oc2NyYXRjaHBhZElkKTtcblxuICAgICAgICAgICAgLy8gRGVjbGFyZSBhbiBvYmplY3QgdmFyaWFibGUgdGhhdCdsbCBiZSByZXR1cm5lZCBpZiB3ZSdyZSBub3RcbiAgICAgICAgICAgIC8vICBwZXJmb3JtaW5nIGFuIGFzeW5jIHJlcXVlc3QuXG4gICAgICAgICAgICB2YXIgYXBpUmVxdWVzdCA9ICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgICAgICB1cmw6IGFwaVVybCxcbiAgICAgICAgICAgICAgICBhc3luYzogdXNlQXN5bmMsXG4gICAgICAgICAgICAgICAgY29tcGxldGU6ICh1c2VBc3luYyA9PT0gdHJ1ZSA/IGZ1bmN0aW9uKGFwaVJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGFwaVJlc3BvbnNlLnJlc3BvbnNlSlNPTik7XG4gICAgICAgICAgICAgICAgfSA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSdyZSBub3QgbWFraW5nIGFuIGFzeW5jIHJlcXVlc3QsIHJldHVybiB0aGUgXCJyZXNwb25zZUpTT05cIlxuICAgICAgICAgICAgLy8gIHByb3BlcnR5IGZyb20gb3VyIFwiYXBpUmVxdWVzdFwiIHZhcmlhYmxlLlxuICAgICAgICAgICAgcmV0dXJuICh1c2VBc3luYyA9PT0gZmFsc2UgPyBhcGlSZXF1ZXN0LnJlc3BvbnNlSlNPTiA6IHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcbiJdfQ==
