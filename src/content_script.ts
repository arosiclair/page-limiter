import { PageVisitedEventResult } from './service-worker';
import AsyncLock from 'async-lock';
import Timer, { START_TIMER_DELAY_MS } from './modules/timer';

const lock = new AsyncLock();
const timer = new Timer();

startTimer();
window.addEventListener('focus', startTimer);
window.addEventListener('blur', () => stopTimer(true));
window.addEventListener('beforeunload', () => stopTimer());

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

function startTimer() {
    if (!document.hasFocus()) {
        console.log("[PageLimiter] not starting timer because tab isn't focused");
        return;
    }

    // This lock is needed since we're starting the timer asynchronously. If endTimer is called quickly after
    // startTimer, we need to wait for the timeout to be set before clearing it.
    lock.acquire('timer', (done) => {
        if (timer.isRunning()) {
            console.log("[PageLimiter] not starting timer because it's already running");
            done();
            return;
        }

        setTimeout(async () => {
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
        }, START_TIMER_DELAY_MS);
    });
}

function stopTimer(shouldConsiderAudio = false) {
    return lock.acquire('timer', async (done) => {
        if (!timer.isRunning()) {
            console.log("[PageLimiter] not stopping timer because it isn't running");
            done();
            return;
        }

        if (shouldConsiderAudio && isAudioPlaying()) {
            console.log('[PageLimiter] not stopping timer because audio is playing');
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
    await stopTimer();
    window.location.replace('https://0.0.0.0/');
}

function isAudioPlaying() {
    // Select all audio and video elements on the page
    const mediaElements = document.querySelectorAll('audio, video') as NodeListOf<HTMLMediaElement>;

    for (const media of mediaElements) {
        // Check if the media is:
        // 1. Not paused
        // 2. Not finished (ended)
        // 3. Ready to play (has data)
        // 4. Not muted
        // 5. Has a volume greater than 0
        if (
            !media.paused &&
            !media.ended &&
            media.readyState > 2 &&
            !media.muted &&
            media.volume > 0
        ) {
            return true;
        }
    }

    return false;
}
