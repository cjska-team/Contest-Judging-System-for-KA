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

    /* A list of the properties that we want to get from contests */
    var contestProps = ["desc", "id", "img", "name", "entryCount", "entryKeys", "rubrics"];

    /**
     * contests(cfg)
     * Creates/updates a cookie with the desired name, setting it's value to "value".
     * @author JavascriptFTW
     * @param {Object} cfg: An object containing various data for the method call
     */
    CJSystem.contests = function (cfg) {
        var contestKeys = firebaseRef.child("contestKeys");

        contestKeys.orderByKey().on("child_added", function (item) {
            cfg.callback.call(item, item);
        });
    };

    CJSystem.contest = function (cfg) {
        var loadedProps = 0;

        var contestRef = firebaseRef.child("contests").child(cfg.id);

        var callbackData = {};

        function getProp(prop) {
            contestRef.child(prop).once("value", function (snapshot) {
                callbackData[prop] = snapshot.val();

                loadedProps += 1;

                if (loadedProps === contestProps.length) {
                    cfg.callback.call(callbackData, callbackData);
                }
            });
        }

        for (var i = 0; i < contestProps.length; i++) {
            getProp(contestProps[i]);
        }
    };

    return CJSystem;
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9Pd25lci9EZXNrdG9wL3NpdGVzL0tBLUNvbnRlc3QtSnVkZ2luZy1TeXN0ZW0vc3JjL2JhY2tlbmQvY29udGVzdF9qdWRnaW5nX3N5cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLFlBQVc7Ozs7QUFJNUIsUUFBSSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbEMsUUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRyxFQUFFO0FBQ3RDLFlBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDckIsbUJBQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ3hELHNCQUFVLEdBQUcsS0FBSyxDQUFDO1NBQ25CO0tBQ0Q7QUFDRCxRQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2hCLGVBQU87S0FDUDs7QUFJRCxRQUFJLFdBQVcsR0FBRyxJQUFJLFFBQVEsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDOztBQUU3RSxRQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7OztBQUdsQixRQUFJLFlBQVksR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDOzs7Ozs7OztBQVN2RixZQUFRLENBQUMsUUFBUSxHQUFHLFVBQVMsR0FBRyxFQUFFO0FBQ2pDLFlBQUksV0FBVyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7O0FBRW5ELG1CQUFXLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxVQUFTLElBQUksRUFBRTtBQUN6RCxlQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDOUIsQ0FBQyxDQUFDO0tBQ0gsQ0FBQzs7QUFJRixZQUFRLENBQUMsT0FBTyxHQUFHLFVBQVMsR0FBRyxFQUFFO0FBQ2hDLFlBQUksV0FBVyxHQUFHLENBQUMsQ0FBQzs7QUFFcEIsWUFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUU3RCxZQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7O0FBRXRCLGlCQUFTLE9BQU8sQ0FBQyxJQUFJLEVBQUU7QUFDdEIsc0JBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFTLFFBQVEsRUFBRTtBQUN2RCw0QkFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFcEMsMkJBQVcsSUFBSSxDQUFDLENBQUM7O0FBRWpCLG9CQUFJLFdBQVcsS0FBSyxZQUFZLENBQUMsTUFBTSxFQUFFO0FBQ3hDLHVCQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7aUJBQzlDO2FBRUQsQ0FBQyxDQUFDO1NBQ0g7O0FBRUQsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFHLEVBQUU7QUFDOUMsbUJBQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN6QjtLQUNELENBQUM7O0FBSUYsV0FBTyxRQUFRLENBQUM7Q0FDbkIsQ0FBQSxFQUFHLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XHJcblx0LyogQW4gYXJyYXkgb2YgdGhlIGtleXMgdGhhdCBORUVEIHRvIGV4aXN0IG9uIHRoZSB3aW5kb3cgb2JqZWN0IGZvciBvdXIgY29kZSB0byBmdW5jdGlvblxyXG5cdCAgIHByb3Blcmx5LiBEbyBpdCB0aGlzIHdheSBzbyB0aGF0IGlmIHRoZXJlIElTIGEgbWlzc2luZyBkZXBlbmRlbmN5IHdlIGNhbiBqdXN0IG9wZW4gdXBcclxuXHQgICB0aGUgY29uc29sZSBhbmQgaW5zdGFudGx5IHNlZSB3aGF0IHdlJ3JlIG1pc3NpbmcgKi9cclxuXHR2YXIgZGVwcyA9IFtcImpRdWVyeVwiLCBcIkZpcmViYXNlXCJdO1xyXG5cdHZhciBoYXNBbGxEZXBzID0gdHJ1ZTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGVwcy5sZW5ndGg7IGkgKyspIHtcclxuICAgIFx0aWYgKCF3aW5kb3dbZGVwc1tpXV0pIHtcclxuICAgIFx0XHRjb25zb2xlLmVycm9yKFwiTWlzc2luZyBkZXBlbmRlbmN5IFxcXCJcIiArIGRlcHNbaV0gKyBcIlxcXCJcIik7XHJcbiAgICBcdFx0aGFzQWxsRGVwcyA9IGZhbHNlO1xyXG4gICAgXHR9XHJcbiAgICB9XHJcbiAgICBpZiAoIWhhc0FsbERlcHMpIHtcclxuICAgIFx0cmV0dXJuO1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgdmFyIGZpcmViYXNlUmVmID0gbmV3IEZpcmViYXNlKFwiaHR0cHM6Ly9jb250ZXN0LWp1ZGdpbmctc3lzLmZpcmViYXNlaW8uY29tXCIpO1xyXG5cclxuICAgIHZhciBDSlN5c3RlbSA9IHt9O1xyXG5cclxuICAgIC8qIEEgbGlzdCBvZiB0aGUgcHJvcGVydGllcyB0aGF0IHdlIHdhbnQgdG8gZ2V0IGZyb20gY29udGVzdHMgKi9cclxuICAgIHZhciBjb250ZXN0UHJvcHMgPSBbXCJkZXNjXCIsIFwiaWRcIiwgXCJpbWdcIiwgXCJuYW1lXCIsIFwiZW50cnlDb3VudFwiLCBcImVudHJ5S2V5c1wiLCBcInJ1YnJpY3NcIl07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY29udGVzdHMoY2ZnKVxyXG4gICAgICogQ3JlYXRlcy91cGRhdGVzIGEgY29va2llIHdpdGggdGhlIGRlc2lyZWQgbmFtZSwgc2V0dGluZyBpdCdzIHZhbHVlIHRvIFwidmFsdWVcIi5cclxuICAgICAqIEBhdXRob3IgSmF2YXNjcmlwdEZUV1xyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNmZzogQW4gb2JqZWN0IGNvbnRhaW5pbmcgdmFyaW91cyBkYXRhIGZvciB0aGUgbWV0aG9kIGNhbGxcclxuICAgICAqL1xyXG4gICAgQ0pTeXN0ZW0uY29udGVzdHMgPSBmdW5jdGlvbihjZmcpIHtcclxuICAgIFx0dmFyIGNvbnRlc3RLZXlzID0gZmlyZWJhc2VSZWYuY2hpbGQoXCJjb250ZXN0S2V5c1wiKTtcclxuXHJcbiAgICBcdGNvbnRlc3RLZXlzLm9yZGVyQnlLZXkoKS5vbihcImNoaWxkX2FkZGVkXCIsIGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgIFx0XHRjZmcuY2FsbGJhY2suY2FsbChpdGVtLCBpdGVtKTtcclxuICAgIFx0fSk7XHJcbiAgICB9O1xyXG5cclxuXHJcblxyXG4gICAgQ0pTeXN0ZW0uY29udGVzdCA9IGZ1bmN0aW9uKGNmZykge1xyXG4gICAgXHR2YXIgbG9hZGVkUHJvcHMgPSAwO1xyXG5cclxuICAgIFx0dmFyIGNvbnRlc3RSZWYgPSBmaXJlYmFzZVJlZi5jaGlsZChcImNvbnRlc3RzXCIpLmNoaWxkKGNmZy5pZCk7XHJcblxyXG4gICAgXHR2YXIgY2FsbGJhY2tEYXRhID0ge307XHJcblxyXG4gICAgXHRmdW5jdGlvbiBnZXRQcm9wKHByb3ApIHtcclxuICAgIFx0XHRjb250ZXN0UmVmLmNoaWxkKHByb3ApLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xyXG4gICAgXHRcdFx0Y2FsbGJhY2tEYXRhW3Byb3BdID0gc25hcHNob3QudmFsKCk7XHJcblxyXG4gICAgXHRcdFx0bG9hZGVkUHJvcHMgKz0gMTtcclxuXHJcbiAgICBcdFx0XHRpZiAobG9hZGVkUHJvcHMgPT09IGNvbnRlc3RQcm9wcy5sZW5ndGgpIHtcclxuICAgIFx0XHRcdFx0Y2ZnLmNhbGxiYWNrLmNhbGwoY2FsbGJhY2tEYXRhLCBjYWxsYmFja0RhdGEpO1xyXG4gICAgXHRcdFx0fVxyXG5cclxuICAgIFx0XHR9KTtcclxuICAgIFx0fVxyXG5cclxuICAgIFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb250ZXN0UHJvcHMubGVuZ3RoOyBpICsrKSB7XHJcbiAgICBcdFx0Z2V0UHJvcChjb250ZXN0UHJvcHNbaV0pO1xyXG4gICAgXHR9XHJcbiAgICB9O1xyXG5cclxuXHJcblxyXG4gICAgcmV0dXJuIENKU3lzdGVtO1xyXG59KSgpO1xyXG4iXX0=
