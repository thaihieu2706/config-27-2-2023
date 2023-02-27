var profile_pic = document.querySelector ("a[role=link][tabindex='0'][href*='https://www.facebook']>img");
var story = document.querySelectorAll("img[draggable=false]");

if (profile_pic != null && top.location.toString().indexOf("stories") != -1) {
	let videos = document.querySelectorAll("video");
    let video = null;
    for (let i=0;i<videos.length;i++)  {
        if(videos[i].offsetHeight !== 0)
            video = videos[i];
    }
	let username = profile_pic.alt;
	if (video !== null) {
        let videoURL = document.head.getAttribute("SSvideoURL");
        if (videoURL == "null") {
            savePhotoStory ();
        } else {
            chrome.runtime.sendMessage (null, {
                site: "facebook",
                username: username,
                url: videoURL
            });
        }
        document.head.removeAttribute("SSvideoURL");
	} else {
		savePhotoStory ();
	}
} else {
    chrome.runtime.sendMessage (null, { noStories:true });
}
function savePhotoStory (){
    story = story[story.length-1];
    let storyUrl = story.src;
    let username = profile_pic.alt;
    chrome.runtime.sendMessage (null, {
        site: "facebook",
        username: username,
        url: storyUrl
    });
}