import { differenceInSeconds } from 'date-fns';

export function getTimeLeft(group: Group) {
    let todaysHistory = group.history[getCurrentDate()];
    if (!todaysHistory) {
        return group.timelimitSeconds;
    }

    return Math.max(group.timelimitSeconds - getTotalSeconds(todaysHistory), 0);
}

export function getTimeUsed(group: Group) {
    return getTotalSeconds(group.history[getCurrentDate()] ?? []);
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

export function findMatchingGroup(groups: Group[] | undefined, currentUrl: string) {
    if (!groups || !currentUrl) {
        return undefined;
    }

    for (const group of groups) {
        for (const pattern of group.patterns) {
            if (!RegExp(pattern).test(currentUrl)) {
                continue;
            }

            return group;
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
