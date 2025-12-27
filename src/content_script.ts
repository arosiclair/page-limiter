import { millisecondsInSecond } from 'date-fns/constants';
import { PageVisitedEventResult } from './service-worker';
import { differenceInSeconds } from 'date-fns';
import AsyncLock from 'async-lock';

const lock = new AsyncLock();
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

    // This lock is needed since we're setting the timeout asynchronously. If endTimer is called quickly after
    // startTimer, we need to wait for the timeout to be set before clearing it.
    lock.acquire('timer', (done) => {
        chrome.runtime.sendMessage(message, ({ didMatch, secondsLeft }: PageVisitedEventResult) => {
            if (!didMatch) {
                done();
                return;
            }

            if (secondsLeft === 0) {
                blockPage();
                done();
                return;
            }

            timeout = setTimeout(blockPage, secondsLeft * millisecondsInSecond);
            done();
        });
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

    lock.acquire('timer', (done) => {
        clearTimeout(timeout);
        done();
    });
}

function blockPage() {
    endTimer();
    window.location.replace('https://0.0.0.0/');
}

chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
    console.log('message received', message);

    if (message.event !== 'block-page') {
        return;
    }

    blockPage();
});

// Pretend like this is a module so that typescript stops complaining about naming collisions
export default undefined;
