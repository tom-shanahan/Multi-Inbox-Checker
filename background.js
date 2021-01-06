var atom_feed = 'https://mail.google.com/mail/feed/atom/';
var unreadCount = -1;

function initiate() {
    localStorage.unreadCount = -1;
    getInboxCount();
    // Event pages won't wait for setTimeout / setInterval before unloading due to inactivity and won't wake up for such a timer
    // https://stackoverflow.com/questions/53250235/what-differenciates-browser-alarms-create-from-settimeout-setinterval-in-webexte
    // setInterval(function(){ getInboxCount(); }, 1000);
    chrome.alarms.create('refreshCount', { periodInMinutes:1 });
}

function getInboxCount() {
    let xhr = new XMLHttpRequest();
    let abortTimer = window.setTimeout(function() { xhr.abort(); }, 10000);
    chrome.alarms.create('refreshCount', { periodInMinutes:1 });
    xhr.onreadystatechange = function() {
        console.log("xhr.readyState",xhr.readyState);
        if (xhr.readyState != 4) {
            return;
        }
        if (xhr.responseXML) {
            var xml = xhr.responseXML;
            console.log("xhr.responseXML",xml);
            if (xml) {
                unreadCount = xml.getElementsByTagName('fullcount')[0].textContent;
                console.log("COUNT",unreadCount)
            }
            else {
                console.log("NO XML")
                unreadCount = -1;
            }
        }
        else {
            console.log("NO xhr.responseXML")
            unreadCount = -1;
        }
        console.log("UPDATE?");
        window.clearTimeout(abortTimer);
        updateIcon(unreadCount);
    }
    xhr.open("GET", atom_feed, true);
    xhr.send(null);
    console.log("FIN");
}

function updateIcon(count) {
    if (!localStorage.hasOwnProperty('unreadCount') || count !== localStorage.hasOwnProperty('unreadCount')){
        if (count === -1) {
            chrome.browserAction.setBadgeBackgroundColor({color: 'gray'});
            chrome.browserAction.setBadgeText({text:"?"});
            chrome.browserAction.setIcon({path:"gmail_not_ready.png"});
        }
        else {
            chrome.browserAction.setBadgeBackgroundColor({color: 'red'});
            chrome.browserAction.setBadgeText({ text: count.toString() });
            chrome.browserAction.setIcon({path:"gmail_ready.png"});
        }
    }
    localStorage.unreadCount = count;
}

function getGmail() {
    return "https://mail.google.com/mail/";
}

function isGmail(url) {
    return url.startsWith(getGmail());
}

function navigateToInbox() {
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
        for (var i = 0, tab; tab = tabs[i]; i++) {
            if (tab.url && isGmail(tab.url)) {
                chrome.tabs.update(tab.id, {selected: true});
                getInboxCount();
                return;
            }
        }
        chrome.tabs.create({url: getGmail()});
    });
}

function handleNav(details) {
    if (details.url && isGmail(details.url)) {
        getInboxCount();
    }
}

chrome.runtime.onInstalled.addListener(initiate);
chrome.runtime.onStartup.addListener(getInboxCount);
chrome.alarms.onAlarm.addListener(getInboxCount);
chrome.browserAction.onClicked.addListener(navigateToInbox);

var filters = {
    url: [{urlContains: getGmail().replace(/^https?\:\/\//, '')}]
};
chrome.webNavigation.onDOMContentLoaded.addListener(handleNav, filters);
chrome.webNavigation.onReferenceFragmentUpdated.addListener(handleNav, filters);
