import { PageLoadingEventResult, PageVisitedEventResult } from './service-worker';
import AsyncLock from 'async-lock';
import Timer, { START_TIMER_DELAY_MS } from './modules/timer';
import { delay } from './utils';

const lock = new AsyncLock();
const timer = new Timer();

init();
window.addEventListener('focus', () => startTimer('focus'));
window.addEventListener('blur', () => stopTimer('blur'));
window.addEventListener('beforeunload', () => stopTimer('beforeunload'));

// Listener for route changes in SPAs
window.navigation.addEventListener('navigate', () => {
    stopTimer('navigate');
    startTimer('navigate');
});

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
    startTimer('init');
}

function startTimer(source: string) {
    // This lock is needed since we're starting the timer asynchronously. If endTimer is called quickly after
    // startTimer, we need to wait for the timeout to be set before clearing it.
    lock.acquire('timer', async (done) => {
        if (timer.isRunning()) {
            console.log("[PageLimiter] not starting the timer because it's already running", {
                source,
            });
            done();
            return;
        }

        await delay(START_TIMER_DELAY_MS);

        if (!document.hasFocus()) {
            console.log("[PageLimiter] not starting the timer because tab isn't focused", {
                source,
            });
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
            console.log('[PageLimiter] not starting the timer because there was no match', {
                source,
            });
            done();
            return;
        }

        if (result.secondsLeft === 0) {
            blockPage();
            done();
            return;
        }

        timer.start(result.secondsLeft);
        console.log('[PageLimiter] timer started', { source });
        done();
    });
}

function stopTimer(source: string) {
    return lock.acquire('timer', async (done) => {
        if (!timer.isRunning()) {
            console.log("[PageLimiter] not stopping the timer because it isn't running", {
                source,
            });
            done();
            return;
        }

        try {
            await addTime(timer.stop());
            console.log('[PageLimiter] timer stopped', { source });
        } catch (error) {
            console.error('[PageLimiter] failed to add time after stopping the timer', error);
        } finally {
            done();
        }
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
