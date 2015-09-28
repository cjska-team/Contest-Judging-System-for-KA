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
                    callback(apiResponse);
                } : undefined
            });

            // If we're not making an async request, return the "responseJSON"
            //  property from our "apiRequest" variable.
            return useAsync === false ? apiRequest.responseJSON : undefined;
        },
        test: 1
    };
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcmMvS0EtQ29udGVzdC1KdWRnaW5nLVN5c3RlbS9zcmMvYmFja2VuZC9rYV9hcGkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxZQUFXOztBQUV6QixRQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTs7QUFFaEIsZUFBTztLQUNWOztBQUVELFdBQU87O0FBRUgsWUFBSSxFQUFFOztBQUVGLG1CQUFPLEVBQUUsTUFBTTtTQUNsQjs7QUFFRCxZQUFJLEVBQUU7O0FBRUYscUJBQVMsRUFBRSw0SUFBNEk7Ozs7Ozs7O0FBUXZKLG9CQUFRLEVBQUUsa0JBQVMsWUFBWSxFQUFFO0FBQzdCLHVCQUFPLDBIQUEwSCxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDeEs7Ozs7Ozs7O0FBUUQsMEJBQWMsRUFBRSx3QkFBUyxZQUFZLEVBQUU7QUFDbkMsdUJBQU8sK0RBQStELENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUNoSDtTQUNKO0FBQ0QseUJBQWlCLEVBQUUsMkJBQVMsWUFBWSxFQUFFLFFBQVEsRUFBRTs7O0FBR2hELGdCQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7OztBQUdyQixnQkFBSSxRQUFRLEtBQUssU0FBUyxJQUFLLE9BQU8sUUFBUSxLQUFLLFVBQVUsQUFBQyxFQUFFO0FBQzVELHdCQUFRLEdBQUcsSUFBSSxDQUFDO2FBQ25COzs7OztBQUtELGdCQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7OztBQUlwRCxnQkFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNwQixvQkFBSSxFQUFFLEtBQUs7QUFDWCxtQkFBRyxFQUFFLE1BQU07QUFDWCxxQkFBSyxFQUFFLFFBQVE7QUFDZix3QkFBUSxFQUFHLFFBQVEsS0FBSyxJQUFJLEdBQUcsVUFBUyxXQUFXLEVBQUU7QUFDakQsNEJBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDekIsR0FBRyxTQUFTLEFBQUM7YUFDakIsQ0FBQyxDQUFDOzs7O0FBSUgsbUJBQVEsUUFBUSxLQUFLLEtBQUssR0FBRyxVQUFVLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBRTtTQUNyRTtBQUNELFlBQUksRUFBRSxDQUFDO0tBQ1YsQ0FBQztDQUNMLENBQUEsRUFBRyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICAgIC8vIFRoaXMgcmVxdWlyZXMgbW9kdWxlIHJlcXVlc3RzIGpRdWVyeTsgaWYgalF1ZXJ5IGlzbid0IGZvdW5kLi4uXG4gICAgaWYgKCF3aW5kb3cualF1ZXJ5KSB7XG4gICAgICAgIC8vIC4uLmV4aXQgdGhlIGZ1bmN0aW9uLlxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gVGhlIFwibWlzY1wiIHByb3BlcnR5IGNvbnRhaW5zIGFueSBtaXNjZWxsYW5lb3VzIHByb3BlcnRpZXMgdGhhdCB3ZSBtaWdodCBuZWVkIHRocm91Z2hvdXQgdGhpcyBtb2R1bGUuXG4gICAgICAgIG1pc2M6IHtcbiAgICAgICAgICAgIC8vIFRoZSBcImFsbERhdGFcIiBwcm9wZXJ0eSBpcyB1c2VkIHdoZW4gd2Ugd2FudCB0byBtYWtlIHJlcXVlc3RzIHRvIHRoZSBBUEksIGFuZCB3YW50IHRvIHJldHVybiBcImFsbFwiIG9mIHRoZSBwb3NzaWJsZSBkYXRhLlxuICAgICAgICAgICAgYWxsRGF0YTogNDAwMDAwXG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRoZSBcInVybHNcIiBwcm9wZXJ0eSBjb250YWlucyBhbGwgb2YgdGhlIEFQSSB1cmxzIHRoYXQgYXJlIHVzZWQgdGhyb3VnaG91dCB0aGlzIG1vZHVsZS5cbiAgICAgICAgdXJsczoge1xuICAgICAgICAgICAgLy8gVGhlIHNwb3RsaWdodCBzZWN0aW9uIG9uIEtoYW4gQWNhZGVteSwgaXMgd2hlcmUgd2UgZ2V0IGFsbCBvZiB0aGUgY29udGVzdHMgZnJvbS5cbiAgICAgICAgICAgIHNwb3RsaWdodDogXCJodHRwczovL3d3dy5raGFuYWNhZGVteS5vcmcvYXBpL2ludGVybmFsL3NjcmF0Y2hwYWRzL3RvcD9jYXNpbmc9Y2FtZWwmdG9waWNfaWQ9eGZmZGU3YzMxJnNvcnQ9NCZsaW1pdD00MDAwMCZwYWdlPTAmbGFuZz1lbiZfPTE0MzY1ODEzMzI4NzlcIixcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogS0FfQVBJLnVybHMuc3Bpbm9mZnMoc2lkKVxuICAgICAgICAgICAgICogQnVpbGRzIHVwLCBhbmQgcmV0dXJucyBhbiBBUEkgVVJMIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmV0Y2ggdGhlIHNwaW5vZmZzIGZvciBhIHNjcmF0Y2hwYWQuXG4gICAgICAgICAgICAgKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxuICAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHNjcmF0Y2hwYWRJRDogVGhlIEtoYW4gQWNhZGVteSBzY3JhdGNocGFkIElEIG9mIHRoZSBwcm9ncmFtIHRoYXQgd2Ugd2FudCB0byBsb2FkIHRoZSBzcGlub2ZmcyBmcm9tLlxuICAgICAgICAgICAgICogQHJldHVybnMge1N0cmluZ30gYXBpVXJsOiBUaGUgQVBJIFVSTCB0aGF0IGNhbiBiZSB1c2VkIHRvIGZldGNoIHRoZSBzcGlub2ZmcyBmb3IgdGhlIGRlc2lyZWQgc2NyYXRjaHBhZC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc3Bpbm9mZnM6IGZ1bmN0aW9uKHNjcmF0Y2hwYWRJRCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi8vd3d3LmtoYW5hY2FkZW15Lm9yZy9hcGkvaW50ZXJuYWwvc2NyYXRjaHBhZHMve1BST0dSQU19L3RvcC1mb3Jrcz9jYXNpbmc9Y2FtZWwmc29ydD0yJmxpbWl0PTMwMDAwMCZwYWdlPTAmbGFuZz1lblwiLnJlcGxhY2UoXCJ7UFJPR1JBTX1cIiwgc2NyYXRjaHBhZElEKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEtBX0FQSS51cmxzLnNjcmF0Y2hwYWRJbmZvKHNpZClcbiAgICAgICAgICAgICAqIEJ1aWxkcyB1cCwgYW5kIHJldHVybnMgYW4gQVBJIFVSTCB0aGF0IGNhbiBiZSB1c2VkIHRvIGZldGNoIHRoZSBkYXRhIGZyb20gYSBzY3JhdGNocGFkLlxuICAgICAgICAgICAgICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcbiAgICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzY3JhdGNocGFkSUQ6IFRoZSBLaGFuIEFjYWRlbXkgc2NyYXRjaHBhZCBJRCBvZiB0aGUgcHJvZ3JhbSB0aGF0IHdlIHdhbnQgdG8gbG9hZCB0aGUgc2NyYXRjaHBhZCBkYXRhIGZyb20uXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBhcGlVcmw6IFRoZSBBUEkgVVJMIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmV0Y2ggdGhlIHNjcmF0Y2hwYWQgZGF0YSBmb3IgdGhlIGRlc2lyZWQgcHJvZ3JhbS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2NyYXRjaHBhZEluZm86IGZ1bmN0aW9uKHNjcmF0Y2hwYWRJRCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi8vd3d3LmtoYW5hY2FkZW15Lm9yZy9hcGkvbGFicy9zY3JhdGNocGFkcy97U0NSQVRDSFBBRH1cIi5yZXBsYWNlKFwie1NDUkFUQ0hQQUR9XCIsIHNjcmF0Y2hwYWRJRCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGdldFNjcmF0Y2hwYWRJbmZvOiBmdW5jdGlvbihzY3JhdGNocGFkSWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBEZWNsYXJlIGEgYm9vbGVhbiB2YXJpYWJsZSB0aGF0J2xsIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXJcbiAgICAgICAgICAgIC8vICBvciBub3Qgd2UncmUgZ29pbmcgdG8gbWFrZSBhbiBhc3luYyByZXF1ZXN0LlxuICAgICAgICAgICAgdmFyIHVzZUFzeW5jID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vIElmIGEgY2FsbGJhY2sgZnVuY3Rpb24gaGFzIGJlZW4gcGFzc2VkIGluLCBzZXQgXCJ1c2VBc3luY1wiIHRvIHRydWUuXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT09IHVuZGVmaW5lZCAmJiAodHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgdXNlQXN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEZWNsYXJlIGEgc3RyaW5nIHZhcmlhYmxlIHRoYXQnbGwgaG9sZCB0aGUgQVBJIFVSTCB0aGF0IHdlJ2xsXG4gICAgICAgICAgICAvLyAgdXNlIHRvIGZldGNoIHRoZSBpbmZvcm1hdGlvbiBmb3IgdGhlIHNjcmF0Y2hwYWQgdGhhdCB3YXNcbiAgICAgICAgICAgIC8vICBzcGVjaWZpZWQuXG4gICAgICAgICAgICB2YXIgYXBpVXJsID0gdGhpcy51cmxzLnNjcmF0Y2hwYWRJbmZvKHNjcmF0Y2hwYWRJZCk7XG5cbiAgICAgICAgICAgIC8vIERlY2xhcmUgYW4gb2JqZWN0IHZhcmlhYmxlIHRoYXQnbGwgYmUgcmV0dXJuZWQgaWYgd2UncmUgbm90XG4gICAgICAgICAgICAvLyAgcGVyZm9ybWluZyBhbiBhc3luYyByZXF1ZXN0LlxuICAgICAgICAgICAgdmFyIGFwaVJlcXVlc3QgPSAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBhcGlVcmwsXG4gICAgICAgICAgICAgICAgYXN5bmM6IHVzZUFzeW5jLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiAodXNlQXN5bmMgPT09IHRydWUgPyBmdW5jdGlvbihhcGlSZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhhcGlSZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSdyZSBub3QgbWFraW5nIGFuIGFzeW5jIHJlcXVlc3QsIHJldHVybiB0aGUgXCJyZXNwb25zZUpTT05cIlxuICAgICAgICAgICAgLy8gIHByb3BlcnR5IGZyb20gb3VyIFwiYXBpUmVxdWVzdFwiIHZhcmlhYmxlLlxuICAgICAgICAgICAgcmV0dXJuICh1c2VBc3luYyA9PT0gZmFsc2UgPyBhcGlSZXF1ZXN0LnJlc3BvbnNlSlNPTiA6IHVuZGVmaW5lZCk7XG4gICAgICAgIH0sXG4gICAgICAgIHRlc3Q6IDFcbiAgICB9O1xufSkoKTtcbiJdfQ==
