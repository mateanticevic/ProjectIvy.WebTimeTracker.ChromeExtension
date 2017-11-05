var backgroundPage = chrome.extension.getBackgroundPage();
   

$(document).ready(function(){
    $("#tdSessions").html(backgroundPage.sessions.length);
    $("#tdTime").html(sumTime(backgroundPage.sessions));
});

function sumTime(sessions){
    var miliseconds = 0;
    sessions.map(x => miliseconds += new Date(x.end) - new Date(x.start));

    return parseInt(miliseconds/(60 * 1000)) + " min";
}