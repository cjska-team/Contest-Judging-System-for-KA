/***
 * This file is where all the general purpose, reusable code should go!
***/

/*
 * Basic Script Injection
 * Author: Gigabyte Giant
 */
var include = function(link) {
    /*Append a <script> tag with src link into the <body>*/
    var scriptTag = document.createElement("script");
    scriptTag.src = link;
    document.body.appendChild(scriptTag);
};

var getApi = function(apiUrl, complete){
    /*Send a GET AJAX request to apiUrl and call complete when finished*/
    //Made by aikaikaik in https://github.com/aikaikaik/KA-Contest-Judging-System/commit/dee9bceaef6c6fc8abf8437d76882e5cfca81718
    return $.ajax({
        type: 'GET',
        url: apiUrl,
        async: true,
        complete: complete
    });
};
