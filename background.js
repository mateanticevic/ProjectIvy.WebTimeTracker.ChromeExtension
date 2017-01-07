chrome.browserAction.onClicked.addListener(function(tab) {
    console.log("click");
    alert();
});

chrome.webNavigation.onCompleted.addListener(function(details) {
    console.log("tab " + details.tabId + " loaded");
});

chrome.tabs.onCreated.addListener(function(tab) {         
   console.log("tab created");
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    chrome.tabs.get(tabId, function(tab){
        console.log(tab.url);
    });
});