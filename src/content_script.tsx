import { PageVisitedEventResult } from './service-worker';

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.color) {
        console.log('Receive color = ' + msg.color);
        document.body.style.backgroundColor = msg.color;
        sendResponse('Change color to ' + msg.color);
    } else {
        sendResponse('Color message is none.');
    }
});

sendPageVisitedMessage();
window.addEventListener('beforeunload', () => {
    chrome.runtime.sendMessage({
        event: 'page-left',
        url: window.location.href,
    });
});

window.addEventListener('focus', sendPageVisitedMessage);
window.addEventListener('blur', () => {
    chrome.runtime.sendMessage({
        event: 'page-left',
        url: window.location.href,
    });
});

function sendPageVisitedMessage() {
    chrome.runtime.sendMessage(
        {
            event: 'page-visited',
            url: window.location.href,
        },
        (response: PageVisitedEventResult) => {
            console.log('onPageVisited', { response });
        }
    );
}

// Pretend like this is a module so that typescript stops complaining about naming collisions
export default undefined;
