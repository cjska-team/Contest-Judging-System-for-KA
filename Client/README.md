# Client
## This is our actual client application that runs the contest judging system.
* `index.html` runs the main application. We name it `index.html` so one only has to visit the root of the `Client` folder to reach the application.
* `contest.html` is used for viewing entries to a specific contest.
* `entry.html` is used for viewing a specific entry.
* `leaderboard.html` doesn't do anything yet, but will be used for showing a leaderboard eventually.
* `stylesheets` holds all of the CSS files for the application.
* * `stylesheets/main.css` is the main CSS file for all HTML files.
* * `stylesheets/entry.css` is the CSS file for `entry.html` (along with `main.css`)
* `scripts` holds all of the JavaScript files for the application.
* * `scripts/main.js` is the JavaScript file for `index.html`.
* * `scripts/contest.js` is the JavaScript file for `contest.html`.
* * `scripts/entry.js` is the JavaScript file for `entry.html`.
* * `scripts/leaderboard.js` is the JavaScript file for `leaderboard.html`.
* * `scripts/auth/auth.js` is the JavaScript file for all HTML files used to log users into Google.
* `admin` holds everything necessary for the admin interface (visit the folder for more info).