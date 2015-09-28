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

},{}],2:[function(require,module,exports){
"use strict";

var KA_API = require("../backend/ka_api.js");

var createContestHolder = function createContestHolder(contestData) {
    // Begin Column Root
    var contestHolder = $("<div>").addClass("col").addClass("s12").addClass("m6").append(
    // Begin Card Root
    $("<div>").addClass("card")
    // Begin Card Image
    .append($("<div>").addClass("card-image").append($("<img>").attr("src", "http://newlitfromeurope.org/wp-content/uploads/2015/05/placeholder1.gif")).append($("<span>").addClass("card-title").addClass("amber").addClass("lighten-2").text("Contest: Some contest")))
    // End Card Image
    // Begin Card Content
    .append($("<div>").addClass("card-content").append($("<p>").text("This is the description for some contest...")))
    // End Card Content
    // Begin Card Action
    .append($("<div>").addClass("card-action").addClass("center").append($("<a>").attr("href", "javascript:void(0)").text("All Entries")).append($("<a>").attr("href", "javascript:void(0)").text("Leaderboard")))
    // End Card Action
    // End Card Root
    );
    // End Column Root

    return contestHolder;
};

var setupPage = function setupPage() {
    for (var i = 0; i < 7; i++) {
        $(".row").append(createContestHolder({}));
    }
};

setupPage();

},{"../backend/ka_api.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcmMvS0EtQ29udGVzdC1KdWRnaW5nLVN5c3RlbS9zcmMvYmFja2VuZC9rYV9hcGkuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcmMvS0EtQ29udGVzdC1KdWRnaW5nLVN5c3RlbS9zcmMvY2xpZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsWUFBVzs7QUFFekIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7O0FBRWhCLGVBQU87S0FDVjs7QUFFRCxXQUFPOztBQUVILFlBQUksRUFBRTs7QUFFRixtQkFBTyxFQUFFLE1BQU07U0FDbEI7O0FBRUQsWUFBSSxFQUFFOztBQUVGLHFCQUFTLEVBQUUsNElBQTRJOzs7Ozs7OztBQVF2SixvQkFBUSxFQUFFLGtCQUFTLFlBQVksRUFBRTtBQUM3Qix1QkFBTywwSEFBMEgsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO2FBQ3hLOzs7Ozs7OztBQVFELDBCQUFjLEVBQUUsd0JBQVMsWUFBWSxFQUFFO0FBQ25DLHVCQUFPLCtEQUErRCxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDaEg7U0FDSjtBQUNELHlCQUFpQixFQUFFLDJCQUFTLFlBQVksRUFBRSxRQUFRLEVBQUU7OztBQUdoRCxnQkFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDOzs7QUFHckIsZ0JBQUksUUFBUSxLQUFLLFNBQVMsSUFBSyxPQUFPLFFBQVEsS0FBSyxVQUFVLEFBQUMsRUFBRTtBQUM1RCx3QkFBUSxHQUFHLElBQUksQ0FBQzthQUNuQjs7Ozs7QUFLRCxnQkFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7Ozs7QUFJcEQsZ0JBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDcEIsb0JBQUksRUFBRSxLQUFLO0FBQ1gsbUJBQUcsRUFBRSxNQUFNO0FBQ1gscUJBQUssRUFBRSxRQUFRO0FBQ2Ysd0JBQVEsRUFBRyxRQUFRLEtBQUssSUFBSSxHQUFHLFVBQVMsV0FBVyxFQUFFO0FBQ2pELDRCQUFRLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO2lCQUN0QyxHQUFHLFNBQVMsQUFBQzthQUNqQixDQUFDLENBQUM7Ozs7QUFJSCxtQkFBUSxRQUFRLEtBQUssS0FBSyxHQUFHLFVBQVUsQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFFO1NBQ3JFO0tBQ0osQ0FBQztDQUNMLENBQUEsRUFBRyxDQUFDOzs7OztBQ3JFTCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs7QUFFN0MsSUFBSSxtQkFBbUIsR0FBRyxTQUF0QixtQkFBbUIsQ0FBWSxXQUFXLEVBQUU7O0FBRTVDLFFBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FDekIsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQzlDLE1BQU07O0FBRUgsS0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7O0tBRXRCLE1BQU0sQ0FDSCxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUM1QixNQUFNLENBQ0gsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUseUVBQXlFLENBQUMsQ0FDcEcsQ0FDQSxNQUFNLENBQ0gsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUNyRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FDckMsQ0FDUjs7O0tBR0EsTUFBTSxDQUNILENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQzlCLE1BQU0sQ0FDSCxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxDQUFDLENBQy9ELENBQ1I7OztLQUdBLE1BQU0sQ0FDSCxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FDaEQsTUFBTSxDQUNILENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLG9CQUFvQixDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUNsRSxDQUNBLE1BQU0sQ0FDSCxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FDbEUsQ0FDUjs7O0tBR1IsQ0FBQTs7O0FBR0wsV0FBTyxhQUFhLENBQUM7Q0FDeEIsQ0FBQzs7QUFFRixJQUFJLFNBQVMsR0FBRyxTQUFaLFNBQVMsR0FBYztBQUN2QixTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3hCLFNBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUM3QztDQUNKLENBQUM7O0FBRUYsU0FBUyxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgLy8gVGhpcyByZXF1aXJlcyBtb2R1bGUgcmVxdWVzdHMgalF1ZXJ5OyBpZiBqUXVlcnkgaXNuJ3QgZm91bmQuLi5cbiAgICBpZiAoIXdpbmRvdy5qUXVlcnkpIHtcbiAgICAgICAgLy8gLi4uZXhpdCB0aGUgZnVuY3Rpb24uXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBUaGUgXCJtaXNjXCIgcHJvcGVydHkgY29udGFpbnMgYW55IG1pc2NlbGxhbmVvdXMgcHJvcGVydGllcyB0aGF0IHdlIG1pZ2h0IG5lZWQgdGhyb3VnaG91dCB0aGlzIG1vZHVsZS5cbiAgICAgICAgbWlzYzoge1xuICAgICAgICAgICAgLy8gVGhlIFwiYWxsRGF0YVwiIHByb3BlcnR5IGlzIHVzZWQgd2hlbiB3ZSB3YW50IHRvIG1ha2UgcmVxdWVzdHMgdG8gdGhlIEFQSSwgYW5kIHdhbnQgdG8gcmV0dXJuIFwiYWxsXCIgb2YgdGhlIHBvc3NpYmxlIGRhdGEuXG4gICAgICAgICAgICBhbGxEYXRhOiA0MDAwMDBcbiAgICAgICAgfSxcbiAgICAgICAgLy8gVGhlIFwidXJsc1wiIHByb3BlcnR5IGNvbnRhaW5zIGFsbCBvZiB0aGUgQVBJIHVybHMgdGhhdCBhcmUgdXNlZCB0aHJvdWdob3V0IHRoaXMgbW9kdWxlLlxuICAgICAgICB1cmxzOiB7XG4gICAgICAgICAgICAvLyBUaGUgc3BvdGxpZ2h0IHNlY3Rpb24gb24gS2hhbiBBY2FkZW15LCBpcyB3aGVyZSB3ZSBnZXQgYWxsIG9mIHRoZSBjb250ZXN0cyBmcm9tLlxuICAgICAgICAgICAgc3BvdGxpZ2h0OiBcImh0dHBzOi8vd3d3LmtoYW5hY2FkZW15Lm9yZy9hcGkvaW50ZXJuYWwvc2NyYXRjaHBhZHMvdG9wP2Nhc2luZz1jYW1lbCZ0b3BpY19pZD14ZmZkZTdjMzEmc29ydD00JmxpbWl0PTQwMDAwJnBhZ2U9MCZsYW5nPWVuJl89MTQzNjU4MTMzMjg3OVwiLFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBLQV9BUEkudXJscy5zcGlub2ZmcyhzaWQpXG4gICAgICAgICAgICAgKiBCdWlsZHMgdXAsIGFuZCByZXR1cm5zIGFuIEFQSSBVUkwgdGhhdCBjYW4gYmUgdXNlZCB0byBmZXRjaCB0aGUgc3Bpbm9mZnMgZm9yIGEgc2NyYXRjaHBhZC5cbiAgICAgICAgICAgICAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXG4gICAgICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gc2NyYXRjaHBhZElEOiBUaGUgS2hhbiBBY2FkZW15IHNjcmF0Y2hwYWQgSUQgb2YgdGhlIHByb2dyYW0gdGhhdCB3ZSB3YW50IHRvIGxvYWQgdGhlIHNwaW5vZmZzIGZyb20uXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBhcGlVcmw6IFRoZSBBUEkgVVJMIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmV0Y2ggdGhlIHNwaW5vZmZzIGZvciB0aGUgZGVzaXJlZCBzY3JhdGNocGFkLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzcGlub2ZmczogZnVuY3Rpb24oc2NyYXRjaHBhZElEKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6Ly93d3cua2hhbmFjYWRlbXkub3JnL2FwaS9pbnRlcm5hbC9zY3JhdGNocGFkcy97UFJPR1JBTX0vdG9wLWZvcmtzP2Nhc2luZz1jYW1lbCZzb3J0PTImbGltaXQ9MzAwMDAwJnBhZ2U9MCZsYW5nPWVuXCIucmVwbGFjZShcIntQUk9HUkFNfVwiLCBzY3JhdGNocGFkSUQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogS0FfQVBJLnVybHMuc2NyYXRjaHBhZEluZm8oc2lkKVxuICAgICAgICAgICAgICogQnVpbGRzIHVwLCBhbmQgcmV0dXJucyBhbiBBUEkgVVJMIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmV0Y2ggdGhlIGRhdGEgZnJvbSBhIHNjcmF0Y2hwYWQuXG4gICAgICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHNjcmF0Y2hwYWRJRDogVGhlIEtoYW4gQWNhZGVteSBzY3JhdGNocGFkIElEIG9mIHRoZSBwcm9ncmFtIHRoYXQgd2Ugd2FudCB0byBsb2FkIHRoZSBzY3JhdGNocGFkIGRhdGEgZnJvbS5cbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IGFwaVVybDogVGhlIEFQSSBVUkwgdGhhdCBjYW4gYmUgdXNlZCB0byBmZXRjaCB0aGUgc2NyYXRjaHBhZCBkYXRhIGZvciB0aGUgZGVzaXJlZCBwcm9ncmFtLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzY3JhdGNocGFkSW5mbzogZnVuY3Rpb24oc2NyYXRjaHBhZElEKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6Ly93d3cua2hhbmFjYWRlbXkub3JnL2FwaS9sYWJzL3NjcmF0Y2hwYWRzL3tTQ1JBVENIUEFEfVwiLnJlcGxhY2UoXCJ7U0NSQVRDSFBBRH1cIiwgc2NyYXRjaHBhZElEKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ2V0U2NyYXRjaHBhZEluZm86IGZ1bmN0aW9uKHNjcmF0Y2hwYWRJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIERlY2xhcmUgYSBib29sZWFuIHZhcmlhYmxlIHRoYXQnbGwgYmUgdXNlZCB0byBkZXRlcm1pbmUgd2hldGhlclxuICAgICAgICAgICAgLy8gIG9yIG5vdCB3ZSdyZSBnb2luZyB0byBtYWtlIGFuIGFzeW5jIHJlcXVlc3QuXG4gICAgICAgICAgICB2YXIgdXNlQXN5bmMgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gSWYgYSBjYWxsYmFjayBmdW5jdGlvbiBoYXMgYmVlbiBwYXNzZWQgaW4sIHNldCBcInVzZUFzeW5jXCIgdG8gdHJ1ZS5cbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPT0gdW5kZWZpbmVkICYmICh0eXBlb2YgY2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICB1c2VBc3luYyA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERlY2xhcmUgYSBzdHJpbmcgdmFyaWFibGUgdGhhdCdsbCBob2xkIHRoZSBBUEkgVVJMIHRoYXQgd2UnbGxcbiAgICAgICAgICAgIC8vICB1c2UgdG8gZmV0Y2ggdGhlIGluZm9ybWF0aW9uIGZvciB0aGUgc2NyYXRjaHBhZCB0aGF0IHdhc1xuICAgICAgICAgICAgLy8gIHNwZWNpZmllZC5cbiAgICAgICAgICAgIHZhciBhcGlVcmwgPSB0aGlzLnVybHMuc2NyYXRjaHBhZEluZm8oc2NyYXRjaHBhZElkKTtcblxuICAgICAgICAgICAgLy8gRGVjbGFyZSBhbiBvYmplY3QgdmFyaWFibGUgdGhhdCdsbCBiZSByZXR1cm5lZCBpZiB3ZSdyZSBub3RcbiAgICAgICAgICAgIC8vICBwZXJmb3JtaW5nIGFuIGFzeW5jIHJlcXVlc3QuXG4gICAgICAgICAgICB2YXIgYXBpUmVxdWVzdCA9ICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgICAgICB1cmw6IGFwaVVybCxcbiAgICAgICAgICAgICAgICBhc3luYzogdXNlQXN5bmMsXG4gICAgICAgICAgICAgICAgY29tcGxldGU6ICh1c2VBc3luYyA9PT0gdHJ1ZSA/IGZ1bmN0aW9uKGFwaVJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGFwaVJlc3BvbnNlLnJlc3BvbnNlSlNPTik7XG4gICAgICAgICAgICAgICAgfSA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSdyZSBub3QgbWFraW5nIGFuIGFzeW5jIHJlcXVlc3QsIHJldHVybiB0aGUgXCJyZXNwb25zZUpTT05cIlxuICAgICAgICAgICAgLy8gIHByb3BlcnR5IGZyb20gb3VyIFwiYXBpUmVxdWVzdFwiIHZhcmlhYmxlLlxuICAgICAgICAgICAgcmV0dXJuICh1c2VBc3luYyA9PT0gZmFsc2UgPyBhcGlSZXF1ZXN0LnJlc3BvbnNlSlNPTiA6IHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcbiIsInZhciBLQV9BUEkgPSByZXF1aXJlKFwiLi4vYmFja2VuZC9rYV9hcGkuanNcIik7XG5cbnZhciBjcmVhdGVDb250ZXN0SG9sZGVyID0gZnVuY3Rpb24oY29udGVzdERhdGEpIHtcbiAgICAvLyBCZWdpbiBDb2x1bW4gUm9vdFxuICAgIHZhciBjb250ZXN0SG9sZGVyID0gJChcIjxkaXY+XCIpXG4gICAgICAgIC5hZGRDbGFzcyhcImNvbFwiKS5hZGRDbGFzcyhcInMxMlwiKS5hZGRDbGFzcyhcIm02XCIpXG4gICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAvLyBCZWdpbiBDYXJkIFJvb3RcbiAgICAgICAgICAgICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcImNhcmRcIilcbiAgICAgICAgICAgICAgICAvLyBCZWdpbiBDYXJkIEltYWdlXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiY2FyZC1pbWFnZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiPGltZz5cIikuYXR0cihcInNyY1wiLCBcImh0dHA6Ly9uZXdsaXRmcm9tZXVyb3BlLm9yZy93cC1jb250ZW50L3VwbG9hZHMvMjAxNS8wNS9wbGFjZWhvbGRlcjEuZ2lmXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoXCI8c3Bhbj5cIikuYWRkQ2xhc3MoXCJjYXJkLXRpdGxlXCIpLmFkZENsYXNzKFwiYW1iZXJcIikuYWRkQ2xhc3MoXCJsaWdodGVuLTJcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoXCJDb250ZXN0OiBTb21lIGNvbnRlc3RcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLy8gRW5kIENhcmQgSW1hZ2VcbiAgICAgICAgICAgICAgICAvLyBCZWdpbiBDYXJkIENvbnRlbnRcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgICAgICAgICAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJjYXJkLWNvbnRlbnRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcIjxwPlwiKS50ZXh0KFwiVGhpcyBpcyB0aGUgZGVzY3JpcHRpb24gZm9yIHNvbWUgY29udGVzdC4uLlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAvLyBFbmQgQ2FyZCBDb250ZW50XG4gICAgICAgICAgICAgICAgLy8gQmVnaW4gQ2FyZCBBY3Rpb25cbiAgICAgICAgICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICAgICAgICAgICAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJjYXJkLWFjdGlvblwiKS5hZGRDbGFzcyhcImNlbnRlclwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiPGE+XCIpLmF0dHIoXCJocmVmXCIsIFwiamF2YXNjcmlwdDp2b2lkKDApXCIpLnRleHQoXCJBbGwgRW50cmllc1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiPGE+XCIpLmF0dHIoXCJocmVmXCIsIFwiamF2YXNjcmlwdDp2b2lkKDApXCIpLnRleHQoXCJMZWFkZXJib2FyZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAvLyBFbmQgQ2FyZCBBY3Rpb25cbiAgICAgICAgICAgIC8vIEVuZCBDYXJkIFJvb3RcbiAgICAgICAgKVxuICAgIC8vIEVuZCBDb2x1bW4gUm9vdFxuXG4gICAgcmV0dXJuIGNvbnRlc3RIb2xkZXI7XG59O1xuXG52YXIgc2V0dXBQYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspIHtcbiAgICAgICAgJChcIi5yb3dcIikuYXBwZW5kKGNyZWF0ZUNvbnRlc3RIb2xkZXIoe30pKTtcbiAgICB9XG59O1xuXG5zZXR1cFBhZ2UoKTtcbiJdfQ==
