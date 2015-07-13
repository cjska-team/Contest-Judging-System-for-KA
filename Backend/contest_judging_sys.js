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

var getApi = function(apiUrl,complete){
  return $.ajax({
      type: 'GET',
      url: apiUrl,
      async: true,
      complete: complete
    });
};
