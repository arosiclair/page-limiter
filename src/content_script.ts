import { PageVisitedEventResult } from './service-worker';
import AsyncLock from 'async-lock';
import Timer, { START_TIMER_DELAY_MS } from './modules/timer';
const lock = new AsyncLock();
const timer = new Timer();

startTimer();
window.addEventListener('focus', startTimer);
window.addEventListener('blur', stopTimer);
window.addEventListener('beforeunload', stopTimer);

function startTimer() {
    if (!document.hasFocus()) {
        return;
    }

    // This lock is needed since we're starting the timer asynchronously. If endTimer is called quickly after
    // startTimer, we need to wait for the timeout to be set before clearing it.
    lock.acquire('timer', (done) => {
        if (timer.isRunning()) {
            done();
            return;
        }

        setTimeout(() => {
            const message: PageVisitedMessage = {
                source: 'content-script',
                event: 'page-visited',
                url: window.location.href,
            };

            chrome.runtime.sendMessage(
                message,
                ({ didMatch, secondsLeft }: PageVisitedEventResult) => {
                    if (!didMatch) {
                        done();
                        return;
                    }

                    if (secondsLeft === 0) {
                        blockPage();
                        done();
                        return;
                    }

                    timer.start(secondsLeft);
                    done();
                }
            );
        }, START_TIMER_DELAY_MS);
    });
}

function stopTimer() {
    lock.acquire('timer', (done) => {
        if (!timer.isRunning()) {
            done();
            return;
        }

        addTime(timer.stop());
        done();
    });
}

timer.onTimeout = (secondsElapsed) => {
    addTime(secondsElapsed);
    blockPage();
};

function addTime(secondsUsed: number) {
    const message: AddTimeMessage = {
        source: 'content-script',
        event: 'add-time',
        url: window.location.href,
        secondsUsed,
    };
    chrome.runtime.sendMessage(message);
}

function blockPage() {
    stopTimer();
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
