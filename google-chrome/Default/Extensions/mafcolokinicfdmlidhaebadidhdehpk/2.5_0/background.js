let supportedSites = [
    {host: "instagram.com", name: "instagram"},
    {host: "facebook.com", name: "facebook"},
    {host: "web.whatsapp.com", name: "whatsapp"},
];

chrome.runtime.onInstalled.addListener(function() {
    chrome.action.disable();
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        let conditions = [];
        for (let i=0; i < supportedSites.length; i++) {
            let site = supportedSites[i];
            conditions.push (new chrome.declarativeContent.PageStateMatcher ({ pageUrl: { hostSuffix: site.host } }));
        }

        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: conditions,
                actions: [ new chrome.declarativeContent.ShowAction() ]
            }
        ]);
    });
});
chrome.action.onClicked.addListener(function (tab) {
    if (tab.url === undefined) {
        animateIconFailed(tab.id);
        return;
    }
    let script = "";
    for (let i=0; i < supportedSites.length; i++) {
        let site = supportedSites[i];
        if (tab.url.indexOf (site.host) !== -1) {
            script = site.name;
            break;
        }
    }
    if (script != "") {
        if (script == "facebook") {
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                world: chrome.scripting.ExecutionWorld.MAIN,
                files: ['content_scripts/facebook-video.js']
            });
        } else if (script == "instagram") {
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                world: chrome.scripting.ExecutionWorld.MAIN,
                files: ['content_scripts/instagram-video.js']
            });
        }
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ['content_scripts/' + script + '.js']
        });
    }
});
chrome.runtime.onMessage.addListener(function (message, sender) {
    if (message.rateClicked === true) {
        chrome.storage.local.set({"rated": "true"});
        return;
    }
    if (message.noStories === true){
        animateIconFailed (sender.tab.id);
        return ;
    }
    let date = new Date ();
    let dateString = date.getFullYear () + "-" + (date.getMonth ()+1) + "-" + date.getDate ();
    let fileExtension = message.url.split ("?")[0].split (".").pop ();

    chrome.downloads.download ({
        url: message.url,
        filename: message.username + "'s " + message.site + " " + dateString + " story" + "." + fileExtension,
        saveAs: false
    });
    showPopup (sender.tab.id);
    animateIconArrowDown (sender.tab.id);
});
// Rate Popup
function showPopup (tabId){
    chrome.storage.local.get(['downloadCounter', 'rated'], result => {
        let counter = (result.downloadCounter == undefined)? 0 : result.downloadCounter;
        if (counter % 20 === 5 && counter < 50 && result.rated != "true"){
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files: ['content_scripts/sweetalert2.all.min.js', 'content_scripts/showPopup.js']
            });
        }
        counter++;
        chrome.storage.local.set({"downloadCounter": counter});
    })
    
}

// Icon Animation
let canvas = new OffscreenCanvas(32, 32);
let context = canvas.getContext ("2d");
let iconBackground = null;
let iconArrow = null;
let iconRedbar = null;
loadIconImages();

async function loadIconImages () {
    let imgblob = await fetch(chrome.runtime.getURL ("icons/icon_32_background.png")).then(r => r.blob());
    iconBackground = await createImageBitmap(imgblob);
    imgblob = await fetch(chrome.runtime.getURL ("icons/icon_32_arrow.png")).then(r => r.blob());
    iconArrow = await createImageBitmap(imgblob);
    imgblob = await fetch(chrome.runtime.getURL ("icons/icon_32_redbar.png")).then(r => r.blob());
    iconRedbar = await createImageBitmap(imgblob);
}

function animateIconArrowDown (tabId, y = 7) {
    let done = false;
    let iconAnimation = setInterval (function () {
        context.clearRect (0, 0, canvas.width, canvas.height);
        context.drawImage (iconArrow, 8, y);
        context.drawImage (iconBackground, 0, 0);
        chrome.action.setIcon ({ tabId: tabId, imageData: context.getImageData (0, 0, 32, 32) });

        y += 2;
        if (done)
            clearInterval (iconAnimation);

        if (y > 35) 
            y = -17;
        else if (y == 7)
            done = true;
        
    }, 1000/30);
}

function animateIconFailed (tabId) {
    let angle = Math.PI/2;
    let fade = false;
    let fadeAlpha = 1;
    let maxAngle = 135 * Math.PI / 180;
    let iconAnimation = setInterval (function () {

        let rotateAngle = Math.min (angle, maxAngle);
        context.clearRect (0, 0, canvas.width, canvas.height);
        context.globalAlpha = fadeAlpha;
        context.translate( 16, 16 );
        context.rotate (rotateAngle);
        context.drawImage (iconRedbar, -2, -9);
        context.rotate (-2*rotateAngle);
        context.drawImage (iconRedbar, -2, -9);
        context.rotate (rotateAngle);
        context.translate( -16, -16 );
        context.globalAlpha = 1;
        context.drawImage (iconBackground, 0, 0);
        chrome.action.setIcon ({ tabId: tabId, imageData: context.getImageData (0, 0, 32, 32) });

        angle += 0.08;
        if (fade)
            fadeAlpha -= 0.1;
        if (angle > maxAngle + 0.2)
            fade = true;
        if (fadeAlpha < 0) {
            animateIconArrowDown (tabId, -17);
            clearInterval (iconAnimation);
        }
        
    }, 1000/30);
}