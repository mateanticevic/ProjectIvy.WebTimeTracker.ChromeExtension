var activeTab;
var activeTabId;

var currentUrl;

var session;

var sessions = [];

var item = localStorage.getItem("sessions");
var saved = item != null ? JSON.parse(item) : null;

var isBrowserActive = true;
var isUserActive = true;

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
        onSessionEnd();
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(tabId == activeTabId){

        currentUrl = tab.url;

        if(session && session.domain != urlToDomain(tab.url)){
            onSessionEnd();
            onSessionStart(tab.url);
        }
        else if(!session){
            onSessionStart(tab.url);
        }
    }
});

chrome.tabs.onActivated.addListener(function(info){

    chrome.tabs.get(info.tabId, function(tab){
        activeTab = tab;
        activeTabId = info.tabId;
        currentUrl = tab.url;

        if(session && session.domain != urlToDomain(tab.url)){
            onSessionEnd(); 
        }

        if(isHttp(tab.url) && !session){
            onSessionStart(tab.url);
        }
    });
});

chrome.windows.onFocusChanged.addListener(function(windowId) {

    if (windowId < 0) {
        isBrowserActive = false;
        onSessionEnd();
    }
    else if(windowId > 0){
        isBrowserActive = true;
        
        chrome.tabs.query({active: true, windowId: windowId}, function(tabs){
            var tab = tabs[0];
            activeTab = tab;
            activeTabId = tab.id;
            currentUrl = tab.url;
            onSessionStart(tab.url);       
        });
    }
});

chrome.idle.setDetectionInterval(15);

chrome.idle.onStateChanged.addListener(function(state){

    chrome.windows.getLastFocused(null, function(window){

        if(state == "active" && !session && window.focused){
            isUserActive = true;
            onSessionStart(currentUrl);
        }
        else if(state == "idle" || state == "locked" && session){
            isUserActive = false;
            onSessionEnd();
        }
    });
});

setInterval(function(){
    chrome.windows.getLastFocused(null, function(window){
        if(window.focused && !session && isUserActive){
            chrome.tabs.query({active: true, windowId: window.id}, function(tabs){
                var tab = tabs[0];
                onSessionStart(tab.url);
            });
        }
        else if(!window.focused && session){
            onSessionEnd();
        }
    });
}, 1000);

function newSession(url){
    return {
        start: new Date(),
        isSecured: isSecured(url),
        domain: urlToDomain(url)
    };
};

function onSessionStart(url){

    if(session){
        onSessionEnd();
    }

    if(isHttp(url)){
        session = new Session(url);
        console.log(urlToDomain(url));
    }
};

function onSessionEnd(){
    if(session){

        session.end();
        
        var duration = Math.abs(session.end - session.start) / 1000;

        if(duration > 1){
            sessions.push(session);
            localStorage.setItem("sessions", JSON.stringify(sessions));
            console.log("Session lasted for " + duration  + "s");
        }
        else{
            console.log("Sesssion too short.")
        }

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

    if(!url){
        return false;
    }

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

function sync(){

        var session = sessions[0];

        var data = {
            domain: session.domain,
            end: session.end,
            start: session.start,
            isSecured: session.isSecured
        };

        $.ajax({
            contentType: 'application/json',
            url: 'http://localhost:4680/device/acer-aspire-v5/browserLog',
            data: JSON.stringify(data),
            type: 'PUT',
            success: function(response) {
                console.log('uploaded');
                sessions.shift();
                if(sessions.length > 0){
                    sync();
                }
            }
        });
}

function Session(url){
    this.start = new Date();
    this.domain = urlToDomain(url);
    this.isSecured = isSecured(url);
}

Session.prototype.end = function() {
    this.end = new Date();
}