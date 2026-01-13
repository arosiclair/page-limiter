import { millisecondsInDay, millisecondsInMinute } from 'date-fns/constants';

export function getSecondsLeft(group: Group | undefined, dailyResetTime: string) {
    if (!group) {
        return 0;
    }

    return Math.max(group.timelimitSeconds - getSecondsUsedToday(group, dailyResetTime), 0);
}

export function getSecondsUsedToday(group: Group, dailyResetTime: string) {
    return group.secondsUsed[getCurrentDate(dailyResetTime)] ?? 0;
}

export function getCurrentDate(dailyResetTime: string): string {
    const now = new Date();
    const offset = now.getTimezoneOffset();

    // Today including the local timezone offset
    let currentDateMilliseconds = now.getTime() - offset * millisecondsInMinute;

    // If the current time is before the daily reset time, push the currentDate back to yesterday
    const [dailyResetHour, dailyResetMinute] = dailyResetTime.split(':');
    if (
        now.getHours() < Number(dailyResetHour) ||
        (now.getHours() === Number(dailyResetHour) && now.getMinutes() < Number(dailyResetMinute))
    ) {
        currentDateMilliseconds -= millisecondsInDay;
    }

    const currentDate = new Date(currentDateMilliseconds);
    return currentDate.toISOString().split('T')[0];
}

export function findMatchingGroup(groups: Group[] | undefined, currentUrl: string) {
    if (!groups || !currentUrl) {
        return undefined;
    }

    for (const group of groups) {
        if (!findMatchingPattern(group.patterns, currentUrl)) {
            continue;
        }

        return group;
    }
}

export function findMatchingPattern(patterns: string[] | undefined, testString: string) {
    if (!patterns || !testString) {
        return undefined;
    }

    return patterns.find((pattern) => {
        let regexp;

        if (pattern.startsWith('/') && pattern.endsWith('/')) {
            regexp = RegExp(pattern.slice(1, pattern.length - 1), 'i');
        } else {
            regexp = RegExp(RegExp.escape(pattern), 'i');
        }

        return regexp.test(testString);
    });
}

// Workaround while RegExp.escap is not included in types - https://github.com/microsoft/TypeScript/issues/61321
declare global {
    interface RegExpConstructor {
        escape(str: string): string;
    }
}
