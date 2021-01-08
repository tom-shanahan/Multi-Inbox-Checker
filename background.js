const atom_feed = 'https://mail.google.com/mail/u/ACCOUNT_ID/feed/atom/';
// let unreadCount = -1;
// let updateFrequency = 1;
// let toggleAccounts = 'const_primary';
let curAccount = 'primary';
const accounts = {
    'primary':'0',
    'secondary':'1'
};
let unread_counts = {
    'primary':-1,
    'secondary':-1
};

function initiate() {
    if (!localStorage.updateFrequency)
        localStorage.updateFrequency = 1;
    if (!localStorage.toggleAccounts)
        localStorage.toggleAccounts = 'const_primary';
    localStorage.unreadCount = -1;
    getInboxCount();
    // chrome.alarms.create('refreshCount', { periodInMinutes: parseInt(updateFrequency) });
    chrome.alarms.create('refreshCount', { periodInMinutes: 5 });
    setInterval(function(){ updateIcon(); }, 5000);
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
            if (xml) {
                unreadCount = xml.getElementsByTagName('fullcount')[0].textContent;
            }
            else {
                unreadCount = -1;
            }
        }
        else {
            unreadCount = -1;
        }
        window.clearTimeout(abortTimer);
        unread_counts[curAccount] = unreadCount;
    }
    current_feed = atom_feed.replace('ACCOUNT_ID', accounts[curAccount]);
    xhr.open("GET", current_feed, true);
    xhr.send(null);
}

function toggleAccount() {
    if (localStorage.toggleAccounts === 'const_primary'){
        curAccount = 'primary';
    }
    else if (localStorage.toggleAccounts === 'const_secondary'){
        curAccount = 'secondary';
    }
    else {
        if (curAccount === 'primary')
            curAccount = 'secondary';
        else
            curAccount = 'primary';
    }
}

function updateIcon() {
    toggleAccount();
    if (unread_counts[curAccount] === -1) {
        chrome.browserAction.setBadgeBackgroundColor({color: 'gray'});
        chrome.browserAction.setBadgeText({text:"?"});
        chrome.browserAction.setIcon({path:"gmail_not_ready.png"});
    }
    else {
        if (curAccount === 'primary')
            chrome.browserAction.setBadgeBackgroundColor({color: 'blue'});
        else
            chrome.browserAction.setBadgeBackgroundColor({color: 'red'});
        chrome.browserAction.setBadgeText({ text: unread_counts[curAccount].toString() });
        chrome.browserAction.setIcon({path:"gmail_ready.png"});
    }
    // localStorage.unreadCount = count;
    console.log('updateIcon',curAccount,localStorage.toggleAccounts)
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
