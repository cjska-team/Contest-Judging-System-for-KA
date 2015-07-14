# Tests
* `app.html`, `app.css`, and `app.js` work together to make an application used for viewing contests and contest entries. Now broken because of the new `Backend/ka_api.js`, but the code can still be salvaged for the future.
* `auth_test.html` checks Firebase authentication.
* `include.html` checks to see if the `Contest_Judging_System.include()`  from `Backend/contest_judging_sys.js` is working.
* `ka_api_wrapper_test.html` checks to see if `KA_API.getContests()` from `Backend/ka_api.js` is working.
* `project_wrapper_test.html` checks to see if `Contest_Judging_System.sync()` from `Backend/contest_judging_sys.js` is working.
* `sync_test.html` and `sync_test.js` checks to see if the `sync()` function from `Backend/sync.js` is working. No longer works because `Backend/sync.js` is legacy code.