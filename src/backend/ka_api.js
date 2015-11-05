module.exports = (function() {
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
            spinoffs: function(scratchpadID) {
                return "https://www.khanacademy.org/api/internal/scratchpads/{PROGRAM}/top-forks?casing=camel&sort=2&limit=300000&page=0&lang=en".replace("{PROGRAM}", scratchpadID);
            },
            /**
             * KA_API.urls.scratchpadInfo(sid)
             * Builds up, and returns an API URL that can be used to fetch the data from a scratchpad.
             * @author Gigabyte Giant (2015)
             * @param {String} scratchpadID: The Khan Academy scratchpad ID of the program that we want to load the scratchpad data from.
             * @returns {String} apiUrl: The API URL that can be used to fetch the scratchpad data for the desired program.
             */
            scratchpadInfo: function(scratchpadID) {
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
        getScratchpadInfo: function(scratchpadId, callback) {
            // Declare a boolean variable that'll be used to determine whether
            //  or not we're going to make an async request.
            var useAsync = false;

            // If a callback function has been passed in, set "useAsync" to true.
            if (callback !== undefined && (typeof callback === "function")) {
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
                complete: (useAsync === true ? function(apiResponse) {
                    callback(apiResponse.responseJSON);
                } : undefined)
            });

            // If we're not making an async request, return the "responseJSON"
            //  property from our "apiRequest" variable.
            return (useAsync === false ? apiRequest.responseJSON : undefined);
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
        getSpinoffsFromScratchpad: function(scratchpadId, callback) {
            // Declare a boolean variable that'll be used to determine whether
            //  or not we're going to make an async request.
            var useAsync = false;

            // If a callback function has been passed in, set "useAsync" to true.
            if (callback !== undefined && (typeof callback === "function")) {
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
                complete: (useAsync === true ? function(apiResponse) {
                    callback(apiResponse.responseJSON);
                } : undefined)
            });

            // If we're not making an async request, return the "responseJSON"
            //  property from our "apiRequest" variable.
            return (useAsync === false ? apiRequest.responseJSON : undefined);
        }
    };
})();
