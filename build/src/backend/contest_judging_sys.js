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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9Pd25lci9EZXNrdG9wL3NpdGVzL0tBLUNvbnRlc3QtSnVkZ2luZy1TeXN0ZW0vc3JjL2JhY2tlbmQvY29udGVzdF9qdWRnaW5nX3N5cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLFlBQVc7Ozs7QUFJNUIsUUFBSSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbEMsUUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRyxFQUFFO0FBQ3RDLFlBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDckIsbUJBQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ3hELHNCQUFVLEdBQUcsS0FBSyxDQUFDO1NBQ25CO0tBQ0Q7QUFDRCxRQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2hCLGVBQU87S0FDUDs7QUFJRCxRQUFJLFdBQVcsR0FBRyxJQUFJLFFBQVEsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDOztBQUU3RSxRQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7O0FBSWxCLFlBQVEsQ0FBQyxRQUFRLEdBQUcsVUFBUyxHQUFHLEVBQUU7QUFDakMsWUFBSSxXQUFXLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFbkQsbUJBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLFVBQVMsSUFBSSxFQUFFO0FBQ3pELGVBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM5QixDQUFDLENBQUM7S0FDSCxDQUFDOztBQUlGLFlBQVEsQ0FBQyxPQUFPLEdBQUcsVUFBUyxHQUFHLEVBQUU7QUFDaEMsWUFBSSxhQUFhLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUN4RixZQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7O0FBRXBCLFlBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFN0QsWUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDOztBQUV0QixpQkFBUyxPQUFPLENBQUMsSUFBSSxFQUFFO0FBQ3RCLHNCQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBUyxRQUFRLEVBQUU7QUFDdkQsNEJBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7O0FBRXBDLDJCQUFXLElBQUksQ0FBQyxDQUFDOztBQUVqQixvQkFBSSxXQUFXLEtBQUssYUFBYSxDQUFDLE1BQU0sRUFBRTtBQUN6Qyx1QkFBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO2lCQUM5QzthQUVELENBQUMsQ0FBQztTQUNIOztBQUVELGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRyxFQUFFO0FBQy9DLG1CQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDMUI7S0FDRCxDQUFDOztBQUlGLFdBQU8sUUFBUSxDQUFDO0NBQ25CLENBQUEsRUFBRyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xyXG5cdC8qIEFuIGFycmF5IG9mIHRoZSBrZXlzIHRoYXQgTkVFRCB0byBleGlzdCBvbiB0aGUgd2luZG93IG9iamVjdCBmb3Igb3VyIGNvZGUgdG8gZnVuY3Rpb25cclxuXHQgICBwcm9wZXJseS4gRG8gaXQgdGhpcyB3YXkgc28gdGhhdCBpZiB0aGVyZSBJUyBhIG1pc3NpbmcgZGVwZW5kZW5jeSB3ZSBjYW4ganVzdCBvcGVuIHVwXHJcblx0ICAgdGhlIGNvbnNvbGUgYW5kIGluc3RhbnRseSBzZWUgd2hhdCB3ZSdyZSBtaXNzaW5nICovXHJcblx0dmFyIGRlcHMgPSBbXCJqUXVlcnlcIiwgXCJGaXJlYmFzZVwiXTtcclxuXHR2YXIgaGFzQWxsRGVwcyA9IHRydWU7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRlcHMubGVuZ3RoOyBpICsrKSB7XHJcbiAgICBcdGlmICghd2luZG93W2RlcHNbaV1dKSB7XHJcbiAgICBcdFx0Y29uc29sZS5lcnJvcihcIk1pc3NpbmcgZGVwZW5kZW5jeSBcXFwiXCIgKyBkZXBzW2ldICsgXCJcXFwiXCIpO1xyXG4gICAgXHRcdGhhc0FsbERlcHMgPSBmYWxzZTtcclxuICAgIFx0fVxyXG4gICAgfVxyXG4gICAgaWYgKCFoYXNBbGxEZXBzKSB7XHJcbiAgICBcdHJldHVybjtcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIHZhciBmaXJlYmFzZVJlZiA9IG5ldyBGaXJlYmFzZShcImh0dHBzOi8vY29udGVzdC1qdWRnaW5nLXN5cy5maXJlYmFzZWlvLmNvbVwiKTtcclxuXHJcbiAgICB2YXIgQ0pTeXN0ZW0gPSB7fTtcclxuXHJcblxyXG5cclxuICAgIENKU3lzdGVtLmNvbnRlc3RzID0gZnVuY3Rpb24oY2ZnKSB7XHJcbiAgICBcdHZhciBjb250ZXN0S2V5cyA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdEtleXNcIik7XHJcblxyXG4gICAgXHRjb250ZXN0S2V5cy5vcmRlckJ5S2V5KCkub24oXCJjaGlsZF9hZGRlZFwiLCBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICBcdFx0Y2ZnLmNhbGxiYWNrLmNhbGwoaXRlbSwgaXRlbSk7XHJcbiAgICBcdH0pO1xyXG4gICAgfTtcclxuXHJcblxyXG5cclxuICAgIENKU3lzdGVtLmNvbnRlc3QgPSBmdW5jdGlvbihjZmcpIHtcclxuICAgIFx0dmFyIGNhbGxiYWNrUHJvcHMgPSBbXCJkZXNjXCIsIFwiaWRcIiwgXCJpbWdcIiwgXCJuYW1lXCIsIFwiZW50cnlDb3VudFwiLCBcImVudHJ5S2V5c1wiLCBcInJ1YnJpY3NcIl07XHJcbiAgICBcdHZhciBsb2FkZWRQcm9wcyA9IDA7XHJcblxyXG4gICAgXHR2YXIgY29udGVzdFJlZiA9IGZpcmViYXNlUmVmLmNoaWxkKFwiY29udGVzdHNcIikuY2hpbGQoY2ZnLmlkKTtcclxuXHJcbiAgICBcdHZhciBjYWxsYmFja0RhdGEgPSB7fTtcclxuXHJcbiAgICBcdGZ1bmN0aW9uIGdldFByb3AocHJvcCkge1xyXG4gICAgXHRcdGNvbnRlc3RSZWYuY2hpbGQocHJvcCkub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XHJcbiAgICBcdFx0XHRjYWxsYmFja0RhdGFbcHJvcF0gPSBzbmFwc2hvdC52YWwoKTtcclxuXHJcbiAgICBcdFx0XHRsb2FkZWRQcm9wcyArPSAxO1xyXG5cclxuICAgIFx0XHRcdGlmIChsb2FkZWRQcm9wcyA9PT0gY2FsbGJhY2tQcm9wcy5sZW5ndGgpIHtcclxuICAgIFx0XHRcdFx0Y2ZnLmNhbGxiYWNrLmNhbGwoY2FsbGJhY2tEYXRhLCBjYWxsYmFja0RhdGEpO1xyXG4gICAgXHRcdFx0fVxyXG5cclxuICAgIFx0XHR9KTtcclxuICAgIFx0fVxyXG5cclxuICAgIFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja1Byb3BzLmxlbmd0aDsgaSArKykge1xyXG4gICAgXHRcdGdldFByb3AoY2FsbGJhY2tQcm9wc1tpXSk7XHJcbiAgICBcdH1cclxuICAgIH07XHJcblxyXG5cclxuXHJcbiAgICByZXR1cm4gQ0pTeXN0ZW07XHJcbn0pKCk7XHJcbiJdfQ==
