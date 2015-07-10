var version = "1.4.3.1";
var changes = [];
var notificationsShown = false;
$(document).ready(function() {
	var myTab;
	function updateTab() {
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  			myTab = tabs[0];
		});
	}
	updateTab();
	/* User Lookup */
	$("#autofill #pC").click(function() {
		var pgA = myTab.url.split("/");
		var pgID = pgA[pgA.length-1];
		if(pgID.indexOf("?") > -1){
			pgID = pgID.substr(0,pgID.indexOf("?"));
		}
		if(parseFloat(pgID).toString() == pgID){
			killFlash();
			$("#username").val("Please Wait...");
			$.getJSON("https://www.khanacademy.org/api/internal/show_scratchpad?scratchpad_id=" + pgID + "&casing=camel&lang=en",function(data){
				$("#username").val(data.creatorProfile.username);
			});
		}else{
			flashU("Not a program!");
		}
	});
	$("#autofill #pU").click(function() {
		if(myTab.url.indexOf("/profile/") > -1){
			killFlash();
			$("#username").val(myTab.url.replace("https://www.khanacademy.org/","").split("/")[1]);
		}else{
			flashU("Not a profile!");
		}
	});
	function YN(bool){
		if(bool){
			return "Yes";
		}else{
			return "No";
		}
	}
	function formatNumber(number){
		number = parseFloat(number);
		/*if(number.length <= 3){
			return number;
		}
		var formattedPoints = number;
		var sp = formattedPoints.split("");
		formattedPoints = "";
		for(var i = 0; i < sp.length; i++){
			if(i%3 == 0&&i != sp.length -1){
				sp[i] = sp[i] + ",";//789
			}
			formattedPoints += sp[i].toString();
		}*/
		return number.toLocaleString();
	}
	function parseString(string){
		string = string.replace(/</g,"&lt;");
		string = string.replace(/>/g,"&gt;");
		return string;
	}
	$("#lookup").click(function() {
		killFlash();
		var UN = $("#username").val();
		if(UN.length > 0){
			$.getJSON("https://www.khanacademy.org/api/internal/user/profile?username=" + UN,function(data){
				$("#ppic").attr("src",data.avatarSrc);
				$("#nickname").html(parseString(data.nickname));
				$("#eg").html(formatNumber(data.points));
				$("#uLabel").html("@" + data.username)
				try{
					$("#bio").html(parseString(data.bio))
				}catch(e){
					$("#bio").html("")
				}
				try{
					$("#location").html(parseString(data.userLocation.displayText).replace(/\n/g,"<br>"))
				}catch(e){
					$("#location").html("")
				}
				$("#cHB").html(YN(data.canHellban));
				$("#hSP").html(YN(data.globalPermissions.length > 0));
				$("#iM").html(YN(data.isModerator));
				$("#mL").html(data.moderatorLevel);
				$("#cMU").html(YN(data.canMessageUsers));
				$("#iCre").html(YN(data.isCreator));
				$("#iCur").html(YN(data.isCurator));
				$("#iB").html(YN(data.isPublisher));
				$("#cOC").html(YN(data.canCreateOfficialClarifications));
			});
		}
	});
	$("#flaghelp").click(function() {
		alert("If you have unreasonable flags on your program, (Like vote-soliciting flags that say \"I love this program\") wait a bit to see if a guardian clears the flags. If you want them removed immediately, please contact a guardian or staff member. Please do not spam them with messages, though. They have a lot to do, so please respect that.\n-Lokio27")
	})
	/* Program Diagnositc */
	$("#lookup-pD").click(function() {
		var pgID = $("#pgID").val().toString();
		if(parseFloat(pgID).toString() == pgID){
			$.getJSON("https://www.khanacademy.org/api/internal/show_scratchpad?scratchpad_id=" + pgID + "&casing=camel&lang=en",function(data){
				/* Creator */
				$("#cpic").attr("src",data.creatorProfile.avatarSrc);
				$("#nickname").html(data.creatorProfile.nickname);
				$("#uLabel").html("@" + data.creatorProfile.username)
				$("#eg").html(formatNumber(data.creatorProfile.points));
				/* Program */
				$("#ppic").attr("src","https://www.khanacademy.org/computer-programming/imgSRC/" + pgID + "/latest.png");
				$("#pname").html(data.scratchpad.title);
				$("#votes").html(formatNumber(data.scratchpad.sumVotesIncremented))
				$("#spinoffs").html(formatNumber(data.scratchpad.spinoffCount))
				if(data.scratchpad.hideFromHotlist){
					$("#hide").show();
				}else{
					$("#hide").hide();
				}
				var flags = data.scratchpad.flags;
				var flagFormat = "";
				for(var i = 0; i < flags.length; i++){
					flagFormat += "<b>" + flags[i].replace(":","</b>:") + "<br>";
				}
				if(flags.length == 0){
					flagFormat = "<b>No Flags!</b>";
					$("#flagged").hide();
				}else{
					if(!data.scratchpad.hideFromHotlist){
						$("#flagged").show();
					}
				}
				$("#flagscroll").html(flagFormat)
			});	
		}
	});
	$("#autofill #tP").click(function() {
		var pgA = myTab.url.split("/");
		var pgID = pgA[pgA.length-1];
		if(pgID.indexOf("?") > -1){
			pgID = pgID.substr(0,pgID.indexOf("?"));
		}
		if(parseFloat(pgID).toString() == pgID){
			$("#pgID").val(pgID);
		}
	});
	/* Options */
	chrome.storage.sync.get({"showNotifications":true}, function(data){
		$("#autoNotif").prop("checked", data.showNotifications);
	})
	$("#autoNotif").change(function() {
		chrome.storage.sync.set({"showNotifications":$(this).prop("checked")});
	})
});
var thisTimeout;
function flashU(text){
	$("#username").val(text);
	killFlash();
	thisTimeout = setTimeout(function() {
		$("#username").val("");
	}, 3000);
}
function killFlash(){
	try{
		clearTimeout(thisTimeout);
	}catch(e){}
}
$.getJSON("http://terminalbit.com/MultiTool/versiondata.json",function(data){
	if(data.latestVersion != version){
		$("#outOfDateWarning").show();
	}
	$("#version").html(data.latestVersion)
	changes = data.recentChanges;
	var pushedString = "";
	for(var i = 0; i < changes.length; i++){
		pushedString+="<li>" + changes[i] + "</li>";
	}
	$("#changes").html(pushedString);
	$("#changelog").show();
	$("#changelogLoader").hide();
})

