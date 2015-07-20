# Client
## This is our actual client application that will eventually run the contest judging system. For now, though, it just shows a list of the contests that the judge can use to browse the contests.
* `index.html` runs the main application. We name it `index.html` so one only has to visit the root of the `Client` folder in order to reach the application.
* `contest.html` is used for viewing entries to a specific contest.
* `entry.html` is used for viewing a specific entry
* `stylesheets` holds all of the CSS files for the application.
* * `stylesheets/main.css` is the main CSS file for all HTML files.
* `scripts` holds all of the JavaScript files for the application.
* * `scripts/main.js` is the JavaScript file for `index.html`.
* * `scripts/contest.js` is the JavaScript file for `contest.html`.
* * `scripts/entry.js` is the JavaScript file for `entry.html`.

NOTE: If `index.html` keeps loading without any sign of stopping, go to `Backend/contest_judging_sys.js` and uncomment the block of code under the `Template fromFirebase for testing:` comment.