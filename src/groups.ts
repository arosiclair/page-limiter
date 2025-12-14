export function getSecondsLeft(group: Group | undefined) {
    if (!group) {
        return 0;
    }

    return Math.max(group.timelimitSeconds - getSecondsUsedToday(group), 0);
}

export function getSecondsUsedToday(group: Group) {
    return group.secondsUsed[getCurrentDate()] ?? 0;
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

    return patterns.find((pattern) => RegExp(pattern.toLowerCase()).test(testString.toLowerCase()));
}
