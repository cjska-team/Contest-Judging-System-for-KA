/* When the user tries to add a rubric: */
document.querySelector("#addrubric").addEventListener("click", function(event) {
   /* Make sure the form doesn't redirect and alert to the user that they can't add rubrics yet. */
    event.preventDefault();
    alert("You can't add rubrics yet. Sorry!"); 
});

/* When the user tries to submit a contest: */
document.querySelector("#submitcontest").addEventListener("click", function(event) {
    /* Make sure the form doesn't redirect and alert to the user that they can't submit contests yet. */
    event.preventDefault();
    alert("You can't submit contests yet. Sorry!");
});