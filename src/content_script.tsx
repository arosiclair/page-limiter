import { millisecondsInSecond } from 'date-fns/constants';
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

let timeout: NodeJS.Timeout;

window.addEventListener('focus', sendPageVisitedMessage);
window.addEventListener('blur', sendPageLeftMessage);
window.addEventListener('beforeunload', sendPageLeftMessage);

function sendPageVisitedMessage() {
    chrome.runtime.sendMessage(
        {
            event: 'page-visited',
            url: window.location.href,
        },
        ({ didMatch, secondsLeft }: PageVisitedEventResult) => {
            if (!didMatch) {
                return;
            }

            if (secondsLeft === 0) {
                blockPage();
                return;
            }

            timeout = setTimeout(blockPage, secondsLeft * millisecondsInSecond);
        }
    );
}

function sendPageLeftMessage() {
    chrome.runtime.sendMessage({
        event: 'page-left',
        url: window.location.href,
    });
    clearTimeout(timeout);
}

function blockPage() {
    window.location.replace('https://0.0.0.0/');
}

// Pretend like this is a module so that typescript stops complaining about naming collisions
export default undefined;
