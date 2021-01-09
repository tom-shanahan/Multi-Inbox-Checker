const atom_feed = 'https://mail.google.com/mail/u/ACCOUNT_ID/feed/atom/';
let curAccount = 'primary';
const accounts = {
    'primary':'0',
    'secondary':'1'
};
let unread_counts = {
    'primary':-1,
    'secondary':-1
};
let interval = setInterval(function(){ updateIcon(); }, localStorage.toggleFrequency * 1000);

function initiate() {
    if (!localStorage.hasOwnProperty('updateFrequency'))
        localStorage.updateFrequency = 1;
    if (!localStorage.hasOwnProperty('toggleAccounts'))
        localStorage.toggleAccounts = 'const_primary';
    if (!localStorage.hasOwnProperty('toggleFrequency'))
        localStorage.toggleFrequency = 10;
    if (localStorage.toggleAccounts === 'const_secondary')
        curAccount = 'secondary';

    localStorage.unreadCount = -1;
    getInboxCount();
    // chrome.alarms.create('refreshCount', { periodInMinutes: parseInt(updateFrequency) });
    chrome.alarms.create('refreshCount', { periodInMinutes: parseInt(localStorage.updateFrequency) });
}

function getInboxCount() {
    console.log('getInboxCount',localStorage.updateFrequency,new Date().toLocaleTimeString());
    let accountArray = [curAccount];
    if (localStorage.toggleAccounts === 'toggle')
        accountArray = ['primary','secondary'];

    accountArray.forEach(function (account) {
        let xhr = new XMLHttpRequest();
        let abortTimer = window.setTimeout(function() { xhr.abort(); }, 10000);
        chrome.alarms.create('refreshCount', { periodInMinutes: parseInt(localStorage.updateFrequency) });
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) {
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
            unread_counts[account] = unreadCount;
        }
        current_feed = atom_feed.replace('ACCOUNT_ID', accounts[account]);
        xhr.open("GET", current_feed, true);
        xhr.send(null);
    });
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
        chrome.browserAction.setIcon({path:"not_ready.png"});
    }
    else {
        if (curAccount === 'primary')
            chrome.browserAction.setBadgeBackgroundColor({color: 'blue'});
        else
            chrome.browserAction.setBadgeBackgroundColor({color: 'red'});
        chrome.browserAction.setBadgeText({ text: unread_counts[curAccount].toString() });
        chrome.browserAction.setIcon({path:"ready.png"});
    }
    // localStorage.unreadCount = count;
    clearInterval(interval);
    interval = setInterval(function(){ updateIcon(); }, localStorage.toggleFrequency * 1000);
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
            if (tab.url && tab.url.startsWith(getGmail() + 'u/' + accounts[curAccount])) {
                chrome.tabs.update(tab.id, {selected: true});
                getInboxCount();
                return;
            }
        }
        chrome.tabs.create({url: getGmail() + '/u/' + accounts[curAccount]});
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
