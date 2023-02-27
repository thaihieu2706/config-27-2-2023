if (top.location.toString().indexOf("stories") != -1) {
    var haveImgStory = false;
    var imgs = document.querySelectorAll ("img")
    for (let img of imgs) {
        if (img.nextSibling && getComputedStyle(img.nextSibling).overflow === "hidden") {
            imgs = img;
            haveImgStory = true;
            break;
        }
    }

    var videos = document.querySelectorAll("video");
    var video = null;
    for (let i=0;i<videos.length;i++)  {
        if(videos[i].offsetHeight !== 0)
            video = videos[i];
    }
    var haveVideoStory = video != null;
    if (haveImgStory || haveVideoStory) {
        if (haveVideoStory) {
            let username = document.querySelectorAll ("a")[1].innerText;
            let videoURL = document.head.getAttribute("SSvideoURL");
            if (videoURL == "null"){
                videoURL = video?.children[0]?.src;
            }
            if ((videoURL == null || videoURL == "null") && haveImgStory) {
                savePhotoStory ();
            } else {
                chrome.runtime.sendMessage (null, {
                    site: "instagram",
                    username: username,
                    url: videoURL
                });
            }
            document.head.removeAttribute("SSvideoURL");
        } else {
            savePhotoStory ();
        }
    }
} else {
    chrome.runtime.sendMessage (null, { noStories:true });
}
function savePhotoStory (){
    let storyUrl = imgs.srcset.split (",")[0].split (" ")[0];
    let username = document.querySelectorAll ("a")[1].innerText;
    if (storyUrl.length == 0) {
        chrome.runtime.sendMessage (null, { noStories:true });
    } else {
        chrome.runtime.sendMessage (null, {
            site: "instagram",
            username: username,
            url: storyUrl
        });
    }
}