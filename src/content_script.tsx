import { millisecondsInSecond } from 'date-fns/constants';
import { PageVisitedEventResult } from './service-worker';
import { differenceInSeconds } from 'date-fns';

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
let startTime: Date | undefined;

startTimer();
window.addEventListener('focus', startTimer);
window.addEventListener('blur', endTimer);
window.addEventListener('beforeunload', endTimer);

function startTimer() {
    if (startTime) {
        return;
    }

    startTime = new Date();

    const message: PageVisitedMessage = {
        source: 'content-script',
        event: 'page-visited',
        url: window.location.href,
    };

    chrome.runtime.sendMessage(message, ({ didMatch, secondsLeft }: PageVisitedEventResult) => {
        if (!didMatch) {
            return;
        }

        if (secondsLeft === 0) {
            blockPage();
            return;
        }

        timeout = setTimeout(blockPage, secondsLeft * millisecondsInSecond);
    });
}

function endTimer() {
    if (!startTime) {
        return;
    }

    const message: AddTimeMessage = {
        source: 'content-script',
        event: 'add-time',
        url: window.location.href,
        secondsUsed: differenceInSeconds(new Date(), startTime),
    };

    chrome.runtime.sendMessage(message);
    startTime = undefined;
    clearTimeout(timeout);
}

function blockPage() {
    window.location.replace('https://0.0.0.0/');
}

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    console.log('Message received', message);

    if (message.event !== 'block-page') {
        return;
    }

    blockPage();
});

// Pretend like this is a module so that typescript stops complaining about naming collisions
export default undefined;
