## Backend
* `contest_judging_sys.js` holds the namespace `Contest_Judging_System` for general-purpose, reusable code.
* `ka_api.js` holds the namespace `KA_API` for getting data from the KA API to put into the Firebase database.
* `sync.js` is for storing AJAX requests to get data about the contests. No longer used anymore because it's been replaced by `ka_api.js` and `contest_judging_sys.js`.