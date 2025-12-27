import { differenceInSeconds } from 'date-fns';
import { millisecondsInSecond } from 'date-fns/constants';

export default class Timer {
    timeout: NodeJS.Timeout | undefined;
    startTime: Date | undefined;
    onTimeout: () => void;

    constructor() {
        this.timeout = undefined;
        this.startTime = undefined;
        this.onTimeout = () => {};
    }

    start(secondsLeft: number) {
        this.startTime = new Date();
        this.timeout = setTimeout(this.onTimeout, secondsLeft * millisecondsInSecond);
    }

    stop(): number {
        if (!this.startTime) {
            return 0;
        }

        const secondsElapsed = differenceInSeconds(new Date(), this.startTime);
        clearTimeout(this.timeout);
        this.startTime = undefined;
        return secondsElapsed;
    }

    isRunning() {
        return !!this.startTime;
    }
}
