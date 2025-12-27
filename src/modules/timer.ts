import { differenceInSeconds } from 'date-fns';
import { millisecondsInSecond } from 'date-fns/constants';

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
