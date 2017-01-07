var activeTab;
var activeTabId;

var session;

var sessions = [];

var item = localStorage.getItem("sessions");
var saved = item != null ? JSON.parse(item) : null;

if(saved && saved.push){
    sessions = saved;
}

chrome.browserAction.onClicked.addListener(function(tab) {
});

chrome.webNavigation.onCompleted.addListener(function(details) {

});

chrome.tabs.onCreated.addListener(function(tab) {         
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    onNewSessionStart(tabId);
});

chrome.tabs.onActivated.addListener(function(info){
    onNewSessionStart(info.tabId);
});

chrome.windows.onFocusChanged.addListener(function(window) {
    if (window == chrome.windows.WINDOW_ID_NONE) {
        onSessionEnd();
    }
    else if (activeTab){
        onSessionStart(activeTab.url);
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
        activeTabId = tabId;

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