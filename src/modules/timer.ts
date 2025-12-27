import { differenceInSeconds } from 'date-fns';
import { millisecondsInSecond } from 'date-fns/constants';

// When switching between the content script and the popup, sometimes one will fetch the time left before the other has
// time to update it. I'm using this delay to fix the race condition.
export const START_TIMER_DELAY_MS = 250;

export default class Timer {
    timeout: NodeJS.Timeout | undefined;
    startTime: Date | undefined;
    onTimeout: (secondsElapsed: number) => void;

    constructor() {
        this.timeout = undefined;
        this.startTime = undefined;
        this.onTimeout = () => {};
    }

    start(secondsLeft: number) {
        this.startTime = new Date();
        this.timeout = setTimeout(() => {
            this.onTimeout(this.stop());
        }, secondsLeft * millisecondsInSecond);
    }

    stop(): number {
        if (!this.startTime) {
            return 0;
        }

        const secondsElapsed = this.secondsElapsed();
        clearTimeout(this.timeout);
        this.startTime = undefined;
        return secondsElapsed;
    }

    isRunning() {
        return !!this.startTime;
    }

    secondsElapsed() {
        if (!this.startTime) {
            return 0;
        }

        return differenceInSeconds(new Date(), this.startTime);
    }
}
