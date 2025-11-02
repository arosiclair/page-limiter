import { differenceInSeconds } from 'date-fns';

export function getTimeLeft(urlGroup: UrlGroup) {
    let todaysHistory = urlGroup.history[getCurrentDate()];
    if (!todaysHistory) {
        return urlGroup.timelimitSeconds;
    }

    return Math.max(urlGroup.timelimitSeconds - getTotalSeconds(todaysHistory), 0);
}

export function getTimeUsed(urlGroup: UrlGroup) {
    return getTotalSeconds(urlGroup.history[getCurrentDate()] ?? []);
}

export function getTotalSeconds(history: HistoryEntry[]) {
    let totalSeconds = 0;
    for (const historyEntry of history) {
        if (!historyEntry.end) {
            continue;
        }

        totalSeconds += differenceInSeconds(historyEntry.end, historyEntry.start, {
            roundingMethod: 'ceil',
        });
    }

    return totalSeconds;
}

export function getCurrentDate(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const today = new Date(now.getTime() - offset * 60 * 1000);
    return today.toISOString().split('T')[0];
}
