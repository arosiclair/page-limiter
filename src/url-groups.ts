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

export function findMatchingGroup(urlGroups: UrlGroup[] | undefined, currentUrl: string) {
    if (!urlGroups || !currentUrl) {
        return undefined;
    }

    for (const urlGroup of urlGroups) {
        for (const url of urlGroup.urls) {
            if (!RegExp(url).test(currentUrl)) {
                continue;
            }

            return urlGroup;
        }
    }
}

export function findMatchingAllowedPattern(
    allowedPatterns: string[] | undefined,
    currentUrl: string
) {
    if (!allowedPatterns || !currentUrl) {
        return undefined;
    }

    return allowedPatterns.find((pattern) => RegExp(pattern).test(currentUrl));
}
