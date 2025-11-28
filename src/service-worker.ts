import { getSettings, setURLGroups } from './settings';
import { findMatchingPattern, findMatchingGroup, getCurrentDate, getTotalSeconds } from './groups';

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    switch (message.event) {
        case 'page-visited':
            onPageVisited(message as PageVisitedMessage).then(sendResponse);
            return true;
        case 'page-left':
            onPageLeft(message as PageLeftMessage);
            break;
        default:
            console.log('Mysterious message received', message);
    }
});

export type PageVisitedEventResult = {
    didMatch: boolean;
    secondsLeft: number;
};

async function onPageVisited(message: PageVisitedMessage): Promise<PageVisitedEventResult> {
    console.log('Page visited', { message });
    const currentURL = message.url;
    const { groups, allowedPatterns } = await getSettings();

    const allowedPattern = findMatchingPattern(allowedPatterns ?? [], currentURL);
    if (allowedPattern) {
        console.log('Current page is allowed', { allowedPattern, currentURL });
        return { didMatch: false, secondsLeft: 0 };
    }

    if (!groups) {
        console.log('No urlGroups set', { currentURL });
        return { didMatch: false, secondsLeft: 0 };
    }

    const matchingGroup = findMatchingGroup(groups, currentURL);
    const didMatch = !!matchingGroup;
    if (!didMatch) {
        console.log("Current page doesn't match", { currentURL });
        return { didMatch, secondsLeft: 0 };
    }

    let todaysHistory = matchingGroup.history[getCurrentDate()];
    if (!todaysHistory) {
        todaysHistory = matchingGroup.history[getCurrentDate()] = [];
    }

    const lastHistoryEntry = todaysHistory.length
        ? todaysHistory[todaysHistory.length - 1]
        : ({} as HistoryEntry);
    if (lastHistoryEntry.start && !lastHistoryEntry.end) {
        console.log('Ending unfinished HistoryEntry', { todaysHistory });
        lastHistoryEntry.end = new Date().toISOString();
    }

    const secondsUsed = getTotalSeconds(todaysHistory);
    const secondsLeft = Math.max(matchingGroup.timelimitSeconds - secondsUsed, 0);
    if (secondsLeft === 0) {
        return { didMatch, secondsLeft };
    }

    todaysHistory.push({
        start: new Date().toISOString(),
    });

    await setURLGroups(groups);
    console.log('history entry started', { matchingGroup });

    return { didMatch, secondsLeft };
}

async function onPageLeft(message: PageLeftMessage) {
    console.log('Page left', { message });

    const currentURL = message.url;
    const { groups } = await getSettings();

    if (!groups) {
        console.log('No urlGroups set', { currentURL });
        return;
    }

    const matchingGroup = findMatchingGroup(groups, currentURL);
    if (!matchingGroup) {
        console.log("Current page doesn't match", { currentURL });
        return;
    }

    const todaysHistory = matchingGroup.history[getCurrentDate()];
    if (!todaysHistory) {
        console.error('Page matched but no history for today', { currentURL, matchingGroup });
        return;
    }

    const lastHistoryEntry = todaysHistory[todaysHistory.length - 1];
    if (lastHistoryEntry.end) {
        console.log('Last history entry is already finished', { matchingGroup });
        return;
    }

    lastHistoryEntry.end = new Date().toISOString();
    await setURLGroups(groups);
    console.log('history entry finished', { matchingGroup });
}
