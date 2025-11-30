import { getSettings, setGroups } from './settings';
import { findMatchingPattern, findMatchingGroup, getCurrentDate, getSecondsLeft } from './groups';

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    console.log('Message received', message);
    switch (message.event) {
        case 'page-visited':
            onPageVisited(message as PageVisitedMessage).then(sendResponse);
            return true;
        case 'page-left':
            // onPageLeft(message as PageLeftMessage);
            break;
        case 'add-time':
            addTime(message as AddTimeMessage);
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
    return {
        didMatch: !!matchingGroup,
        secondsLeft: getSecondsLeft(matchingGroup),
    };
}

// async function onPageLeft(message: PageLeftMessage) {
//     console.log('Page left', { message });

//     const currentURL = message.url;
//     const { groups } = await getSettings();

//     if (!groups) {
//         console.log('No urlGroups set', { currentURL });
//         return;
//     }

//     const matchingGroup = findMatchingGroup(groups, currentURL);
//     if (!matchingGroup) {
//         console.log("Current page doesn't match", { currentURL });
//         return;
//     }

//     const todaysHistory = matchingGroup.history[getCurrentDate()];
//     if (!todaysHistory) {
//         console.error('Page matched but no history for today', { currentURL, matchingGroup });
//         return;
//     }

//     const lastHistoryEntry = todaysHistory[todaysHistory.length - 1];
//     if (lastHistoryEntry.end) {
//         console.log('Last history entry is already finished', { matchingGroup });
//         return;
//     }

//     lastHistoryEntry.end = new Date().toISOString();
//     await setURLGroups(groups);
//     console.log('history entry finished', { matchingGroup });
// }

async function addTime(message: AddTimeMessage) {
    const currentURL = message.url;
    const { groups, allowedPatterns } = await getSettings();

    if (!groups) {
        console.log('No urlGroups set', { currentURL });
        return;
    }

    const allowedPattern = findMatchingPattern(allowedPatterns ?? [], currentURL);
    if (allowedPattern) {
        console.log('Current page is allowed. No time added', { allowedPattern, currentURL });
        return;
    }

    const matchingGroup = findMatchingGroup(groups, currentURL);
    if (!matchingGroup) {
        console.log("Current page doesn't match", { currentURL });
        return;
    }

    matchingGroup.secondsUsed[getCurrentDate()] =
        (matchingGroup.secondsUsed[getCurrentDate()] ?? 0) + message.secondsUsed;

    await setGroups(groups);
    console.log('Time added', { matchingGroup });
}
