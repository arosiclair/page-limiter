chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.color) {
        console.log('Receive color = ' + msg.color);
        document.body.style.backgroundColor = msg.color;
        sendResponse('Change color to ' + msg.color);
    } else {
        sendResponse('Color message is none.');
    }
});

chrome.runtime.sendMessage({
    event: 'page-visited',
    url: window.location.href,
});
window.addEventListener('beforeunload', () => {
    chrome.runtime.sendMessage({
        event: 'page-left',
        url: window.location.href,
    });
});

window.addEventListener('focus', () => {
    chrome.runtime.sendMessage({
        event: 'page-visited',
        url: window.location.href,
    });
});
window.addEventListener('blur', () => {
    chrome.runtime.sendMessage({
        event: 'page-left',
        url: window.location.href,
    });
});
