(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = (function () {
    /* An array of the keys that NEED to exist on the window object for our code to function
       properly. Do it this way so that if there IS a missing dependency we can just open up
       the console and instantly see what we're missing */
    var deps = ["jQuery", "Firebase"];
    var hasAllDeps = true;
    for (var i = 0; i < deps.length; i++) {
        if (!window[deps[i]]) {
            console.error("Missing dependency \"" + deps[i] + "\"");
            hasAllDeps = false;
        }
    }
    if (!hasAllDeps) {
        return;
    }

    var firebaseRef = new Firebase("https://contest-judging-sys.firebaseio.com");

    var CJSystem = {};

    CJSystem.contests = function (cfg) {
        var contestKeys = firebaseRef.child("contestKeys");

        contestKeys.orderByKey().on("child_added", function (item) {
            cfg.callback.call(item, item);
        });
    };

    CJSystem.contest = function (cfg) {
        var callbackProps = ["desc", "id", "img", "name", "entryCount", "entryKeys", "rubrics"];
        var loadedProps = 0;

        var contestRef = firebaseRef.child("contests").child(cfg.id);

        var callbackData = {};

        function getProp(prop) {
            contestRef.child(prop).once("value", function (snapshot) {
                callbackData[prop] = snapshot.val();

                loadedProps += 1;

                if (loadedProps === callbackProps.length) {
                    cfg.callback.call(callbackData, callbackData);
                }
            });
        }

        for (var i = 0; i < callbackProps.length; i++) {
            getProp(callbackProps[i]);
        }
    };

    return CJSystem;
})();

},{}],2:[function(require,module,exports){
"use strict";

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _backendContest_judging_sysJs = require("../backend/contest_judging_sys.js");

var CJSystem = _interopRequireWildcard(_backendContest_judging_sysJs);

/**
 * createContestControl(controlData)
 * Creates a button using the data specified, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @param {Object} controlData: The JSON object containing the data for the control (such as display text and where the control should link to)
 * @returns {jQuery} contestControl: The jQuery object containing the newly created contest control
 */
var createContestControl = function createContestControl(controlData) {
    var contestControl = $("<a>").addClass("waves-effect").addClass("waves-light").addClass("amber").addClass("darken-2").addClass("btn").addClass("contest-control").text(controlData.text).attr("href", controlData.link === undefined ? null : controlData.link);

    return contestControl;
};

/**
 * createContestDetails(contestData)
 * Creates a "contest details" div, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @param {Object} contestData: A JSON object containing the data for a contest.
 * @returns {jQuery} contestDetails: The jQuery object containing the "contest details" div.
 */
var createContestDetails = function createContestDetails(contestData) {
    var contestDetails = $("<div>").addClass("col").addClass("s9").append($("<h5>").text(contestData.title)).append($("<div>").html(contestData.description));

    return contestDetails;
};

/**
 * createContestHolder(contestData)
 * Creates a "contest holder" div, and returns it to the caller.
 * @author Gigabyte Giant (2015)
 * @param {Object} contestData: A JSON object containing the data for a contest.
 * @returns {jQuery} contestHolder: The jQuery object containing the "contest holder" div.
 */
var createContestHolder = function createContestHolder(contestData) {
    var contestHolder = $("<div>").addClass("section").append($("<div>").addClass("col").addClass("s3").append($("<div>").addClass("center").append($("<img>").attr("src", contestData.thumbnail).addClass("responsive-img")).append(createContestControl({
        text: "View Entries"
    })).append(createContestControl({
        text: "Leaderboard"
    })))).append(createContestDetails(contestData));

    return contestHolder;
};

var setupPage = function setupPage() {
    for (var i = 0; i < 32; i++) {
        $(".contests").append($("<div>").addClass("row").append(createContestHolder({
            title: "Contest: Some contest",
            description: "This is a contest. Do something, and win a prize!",
            thumbnail: "http://www.whistler.com/images/placeholders/200x200.gif"
        }))).append($("<div>").addClass("divider"));
    }
};

setupPage();

},{"../backend/contest_judging_sys.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9Pd25lci9EZXNrdG9wL3NpdGVzL0tBLUNvbnRlc3QtSnVkZ2luZy1TeXN0ZW0vc3JjL2JhY2tlbmQvY29udGVzdF9qdWRnaW5nX3N5cy5qcyIsIkM6L1VzZXJzL093bmVyL0Rlc2t0b3Avc2l0ZXMvS0EtQ29udGVzdC1KdWRnaW5nLVN5c3RlbS9zcmMvY2xpZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsWUFBVzs7OztBQUk1QixRQUFJLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNsQyxRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDbkIsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFHLEVBQUU7QUFDdEMsWUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNyQixtQkFBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDeEQsc0JBQVUsR0FBRyxLQUFLLENBQUM7U0FDbkI7S0FDRDtBQUNELFFBQUksQ0FBQyxVQUFVLEVBQUU7QUFDaEIsZUFBTztLQUNQOztBQUlELFFBQUksV0FBVyxHQUFHLElBQUksUUFBUSxDQUFDLDRDQUE0QyxDQUFDLENBQUM7O0FBRTdFLFFBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQzs7QUFJbEIsWUFBUSxDQUFDLFFBQVEsR0FBRyxVQUFTLEdBQUcsRUFBRTtBQUNqQyxZQUFJLFdBQVcsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDOztBQUVuRCxtQkFBVyxD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QVEsQ0FBQyxTQUFTLENBQUMsQ0FDakMsQ0FBQztLQUNMO0NBQ0osQ0FBQzs7QUFFRixTQUFTLEVBQUUsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcclxuXHQvKiBBbiBhcnJheSBvZiB0aGUga2V5cyB0aGF0IE5FRUQgdG8gZXhpc3Qgb24gdGhlIHdpbmRvdyBvYmplY3QgZm9yIG91ciBjb2RlIHRvIGZ1bmN0aW9uXHJcblx0ICAgcHJvcGVybHkuIERvIGl0IHRoaXMgd2F5IHNvIHRoYXQgaWYgdGhlcmUgSVMgYSBtaXNzaW5nIGRlcGVuZGVuY3kgd2UgY2FuIGp1c3Qgb3BlbiB1cFxyXG5cdCAgIHRoZSBjb25zb2xlIGFuZCBpbnN0YW50bHkgc2VlIHdoYXQgd2UncmUgbWlzc2luZyAqL1xyXG5cdHZhciBkZXBzID0gW1wialF1ZXJ5XCIsIFwiRmlyZWJhc2VcIl07XHJcblx0dmFyIGhhc0FsbERlcHMgPSB0cnVlO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZXBzLmxlbmd0aDsgaSArKykge1xyXG4gICAgXHRpZiAoIXdpbmRvd1tkZXBzW2ldXSkge1xyXG4gICAgXHRcdGNvbnNvbGUuZXJyb3IoXCJNaXNzaW5nIGRlcGVuZGVuY3kgXFxcIlwiICsgZGVwc1tpXSArIFwiXFxcIlwiKTtcclxuICAgIFx0XHRoYXNBbGxEZXBzID0gZmFsc2U7XHJcbiAgICBcdH1cclxuICAgIH1cclxuICAgIGlmICghaGFzQWxsRGVwcykge1xyXG4gICAgXHRyZXR1cm47XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICB2YXIgZmlyZWJhc2VSZWYgPSBuZXcgRmlyZWJhc2UoXCJodHRwczovL2NvbnRlc3QtanVkZ2luZy1zeXMuZmlyZWJhc2Vpby5jb21cIik7XHJcblxyXG4gICAgdmFyIENKU3lzdGVtID0ge307XHJcblxyXG5cclxuXHJcbiAgICBDSlN5c3RlbS5jb250ZXN0cyA9IGZ1bmN0aW9uKGNmZykge1xyXG4gICAgXHR2YXIgY29udGVzdEtleXMgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RLZXlzXCIpO1xyXG5cclxuICAgIFx0Y29udGVzdEtleXMub3JkZXJCeUtleSgpLm9uKFwiY2hpbGRfYWRkZWRcIiwgZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgXHRcdGNmZy5jYWxsYmFjay5jYWxsKGl0ZW0sIGl0ZW0pO1xyXG4gICAgXHR9KTtcclxuICAgIH07XHJcblxyXG5cclxuXHJcbiAgICBDSlN5c3RlbS5jb250ZXN0ID0gZnVuY3Rpb24oY2ZnKSB7XHJcbiAgICBcdHZhciBjYWxsYmFja1Byb3BzID0gW1wiZGVzY1wiLCBcImlkXCIsIFwiaW1nXCIsIFwibmFtZVwiLCBcImVudHJ5Q291bnRcIiwgXCJlbnRyeUtleXNcIiwgXCJydWJyaWNzXCJdO1xyXG4gICAgXHR2YXIgbG9hZGVkUHJvcHMgPSAwO1xyXG5cclxuICAgIFx0dmFyIGNvbnRlc3RSZWYgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNmZy5pZCk7XHJcblxyXG4gICAgXHR2YXIgY2FsbGJhY2tEYXRhID0ge307XHJcblxyXG4gICAgXHRmdW5jdGlvbiBnZXRQcm9wKHByb3ApIHtcclxuICAgIFx0XHRjb250ZXN0UmVmLmNoaWxkKHByb3ApLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xyXG4gICAgXHRcdFx0Y2FsbGJhY2tEYXRhW3Byb3BdID0gc25hcHNob3QudmFsKCk7XHJcblxyXG4gICAgXHRcdFx0bG9hZGVkUHJvcHMgKz0gMTtcclxuXHJcbiAgICBcdFx0XHRpZiAobG9hZGVkUHJvcHMgPT09IGNhbGxiYWNrUHJvcHMubGVuZ3RoKSB7XHJcbiAgICBcdFx0XHRcdGNmZy5jYWxsYmFjay5jYWxsKGNhbGxiYWNrRGF0YSwgY2FsbGJhY2tEYXRhKTtcclxuICAgIFx0XHRcdH1cclxuXHJcbiAgICBcdFx0fSk7XHJcbiAgICBcdH1cclxuXHJcbiAgICBcdGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tQcm9wcy5sZW5ndGg7IGkgKyspIHtcclxuICAgIFx0XHRnZXRQcm9wKGNhbGxiYWNrUHJvcHNbaV0pO1xyXG4gICAgXHR9XHJcbiAgICB9O1xyXG5cclxuXHJcblxyXG4gICAgcmV0dXJuIENKU3lzdGVtO1xyXG59KSgpO1xyXG4iLCJpbXBvcnQgKiBhcyBDSlN5c3RlbSBmcm9tIFwiLi4vYmFja2VuZC9jb250ZXN0X2p1ZGdpbmdfc3lzLmpzXCI7XHJcbi8qKlxyXG4gKiBjcmVhdGVDb250ZXN0Q29udHJvbChjb250cm9sRGF0YSlcclxuICogQ3JlYXRlcyBhIGJ1dHRvbiB1c2luZyB0aGUgZGF0YSBzcGVjaWZpZWQsIGFuZCByZXR1cm5zIGl0IHRvIHRoZSBjYWxsZXIuXHJcbiAqIEBhdXRob3IgR2lnYWJ5dGUgR2lhbnQgKDIwMTUpXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250cm9sRGF0YTogVGhlIEpTT04gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRhdGEgZm9yIHRoZSBjb250cm9sIChzdWNoIGFzIGRpc3BsYXkgdGV4dCBhbmQgd2hlcmUgdGhlIGNvbnRyb2wgc2hvdWxkIGxpbmsgdG8pXHJcbiAqIEByZXR1cm5zIHtqUXVlcnl9IGNvbnRlc3RDb250cm9sOiBUaGUgalF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBuZXdseSBjcmVhdGVkIGNvbnRlc3QgY29udHJvbFxyXG4gKi9cclxudmFyIGNyZWF0ZUNvbnRlc3RDb250cm9sID0gZnVuY3Rpb24oY29udHJvbERhdGEpIHtcclxuICAgIHZhciBjb250ZXN0Q29udHJvbCA9ICQoXCI8YT5cIilcclxuICAgICAgICAuYWRkQ2xhc3MoXCJ3YXZlcy1lZmZlY3RcIilcclxuICAgICAgICAuYWRkQ2xhc3MoXCJ3YXZlcy1saWdodFwiKVxyXG4gICAgICAgIC5hZGRDbGFzcyhcImFtYmVyXCIpXHJcbiAgICAgICAgLmFkZENsYXNzKFwiZGFya2VuLTJcIilcclxuICAgICAgICAuYWRkQ2xhc3MoXCJidG5cIilcclxuICAgICAgICAuYWRkQ2xhc3MoXCJjb250ZXN0LWNvbnRyb2xcIilcclxuICAgICAgICAudGV4dChjb250cm9sRGF0YS50ZXh0KVxyXG4gICAgICAgIC5hdHRyKFwiaHJlZlwiLCAoY29udHJvbERhdGEubGluayA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGNvbnRyb2xEYXRhLmxpbmspKTtcclxuXHJcbiAgICByZXR1cm4gY29udGVzdENvbnRyb2w7XHJcbn07XHJcblxyXG4vKipcclxuICogY3JlYXRlQ29udGVzdERldGFpbHMoY29udGVzdERhdGEpXHJcbiAqIENyZWF0ZXMgYSBcImNvbnRlc3QgZGV0YWlsc1wiIGRpdiwgYW5kIHJldHVybnMgaXQgdG8gdGhlIGNhbGxlci5cclxuICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcclxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRlc3REYXRhOiBBIEpTT04gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRhdGEgZm9yIGEgY29udGVzdC5cclxuICogQHJldHVybnMge2pRdWVyeX0gY29udGVzdERldGFpbHM6IFRoZSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIFwiY29udGVzdCBkZXRhaWxzXCIgZGl2LlxyXG4gKi9cclxudmFyIGNyZWF0ZUNvbnRlc3REZXRhaWxzID0gZnVuY3Rpb24oY29udGVzdERhdGEpIHtcclxuICAgIHZhciBjb250ZXN0RGV0YWlscyA9ICQoXCI8ZGl2PlwiKVxyXG4gICAgICAgIC5hZGRDbGFzcyhcImNvbFwiKVxyXG4gICAgICAgIC5hZGRDbGFzcyhcInM5XCIpXHJcbiAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgJChcIjxoNT5cIikudGV4dChjb250ZXN0RGF0YS50aXRsZSlcclxuICAgICAgICApXHJcbiAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgJChcIjxkaXY+XCIpXHJcbiAgICAgICAgICAgICAgICAuaHRtbChjb250ZXN0RGF0YS5kZXNjcmlwdGlvbilcclxuICAgICAgICApO1xyXG5cclxuICAgIHJldHVybiBjb250ZXN0RGV0YWlscztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBjcmVhdGVDb250ZXN0SG9sZGVyKGNvbnRlc3REYXRhKVxyXG4gKiBDcmVhdGVzIGEgXCJjb250ZXN0IGhvbGRlclwiIGRpdiwgYW5kIHJldHVybnMgaXQgdG8gdGhlIGNhbGxlci5cclxuICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcclxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRlc3REYXRhOiBBIEpTT04gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRhdGEgZm9yIGEgY29udGVzdC5cclxuICogQHJldHVybnMge2pRdWVyeX0gY29udGVzdEhvbGRlcjogVGhlIGpRdWVyeSBvYmplY3QgY29udGFpbmluZyB0aGUgXCJjb250ZXN0IGhvbGRlclwiIGRpdi5cclxuICovXHJcbnZhciBjcmVhdGVDb250ZXN0SG9sZGVyID0gZnVuY3Rpb24oY29udGVzdERhdGEpIHtcclxuICAgIHZhciBjb250ZXN0SG9sZGVyID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwic2VjdGlvblwiKVxyXG4gICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcImNvbFwiKS5hZGRDbGFzcyhcInMzXCIpXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICAgICAgICAgICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcImNlbnRlclwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcIjxpbWc+XCIpLmF0dHIoXCJzcmNcIiwgY29udGVzdERhdGEudGh1bWJuYWlsKS5hZGRDbGFzcyhcInJlc3BvbnNpdmUtaW1nXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbnRlc3RDb250cm9sKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIlZpZXcgRW50cmllc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVDb250ZXN0Q29udHJvbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJMZWFkZXJib2FyZFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgKVxyXG4gICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgIGNyZWF0ZUNvbnRlc3REZXRhaWxzKGNvbnRlc3REYXRhKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgcmV0dXJuIGNvbnRlc3RIb2xkZXI7XHJcbn07XHJcblxyXG52YXIgc2V0dXBQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyBpKyspIHtcclxuICAgICAgICAkKFwiLmNvbnRlc3RzXCIpLmFwcGVuZChcclxuICAgICAgICAgICAgJChcIjxkaXY+XCIpLmFkZENsYXNzKFwicm93XCIpXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbnRlc3RIb2xkZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCJDb250ZXN0OiBTb21lIGNvbnRlc3RcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhpcyBpcyBhIGNvbnRlc3QuIERvIHNvbWV0aGluZywgYW5kIHdpbiBhIHByaXplIVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHVtYm5haWw6IFwiaHR0cDovL3d3dy53aGlzdGxlci5jb20vaW1hZ2VzL3BsYWNlaG9sZGVycy8yMDB4MjAwLmdpZlwiXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICApXHJcbiAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiZGl2aWRlclwiKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5zZXR1cFBhZ2UoKTsiXX0=
