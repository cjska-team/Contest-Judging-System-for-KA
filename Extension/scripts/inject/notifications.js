// request permission!
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}
var tabid = Math.round(Math.random()*875835873*Math.random());
console.log(tabid);
chrome.runtime.sendMessage("melabjdobbjfobmgaagkmgbnhplncdie",{"registering":tabid},function(data){
  console.log(data);
});
function newNotifications(notificationCount,dd) {
  /*if (Notification.permission !== "granted"){
    Notification.requestPermission();
  }else {
  	var notificationTitle = "New Notification";
  	var notificationBody = "You have";
  	if(notificationCount == "?"){
  		notificationTitle = "Some new notifications";
  		notificationBody = "We know your notification count changed, but we're not sure if you checked them in a seperate tab or something."
  	}if(parseFloat(notificationCount) > 1){
  		notificationTitle += "s";
  		notificationBody += " " + notificationCount + " new notifications!";
  	}else{
  		notificationBody += " a new notification!";
  	}
    var notification = new Notification(notificationTitle, {
      icon: 'https://www.khanacademy.org/images/avatars/leaf-green.png',
      body: notificationBody,
    });

    setTimeout(function() {
    	notification.close();
    },3000);
  }*/
  chrome.runtime.sendMessage("melabjdobbjfobmgaagkmgbnhplncdie",{"newNotificationCount":notificationCount,"isDifference":dd,"tabid":tabid});
}
if(KA.userProfileData_.countBrandNewNotifications > 0){
	newNotifications(KA.userProfileData_.countBrandNewNotifications);
}
var setUpdateAlert = false;
var userNotified = false;
setInterval(function() {
	$.getJSON("https://www.khanacademy.org/api/internal/user/profile?username=" + KA.userProfileData_.username, function(data){
		if(data.countBrandNewNotifications != KA.userProfileData_.countBrandNewNotifications){
			var difference = data.countBrandNewNotifications - KA.userProfileData_.countBrandNewNotifications;
			if(difference <= 0){
				//
        if(difference == 0||data.countBrandNewNotifications == 0){
          $(".notification-bubble").hide()
          $(".icon-bell-alt").removeClass("brand-new");
          newNotifications(difference,true);
        }else{
          newNotifications(data.countBrandNewNotifications,false);
          $(".notification-bubble").show().html(data.countBrandNewNotifications)
          $(".icon-bell-alt").addClass("brand-new");
        }
			}else{
				newNotifications(difference,true);
				$(".notification-bubble").show().html(data.countBrandNewNotifications)
				$(".icon-bell-alt").addClass("brand-new");
			}
      if(KA.userProfileData_.countBrandNewNotifications == 0&& data.countBrandNewNotifications != 0){
        document.title = "(" + data.countBrandNewNotifications + ") " + document.title;
      }else if(data.countBrandNewNotifications == 0){
        document.title = document.title.replace("(" + KA.userProfileData_.countBrandNewNotifications + ") ","")
      }else{
        document.title = document.title.replace("(" + KA.userProfileData_.countBrandNewNotifications + ") ","(" + data.countBrandNewNotifications + ") ")
      }
			KA.userProfileData_.countBrandNewNotifications = data.countBrandNewNotifications;
			
		}
	})
},2000);
window.onbeforeunload = function() {
  chrome.runtime.sendMessage("melabjdobbjfobmgaagkmgbnhplncdie",{"unregistering":tabid})
};