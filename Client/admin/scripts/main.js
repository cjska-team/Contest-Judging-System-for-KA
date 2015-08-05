$("#createContestBtn").on("click", function() {
	$("#createContestModal").modal();
});

$("#createContestModal #cancel").on("click", function() {
	$("#createContestModal").modal("hide");
});

$("#createContestModal #new-rubric #rubric-max").on("change", function() {
	var numberOfKeysNeeded = $(this).val();
	console.log(numberOfKeysNeeded);
});