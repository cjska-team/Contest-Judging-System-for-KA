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

CJSystem.contests({
    callback: function callback() {
        console.log("Got some contest data");
        CJSystem.contest({
            id: this.key(),
            callback: function callback(contest) {
                console.log("Got a contest");
                console.log(this);
                $(".contests").append($("<div>").addClass("row").append(createContestHolder({
                    title: contest.name,
                    description: contest.desc,
                    thumbnail: "https://khanacademy.org" + contest.img
                }))).append($("<div>").addClass("divider"));
            }
        });
    }
});

},{"../backend/contest_judging_sys.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9Pd25lci9EZXNrdG9wL3NpdGVzL0tBLUNvbnRlc3QtSnVkZ2luZy1TeXN0ZW0vc3JjL2JhY2tlbmQvY29udGVzdF9qdWRnaW5nX3N5cy5qcyIsIkM6L1VzZXJzL093bmVyL0Rlc2t0b3Avc2l0ZXMvS0EtQ29udGVzdC1KdWRnaW5nLVN5c3RlbS9zcmMvY2xpZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsWUFBVzs7OztBQUk1QixRQUFJLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNsQyxRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDbkIsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFHLEVBQUU7QUFDdEMsWUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNyQixtQkFBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDeEQsc0JBQVUsR0FBRyxLQUFLLENBQUM7U0FDbkI7S0FDRDtBQUNELFFBQUksQ0FBQyxVQUFVLEVBQUU7QUFDaEIsZUFBTztLQUNQOztBQUlELFFBQUksV0FBVyxHQUFHLElBQUksUUFBUSxDQUFDLDRDQUE0QyxDQUFDLENBQUM7O0FBRTdFLFFBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQzs7QUFJbEIsWUFBUSxDQUFDLFFBQVEsR0FBRyxVQUFTLEdBQUcsRUFBRTtBQUNqQyxZQUFJLFdBQVcsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDOztBQUVuRCxtQkFBVyxD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QUNyQixNQUFNLENBQ0gsbUJBQW1CLENBQUM7QUFDaEIseUJBQUssRUFBRSxPQUFPLENBQUMsSUFBSTtBQUNuQiwrQkFBVyxFQUFFLE9BQU8sQ0FBQyxJQUFJO0FBQ3pCLDZCQUFTLEVBQUUseUJBQXlCLEdBQUcsT0FBTyxDQUFDLEdBQUc7aUJBQ3JELENBQUMsQ0FDTCxDQUNSLENBQ0EsTUFBTSxDQUNILENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQ2pDLENBQUM7YUFDTDtTQUNKLENBQUMsQ0FBQztLQUNOO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xyXG5cdC8qIEFuIGFycmF5IG9mIHRoZSBrZXlzIHRoYXQgTkVFRCB0byBleGlzdCBvbiB0aGUgd2luZG93IG9iamVjdCBmb3Igb3VyIGNvZGUgdG8gZnVuY3Rpb25cclxuXHQgICBwcm9wZXJseS4gRG8gaXQgdGhpcyB3YXkgc28gdGhhdCBpZiB0aGVyZSBJUyBhIG1pc3NpbmcgZGVwZW5kZW5jeSB3ZSBjYW4ganVzdCBvcGVuIHVwXHJcblx0ICAgdGhlIGNvbnNvbGUgYW5kIGluc3RhbnRseSBzZWUgd2hhdCB3ZSdyZSBtaXNzaW5nICovXHJcblx0dmFyIGRlcHMgPSBbXCJqUXVlcnlcIiwgXCJGaXJlYmFzZVwiXTtcclxuXHR2YXIgaGFzQWxsRGVwcyA9IHRydWU7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRlcHMubGVuZ3RoOyBpICsrKSB7XHJcbiAgICBcdGlmICghd2luZG93W2RlcHNbaV1dKSB7XHJcbiAgICBcdFx0Y29uc29sZS5lcnJvcihcIk1pc3NpbmcgZGVwZW5kZW5jeSBcXFwiXCIgKyBkZXBzW2ldICsgXCJcXFwiXCIpO1xyXG4gICAgXHRcdGhhc0FsbERlcHMgPSBmYWxzZTtcclxuICAgIFx0fVxyXG4gICAgfVxyXG4gICAgaWYgKCFoYXNBbGxEZXBzKSB7XHJcbiAgICBcdHJldHVybjtcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIHZhciBmaXJlYmFzZVJlZiA9IG5ldyBGaXJlYmFzZShcImh0dHBzOi8vY29udGVzdC1qdWRnaW5nLXN5cy5maXJlYmFzZWlvLmNvbVwiKTtcclxuXHJcbiAgICB2YXIgQ0pTeXN0ZW0gPSB7fTtcclxuXHJcblxyXG5cclxuICAgIENKU3lzdGVtLmNvbnRlc3RzID0gZnVuY3Rpb24oY2ZnKSB7XHJcbiAgICBcdHZhciBjb250ZXN0S2V5cyA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdEtleXNcIik7XHJcblxyXG4gICAgXHRjb250ZXN0S2V5cy5vcmRlckJ5S2V5KCkub24oXCJjaGlsZF9hZGRlZFwiLCBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICBcdFx0Y2ZnLmNhbGxiYWNrLmNhbGwoaXRlbSwgaXRlbSk7XHJcbiAgICBcdH0pO1xyXG4gICAgfTtcclxuXHJcblxyXG5cclxuICAgIENKU3lzdGVtLmNvbnRlc3QgPSBmdW5jdGlvbihjZmcpIHtcclxuICAgIFx0dmFyIGNhbGxiYWNrUHJvcHMgPSBbXCJkZXNjXCIsIFwiaWRcIiwgXCJpbWdcIiwgXCJuYW1lXCIsIFwiZW50cnlDb3VudFwiLCBcImVudHJ5S2V5c1wiLCBcInJ1YnJpY3NcIl07XHJcbiAgICBcdHZhciBsb2FkZWRQcm9wcyA9IDA7XHJcblxyXG4gICAgXHR2YXIgY29udGVzdFJlZiA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY2ZnLmlkKTtcclxuXHJcbiAgICBcdHZhciBjYWxsYmFja0RhdGEgPSB7fTtcclxuXHJcbiAgICBcdGZ1bmN0aW9uIGdldFByb3AocHJvcCkge1xyXG4gICAgXHRcdGNvbnRlc3RSZWYuY2hpbGQocHJvcCkub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XHJcbiAgICBcdFx0XHRjYWxsYmFja0RhdGFbcHJvcF0gPSBzbmFwc2hvdC52YWwoKTtcclxuXHJcbiAgICBcdFx0XHRsb2FkZWRQcm9wcyArPSAxO1xyXG5cclxuICAgIFx0XHRcdGlmIChsb2FkZWRQcm9wcyA9PT0gY2FsbGJhY2tQcm9wcy5sZW5ndGgpIHtcclxuICAgIFx0XHRcdFx0Y2ZnLmNhbGxiYWNrLmNhbGwoY2FsbGJhY2tEYXRhLCBjYWxsYmFja0RhdGEpO1xyXG4gICAgXHRcdFx0fVxyXG5cclxuICAgIFx0XHR9KTtcclxuICAgIFx0fVxyXG5cclxuICAgIFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja1Byb3BzLmxlbmd0aDsgaSArKykge1xyXG4gICAgXHRcdGdldFByb3AoY2FsbGJhY2tQcm9wc1tpXSk7XHJcbiAgICBcdH1cclxuICAgIH07XHJcblxyXG5cclxuXHJcbiAgICByZXR1cm4gQ0pTeXN0ZW07XHJcbn0pKCk7XHJcbiIsImltcG9ydCAqIGFzIENKU3lzdGVtIGZyb20gXCIuLi9iYWNrZW5kL2NvbnRlc3RfanVkZ2luZ19zeXMuanNcIjtcclxuLyoqXHJcbiAqIGNyZWF0ZUNvbnRlc3RDb250cm9sKGNvbnRyb2xEYXRhKVxyXG4gKiBDcmVhdGVzIGEgYnV0dG9uIHVzaW5nIHRoZSBkYXRhIHNwZWNpZmllZCwgYW5kIHJldHVybnMgaXQgdG8gdGhlIGNhbGxlci5cclxuICogQGF1dGhvciBHaWdhYnl0ZSBHaWFudCAoMjAxNSlcclxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRyb2xEYXRhOiBUaGUgSlNPTiBvYmplY3QgY29udGFpbmluZyB0aGUgZGF0YSBmb3IgdGhlIGNvbnRyb2wgKHN1Y2ggYXMgZGlzcGxheSB0ZXh0IGFuZCB3aGVyZSB0aGUgY29udHJvbCBzaG91bGQgbGluayB0bylcclxuICogQHJldHVybnMge2pRdWVyeX0gY29udGVzdENvbnRyb2w6IFRoZSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG5ld2x5IGNyZWF0ZWQgY29udGVzdCBjb250cm9sXHJcbiAqL1xyXG52YXIgY3JlYXRlQ29udGVzdENvbnRyb2wgPSBmdW5jdGlvbihjb250cm9sRGF0YSkge1xyXG4gICAgdmFyIGNvbnRlc3RDb250cm9sID0gJChcIjxhPlwiKVxyXG4gICAgICAgIC5hZGRDbGFzcyhcIndhdmVzLWVmZmVjdFwiKVxyXG4gICAgICAgIC5hZGRDbGFzcyhcIndhdmVzLWxpZ2h0XCIpXHJcbiAgICAgICAgLmFkZENsYXNzKFwiYW1iZXJcIilcclxuICAgICAgICAuYWRkQ2xhc3MoXCJkYXJrZW4tMlwiKVxyXG4gICAgICAgIC5hZGRDbGFzcyhcImJ0blwiKVxyXG4gICAgICAgIC5hZGRDbGFzcyhcImNvbnRlc3QtY29udHJvbFwiKVxyXG4gICAgICAgIC50ZXh0KGNvbnRyb2xEYXRhLnRleHQpXHJcbiAgICAgICAgLmF0dHIoXCJocmVmXCIsIChjb250cm9sRGF0YS5saW5rID09PSB1bmRlZmluZWQgPyBudWxsIDogY29udHJvbERhdGEubGluaykpO1xyXG5cclxuICAgIHJldHVybiBjb250ZXN0Q29udHJvbDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBjcmVhdGVDb250ZXN0RGV0YWlscyhjb250ZXN0RGF0YSlcclxuICogQ3JlYXRlcyBhIFwiY29udGVzdCBkZXRhaWxzXCIgZGl2LCBhbmQgcmV0dXJucyBpdCB0byB0aGUgY2FsbGVyLlxyXG4gKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxyXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGVzdERhdGE6IEEgSlNPTiBvYmplY3QgY29udGFpbmluZyB0aGUgZGF0YSBmb3IgYSBjb250ZXN0LlxyXG4gKiBAcmV0dXJucyB7alF1ZXJ5fSBjb250ZXN0RGV0YWlsczogVGhlIGpRdWVyeSBvYmplY3QgY29udGFpbmluZyB0aGUgXCJjb250ZXN0IGRldGFpbHNcIiBkaXYuXHJcbiAqL1xyXG52YXIgY3JlYXRlQ29udGVzdERldGFpbHMgPSBmdW5jdGlvbihjb250ZXN0RGF0YSkge1xyXG4gICAgdmFyIGNvbnRlc3REZXRhaWxzID0gJChcIjxkaXY+XCIpXHJcbiAgICAgICAgLmFkZENsYXNzKFwiY29sXCIpXHJcbiAgICAgICAgLmFkZENsYXNzKFwiczlcIilcclxuICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICAkKFwiPGg1PlwiKS50ZXh0KGNvbnRlc3REYXRhLnRpdGxlKVxyXG4gICAgICAgIClcclxuICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICAkKFwiPGRpdj5cIilcclxuICAgICAgICAgICAgICAgIC5odG1sKGNvbnRlc3REYXRhLmRlc2NyaXB0aW9uKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgcmV0dXJuIGNvbnRlc3REZXRhaWxzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGNyZWF0ZUNvbnRlc3RIb2xkZXIoY29udGVzdERhdGEpXHJcbiAqIENyZWF0ZXMgYSBcImNvbnRlc3QgaG9sZGVyXCIgZGl2LCBhbmQgcmV0dXJucyBpdCB0byB0aGUgY2FsbGVyLlxyXG4gKiBAYXV0aG9yIEdpZ2FieXRlIEdpYW50ICgyMDE1KVxyXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGVzdERhdGE6IEEgSlNPTiBvYmplY3QgY29udGFpbmluZyB0aGUgZGF0YSBmb3IgYSBjb250ZXN0LlxyXG4gKiBAcmV0dXJucyB7alF1ZXJ5fSBjb250ZXN0SG9sZGVyOiBUaGUgalF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBcImNvbnRlc3QgaG9sZGVyXCIgZGl2LlxyXG4gKi9cclxudmFyIGNyZWF0ZUNvbnRlc3RIb2xkZXIgPSBmdW5jdGlvbihjb250ZXN0RGF0YSkge1xyXG4gICAgdmFyIGNvbnRlc3RIb2xkZXIgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJzZWN0aW9uXCIpXHJcbiAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiY29sXCIpLmFkZENsYXNzKFwiczNcIilcclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICAgICAgICAgJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiY2VudGVyXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiPGltZz5cIikuYXR0cihcInNyY1wiLCBjb250ZXN0RGF0YS50aHVtYm5haWwpLmFkZENsYXNzKFwicmVzcG9uc2l2ZS1pbWdcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29udGVzdENvbnRyb2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiVmlldyBFbnRyaWVzXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbnRlc3RDb250cm9sKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIkxlYWRlcmJvYXJkXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICApXHJcbiAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgY3JlYXRlQ29udGVzdERldGFpbHMoY29udGVzdERhdGEpXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICByZXR1cm4gY29udGVzdEhvbGRlcjtcclxufTtcclxuXHJcblxyXG5DSlN5c3RlbS5jb250ZXN0cyh7XHJcbiAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJHb3Qgc29tZSBjb250ZXN0IGRhdGFcIik7XHJcbiAgICAgICAgQ0pTeXN0ZW0uY29udGVzdCh7XHJcbiAgICAgICAgICAgIGlkOiB0aGlzLmtleSgpLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oY29udGVzdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJHb3QgYSBjb250ZXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcyk7XHJcbiAgICAgICAgICAgICAgICAkKFwiLmNvbnRlc3RzXCIpLmFwcGVuZChcclxuICAgICAgICAgICAgICAgICAgICAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJyb3dcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbnRlc3RIb2xkZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBjb250ZXN0Lm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNvbnRlc3QuZGVzYyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHVtYm5haWw6IFwiaHR0cHM6Ly9raGFuYWNhZGVteS5vcmdcIiArIGNvbnRlc3QuaW1nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICAgICAgICAgICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcImRpdmlkZXJcIilcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7XHJcbiJdfQ==
