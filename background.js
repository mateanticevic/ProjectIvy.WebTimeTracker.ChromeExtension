var activeTab;
var activeTabId;

var session;

var sessions = [];

var item = localStorage.getItem("sessions");
var saved = item != null ? JSON.parse(item) : null;

var isBrowserActive = true;

if(saved && saved.push){
    sessions = saved;
}

chrome.browserAction.onClicked.addListener(function(tab) {
});

chrome.webNavigation.onCompleted.addListener(function(details) {
});

chrome.tabs.onCreated.addListener(function(tab) {         
});

chrome.tabs.onRemoved.addListener(function(tabId){
    if(tabId == activeTabId){
        endSession(session);
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log(activeTabId + " " + tabId);
    if(tabId == activeTabId && isBrowserActive){
        onNewSessionStart(tabId);
    }
});

chrome.tabs.onActivated.addListener(function(info){
    activeTabId = info.tabId;
    onNewSessionStart(info.tabId);
});

chrome.windows.onFocusChanged.addListener(function(window) {
    if (window == chrome.windows.WINDOW_ID_NONE) {
        isBrowserActive = false;
        onSessionEnd();
    }
    else if (activeTab){
        isBrowserActive = true;
        onSessionStart(activeTab.url);
    }
});

chrome.idle.setDetectionInterval(15);

chrome.idle.onStateChanged.addListener(function(state){

    if(state == "active" && !session){
        onNewSessionStart(activeTabId);
    }
    else if(state == "idle" || state == "locked" && session){
        onSessionEnd();
    }
});

function newSession(url){
    return {
        start: new Date(),
        isSecured: isSecured(url),
        domain: urlToDomain(url)
    };
};

function endSession(session){
    session.end = new Date();
};

function onNewSessionStart(tabId){

    chrome.tabs.get(tabId, function(tab){
        activeTab = tab;

        if(!isHttp(tab.url)){
            return false;
        }

        if(session != undefined && session.domain != urlToDomain(tab.url)){
            onSessionEnd();
        }

        if(session == undefined || session.domain != urlToDomain(tab.url)){
            onSessionStart(tab.url);
        }
    });
};

function onSessionStart(url){
    if(isHttp(url)){
        session = newSession(url);
        console.log(urlToDomain(url));
    }
};

function onSessionEnd(){
    if(session){
        endSession(session);
        sessions.push(session);
        localStorage.setItem("sessions", JSON.stringify(sessions));
        console.log("Session lasted for " + Math.abs(session.end - session.start) / 1000 + "s");
        session = null;
    }
};

function urlToDomain(url){
    var domain;
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    domain = domain.split(':')[0];

    return domain;
};

function isSecured(url){
    if (url.indexOf("https://") == 0) {
        return true;
    }
    else{
        return false;
    }
};

function isHttp(url){
    if (url.indexOf("https://") == 0) {
        return true;
    }
    else if(url.indexOf("http://") == 0){
        return true;
    }
    else{
        return false;
    }
};