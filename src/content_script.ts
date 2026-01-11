import { PageLoadingEventResult, PageVisitedEventResult } from './service-worker';
import AsyncLock from 'async-lock';
import Timer, { START_TIMER_DELAY_MS } from './modules/timer';
import { delay } from './utils';

const lock = new AsyncLock();
const timer = new Timer();

init();
window.addEventListener('focus', startTimer);
window.addEventListener('blur', stopTimer);
window.addEventListener('beforeunload', stopTimer);

timer.onTimeout = async (secondsElapsed) => {
    console.log('[PageLimiter] timer expired');
    await addTime(secondsElapsed);
    blockPage();
};

chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
    console.log('message received', message);

    if (message.event !== 'block-page') {
        return;
    }

    blockPage();
});

async function init() {
    // Quickly fetch match results with no delay or locks to see if we should block this page immediately
    let result;
    try {
        const message: PageLoadingMessage = {
            source: 'content-script',
            event: 'page-loading',
            url: window.location.href,
        };
        result = (await chrome.runtime.sendMessage(message)) as PageLoadingEventResult;
    } catch (error) {
        console.error('failed to send page-visited message', error);
    }

    if (result?.didMatch && result?.secondsLeft === 0) {
        blockPage();
        return;
    }

    // If there was no match or there seems to be time left, start the timer normally
    startTimer();
}

function startTimer() {
    // This lock is needed since we're starting the timer asynchronously. If endTimer is called quickly after
    // startTimer, we need to wait for the timeout to be set before clearing it.
    lock.acquire('timer', async (done) => {
        if (timer.isRunning()) {
            console.log("[PageLimiter] not starting timer because it's already running");
            done();
            return;
        }

        await delay(START_TIMER_DELAY_MS);

        if (!document.hasFocus()) {
            console.log("[PageLimiter] not starting timer because tab isn't focused");
            done();
            return;
        }

        const message: PageVisitedMessage = {
            source: 'content-script',
            event: 'page-visited',
            url: window.location.href,
        };

        let result;
        try {
            result = (await chrome.runtime.sendMessage(message)) as PageVisitedEventResult;
        } catch (error) {
            console.error('failed to send page-visited message', error);
            done();
            return;
        }

        if (!result.didMatch) {
            done();
            return;
        }

        if (result.secondsLeft === 0) {
            blockPage();
            done();
            return;
        }

        timer.start(result.secondsLeft);
        console.log('[PageLimiter] timer started');
        done();
    });
}

function stopTimer() {
    return lock.acquire('timer', async (done) => {
        if (!timer.isRunning()) {
            console.log("[PageLimiter] not stopping timer because it isn't running");
            done();
            return;
        }

        await addTime(timer.stop());
        console.log('[PageLimiter] timer stopped');
        done();
    });
}

function addTime(secondsUsed: number) {
    const message: AddTimeMessage = {
        source: 'content-script',
        event: 'add-time',
        url: window.location.href,
        secondsUsed,
    };
    return chrome.runtime.sendMessage(message);
}

async function blockPage() {
    window.location.replace('https://0.0.0.0/');
}
