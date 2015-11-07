(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = {
    addAdminLink: function addAdminLink(selector, cjsWrapper) {
        cjsWrapper.getPermLevel(function (permLevel) {
            if (permLevel >= 5) {
                $("<li>").append($("<a>").attr("href", "./admin/").text("Admin dashboard")).insertBefore($(selector).parent());
            }
        });
    },
    setupOnClick: function setupOnClick(selector, cjsWrapper) {
        $(selector).on("click", function (evt) {
            evt.preventDefault();

            if (cjsWrapper.fetchFirebaseAuth() === null) {
                cjsWrapper.authenticate();
            } else {
                cjsWrapper.authenticate(true);
            }
        });
    },
    showWelcome: function showWelcome(selector, cjsWrapper) {
        if (cjsWrapper.fetchFirebaseAuth() === null) {
            $(selector).text("Hello guest! Click me to log in.");
        } else {
            $(selector).text("Hello " + cjsWrapper.fetchFirebaseAuth().google.displayName + "! (Not you? Click here!)");
        }
    },
    setupPageAuth: function setupPageAuth(authBtnSelector, cjsWrapper) {
        this.setupOnClick(authBtnSelector, cjsWrapper);
        this.showWelcome(authBtnSelector, cjsWrapper);
        this.addAdminLink(authBtnSelector, cjsWrapper);
    }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQnJ5bmRlbi9zcGFyay9Db250ZXN0LUp1ZGdpbmctU3lzdGVtLWZvci1LQS9zcmMvaGVscGVycy9hdXRoZW50aWNhdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNiLGdCQUFZLEVBQUUsc0JBQVMsUUFBUSxFQUFFLFVBQVUsRUFBRTtBQUN6QyxrQkFBVSxDQUFDLFlBQVksQ0FBQyxVQUFTLFNBQVMsRUFBRTtBQUN4QyxnQkFBSSxTQUFTLElBQUksQ0FBQyxFQUFFO0FBQ2hCLGlCQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUNaLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUM1RCxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzthQUN4QztTQUNKLENBQUMsQ0FBQztLQUNOO0FBQ0QsZ0JBQVksRUFBRSxzQkFBUyxRQUFRLEVBQUUsVUFBVSxFQUFFO0FBQ3pDLFNBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUMsR0FBRyxFQUFLO0FBQzdCLGVBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQzs7QUFFckIsZ0JBQUksVUFBVSxDQUFDLGlCQUFpQixFQUFFLEtBQUssSUFBSSxFQUFFO0FBQ3pDLDBCQUFVLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDN0IsTUFBTTtBQUNILDBCQUFVLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2pDO1NBQ0osQ0FBQyxDQUFDO0tBQ047QUFDRCxlQUFXLEVBQUUscUJBQVMsUUFBUSxFQUFFLFVBQVUsRUFBRTtBQUN4QyxZQUFJLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLElBQUksRUFBRTtBQUN6QyxhQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7U0FDeEQsTUFBTTtBQUNILGFBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLFlBQVUsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsOEJBQTJCLENBQUM7U0FDMUc7S0FDSjtBQUNELGlCQUFhLEVBQUUsdUJBQVMsZUFBZSxFQUFFLFVBQVUsRUFBRTtBQUNqRCxZQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUMvQyxZQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM5QyxZQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUNsRDtDQUNKLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgYWRkQWRtaW5MaW5rOiBmdW5jdGlvbihzZWxlY3RvciwgY2pzV3JhcHBlcikge1xuICAgICAgICBjanNXcmFwcGVyLmdldFBlcm1MZXZlbChmdW5jdGlvbihwZXJtTGV2ZWwpIHtcbiAgICAgICAgICAgIGlmIChwZXJtTGV2ZWwgPj0gNSkge1xuICAgICAgICAgICAgICAgICQoXCI8bGk+XCIpLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgJChcIjxhPlwiKS5hdHRyKFwiaHJlZlwiLCBcIi4vYWRtaW4vXCIpLnRleHQoXCJBZG1pbiBkYXNoYm9hcmRcIilcbiAgICAgICAgICAgICAgICApLmluc2VydEJlZm9yZSgkKHNlbGVjdG9yKS5wYXJlbnQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgc2V0dXBPbkNsaWNrOiBmdW5jdGlvbihzZWxlY3RvciwgY2pzV3JhcHBlcikge1xuICAgICAgICAkKHNlbGVjdG9yKS5vbihcImNsaWNrXCIsIChldnQpID0+IHtcbiAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAoY2pzV3JhcHBlci5mZXRjaEZpcmViYXNlQXV0aCgpID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY2pzV3JhcHBlci5hdXRoZW50aWNhdGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2pzV3JhcHBlci5hdXRoZW50aWNhdGUodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgc2hvd1dlbGNvbWU6IGZ1bmN0aW9uKHNlbGVjdG9yLCBjanNXcmFwcGVyKSB7XG4gICAgICAgIGlmIChjanNXcmFwcGVyLmZldGNoRmlyZWJhc2VBdXRoKCkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICQoc2VsZWN0b3IpLnRleHQoXCJIZWxsbyBndWVzdCEgQ2xpY2sgbWUgdG8gbG9nIGluLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoc2VsZWN0b3IpLnRleHQoYEhlbGxvICR7Y2pzV3JhcHBlci5mZXRjaEZpcmViYXNlQXV0aCgpLmdvb2dsZS5kaXNwbGF5TmFtZX0hIChOb3QgeW91PyBDbGljayBoZXJlISlgKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc2V0dXBQYWdlQXV0aDogZnVuY3Rpb24oYXV0aEJ0blNlbGVjdG9yLCBjanNXcmFwcGVyKSB7XG4gICAgICAgIHRoaXMuc2V0dXBPbkNsaWNrKGF1dGhCdG5TZWxlY3RvciwgY2pzV3JhcHBlcik7XG4gICAgICAgIHRoaXMuc2hvd1dlbGNvbWUoYXV0aEJ0blNlbGVjdG9yLCBjanNXcmFwcGVyKTtcbiAgICAgICAgdGhpcy5hZGRBZG1pbkxpbmsoYXV0aEJ0blNlbGVjdG9yLCBjanNXcmFwcGVyKTtcbiAgICB9XG59OyJdfQ==
