# Client
## This is our actual client application that will eventually run the contest judging system. For now, though, it just shows a list of the contests that the judge can use to browse the contests.
* `stylesheets` holds all of the CSS files for the application.
* * `stylesheets/main.css` is the main CSS file.
* `scripts` holds all of the JavaScript files for the application.
* * `stylesheets/main.js` is the main JavaScript file.
* `index.html` runs the application using the CSS files in `stylesheets` and the JavaScript files in `scripts`. We name it `index.html` so one only has to visit the root of the `Client` folder in order to reach the application.

NOTE: If `index.html` keeps loading without any sign of stopping, go to `Backend/contest_judging_sys.js` and uncomment the block of code under the `Template fromFirebase for testing:` comment.